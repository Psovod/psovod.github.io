import { RecipeColorKey } from '../models/recipe.types';
import {
  RecipeDraft,
  RecipeDraftSection,
  RecipeDraftSectionItem,
  RecipeDraftStep,
  RecipeDraftStepTimer,
} from '../services/recipe-author.service';
import { parseQty } from './qty-parse';

export interface ParseError {
  line: number;
  message: string;
}

export interface ParseResult {
  draft: RecipeDraft;
  errors: ParseError[];
}

const VALID_COLORS: RecipeColorKey[] = ['mustard', 'terracotta', 'burgundy', 'sage', 'slate', 'plum'];

type BlockType = 'meta' | 'ingredients' | 'prep' | 'cook';

interface Block {
  type: BlockType;
  label: string | null;
  lines: Array<{ text: string; lineNum: number }>;
}

function normaliseName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Returns true if `phrase` appears inside `normName` at proper word boundaries.
 * Handles both prefix matches ("red" in "red onion, finely diced")
 * and suffix/embedded matches ("avocados" in "ripe avocados").
 */
function nameMatchesPhrase(normName: string, phrase: string): boolean {
  const idx = normName.indexOf(phrase);
  if (idx === -1) return false;
  const before = idx > 0 ? normName[idx - 1] : undefined;
  const after = normName[idx + phrase.length];
  return (!before || !/[\p{L}\p{N}]/u.test(before)) &&
         (!after  || !/[\p{L}\p{N}]/u.test(after));
}

export function parseRecipeText(raw: string): ParseResult {
  const errors: ParseError[] = [];
  const lines = raw.split('\n');

  // --- Pass 1: split into blocks ---
  const blocks: Block[] = [{ type: 'meta', label: null, lines: [] }];

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];

    const blockMatch = line.match(/^##\s+(.+)$/);
    if (blockMatch) {
      const heading = blockMatch[1].trim();
      const ingWithLabel = heading.match(/^Ingredients:\s*(.+)$/i);
      const ingNoLabel = /^Ingredients$/i.test(heading);
      const isPrep = /^Prep$/i.test(heading);
      const isCook = /^Cook$/i.test(heading);

      if (ingWithLabel) {
        blocks.push({ type: 'ingredients', label: ingWithLabel[1].trim(), lines: [] });
      } else if (ingNoLabel) {
        blocks.push({ type: 'ingredients', label: null, lines: [] });
      } else if (isPrep) {
        blocks.push({ type: 'prep', label: null, lines: [] });
      } else if (isCook) {
        blocks.push({ type: 'cook', label: null, lines: [] });
      } else {
        errors.push({ line: lineNum, message: `Unknown block heading: "${heading}" — skipped` });
      }
      continue;
    }

    if (line.trim()) {
      blocks[blocks.length - 1].lines.push({ text: line, lineNum });
    }
  }

  // --- Pass 2: parse metadata ---
  let label = '';
  let baseServings = 2;
  let color: RecipeColorKey = 'terracotta';
  let emoji: string | undefined;
  let externalUrl: string | undefined;

  const metaBlock = blocks.find(b => b.type === 'meta');
  if (metaBlock) {
    for (const { text, lineNum } of metaBlock.lines) {
      const m = text.match(/^#\s*([^:]+):\s*(.+)$/);
      if (!m) continue;
      const key = m[1].trim().toLowerCase();
      const val = m[2].trim();

      if (key === 'name') {
        label = val;
      } else if (key === 'servings') {
        const n = parseInt(val, 10);
        if (Number.isNaN(n) || n < 1) {
          errors.push({ line: lineNum, message: `Invalid servings "${val}", defaulting to 2` });
        } else {
          baseServings = n;
        }
      } else if (key === 'color') {
        const c = val.toLowerCase() as RecipeColorKey;
        if (VALID_COLORS.includes(c)) {
          color = c;
        } else {
          errors.push({ line: lineNum, message: `Unknown color "${val}", defaulting to terracotta` });
        }
      } else if (key === 'emoji') {
        emoji = val.trim();
      } else if (key === 'url') {
        externalUrl = val;
      }
    }
  }

  // --- Pass 3: parse ingredient sections ---
  const sections: RecipeDraftSection[] = [];

  for (const block of blocks.filter(b => b.type === 'ingredients')) {
    const items: RecipeDraftSectionItem[] = [];
    for (const { text, lineNum } of block.lines) {
      const m = text.match(/^-\s*(.+)$/);
      if (!m) continue;

      const content = m[1];
      const colonIdx = content.indexOf(':');
      let name: string;
      let qtyStr: string;

      if (colonIdx === -1) {
        name = content.trim();
        qtyStr = '';
      } else {
        qtyStr = content.slice(0, colonIdx).trim();
        name = content.slice(colonIdx + 1).trim();
      }

      if (!name) {
        errors.push({ line: lineNum, message: `Ingredient line has no name — skipped` });
        continue;
      }

      // Strip prep notes after first comma: "red onion, finely diced" → "red onion"
      const commaIdx = name.indexOf(',');
      if (commaIdx > 0) name = name.slice(0, commaIdx).trim();

      if (!qtyStr) {
        items.push({ name });
        continue;
      }

      const parsed = parseQty(qtyStr);
      if (parsed.raw !== undefined && parsed.qty === undefined) {
        items.push({ name, raw: qtyStr });
      } else {
        items.push({ name, qty: parsed.qty, unit: parsed.unit, raw: parsed.raw });
      }
    }
    sections.push({ label: block.label, items });
  }

  if (sections.length === 0) {
    sections.push({ label: null, items: [] });
  }

  // --- Build ingredient ref lookup ---
  const refMap = new Map<string, string>();
  for (let si = 0; si < sections.length; si++) {
    for (let ii = 0; ii < sections[si].items.length; ii++) {
      const key = normaliseName(sections[si].items[ii].name);
      if (!refMap.has(key)) refMap.set(key, `draft:${si}:${ii}`);
    }
  }

  // Sorted longest-first for greedy longest-match
  const sortedIngNames = Array.from(refMap.keys()).sort((a, b) => b.length - a.length);

  function autoCreate(name: string): string {
    const key = normaliseName(name);
    let ref = refMap.get(key);
    if (!ref) {
      const si = 0;
      const ii = sections[si].items.length;
      sections[si].items.push({ name });
      ref = `draft:${si}:${ii}`;
      refMap.set(key, ref);
      // Insert maintaining sort order
      const pos = sortedIngNames.findIndex(n => n.length <= key.length);
      if (pos === -1) sortedIngNames.push(key);
      else sortedIngNames.splice(pos, 0, key);
    }
    return ref;
  }

  // --- Pass 4: parse steps ---
  const steps: RecipeDraftStep[] = [];
  const TIMER_RE = /\[timer:\s*([^\],]+),\s*(\d+(?:\.\d+)?)min\]/gi;

  let prepOrder = 0;
  let cookOrder = 0;

  for (const block of blocks.filter(b => b.type === 'prep' || b.type === 'cook')) {
    const phase = block.type as 'prep' | 'cook';

    for (const { text } of block.lines) {
      const stepMatch = text.match(/^\d+\.\s*(.+)$/);
      if (!stepMatch) continue;

      let stepText = stepMatch[1];

      // Extract timers
      const timers: RecipeDraftStepTimer[] = [];
      let timerMatch: RegExpExecArray | null;
      TIMER_RE.lastIndex = 0;
      while ((timerMatch = TIMER_RE.exec(stepText)) !== null) {
        timers.push({ label: timerMatch[1].trim(), minutes: parseFloat(timerMatch[2]) });
      }
      stepText = stepText.replace(TIMER_RE, '').trim();

      // Positional scan for @refs — unicode-aware, longest-match against known ingredients
      const ingredientRefs: string[] = [];
      let rp = 0;

      while (rp < stepText.length) {
        if (stepText[rp] !== '@') { rp++; continue; }
        // Skip if preceded by a letter (email address etc.)
        if (rp > 0 && /\p{L}/u.test(stepText[rp - 1])) { rp++; continue; }

        const after = stepText.slice(rp + 1);
        let matchRef: string | null = null;
        let matchLen = 0;

        // 1. Exact longest-match: try each known ingredient name (longest first)
        for (const normName of sortedIngNames) {
          if (after.length < normName.length) continue;
          if (normaliseName(after.slice(0, normName.length)) === normName) {
            const ch = after[normName.length];
            if (!ch || !/[\p{L}\p{N}]/u.test(ch)) {
              matchRef = refMap.get(normName)!;
              matchLen = normName.length;
              break;
            }
          }
        }

        // 2. Fuzzy match: build phrase word-by-word, find the longest phrase that
        //    appears inside any known ingredient name at a word boundary.
        //    This handles "@red onion" → "red onion, finely diced"
        //    and "@avocados" → "ripe avocados".
        if (!matchRef) {
          const words: string[] = [];
          let sp = 0;
          let bestRef: string | null = null;
          let bestSp = 0;

          for (let wc = 0; wc < 5; wc++) {
            if (wc > 0) {
              if (sp < after.length && after[sp] === ' ') sp++;
              else break;
            }
            const wm = after.slice(sp).match(/^[\p{L}\p{N}\-]+/u);
            if (!wm) break;
            words.push(wm[0]);
            sp += wm[0].length;
            const phrase = normaliseName(words.join(' '));
            for (const normName of sortedIngNames) {
              if (nameMatchesPhrase(normName, phrase)) {
                bestRef = refMap.get(normName)!;
                bestSp = sp;
                break; // sortedIngNames is longest-first → first hit per phrase is best
              }
            }
          }

          if (bestRef) {
            matchRef = bestRef;
            matchLen = bestSp;
          }
        }

        // 3. Auto-create: no match found — use first word only
        if (!matchRef) {
          const wm = after.match(/^[\p{L}\p{N}\-]+/u);
          if (wm) {
            matchRef = autoCreate(wm[0]);
            matchLen = wm[0].length;
          }
        }

        if (matchRef && !ingredientRefs.includes(matchRef)) {
          ingredientRefs.push(matchRef);
        }
        rp += 1 + (matchLen || 1);
      }

      // Remove @ markers from the display text, keep the ingredient word
      stepText = stepText.replace(/(?<!\p{L})@(?=\p{L})/gu, '');

      const order = phase === 'prep' ? prepOrder++ : cookOrder++;
      steps.push({ phase, order, text: stepText, ingredientRefs, timers });
    }
  }

  // Re-assign order: prep steps first, then cook
  let globalOrder = 0;
  for (const s of steps.filter(s => s.phase === 'prep')) s.order = globalOrder++;
  for (const s of steps.filter(s => s.phase === 'cook')) s.order = globalOrder++;

  const draft: RecipeDraft = {
    id: '',
    label,
    color,
    emoji,
    externalUrl,
    baseServings,
    sortOrder: 999,
    sections,
    steps,
  };

  return { draft, errors };
}
