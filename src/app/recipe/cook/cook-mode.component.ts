import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { MaterialModule } from '../../material/material.module';
import { RecipeCatalogService } from '../services/recipe-catalog.service';
import { Recipe, RecipeStep, StepPhase } from '../models/recipe.types';

interface RunningTimer {
  stepId: number;
  timerIdx: number;
  label: string;
  /** epoch ms at which it will hit zero */
  endAt: number;
  /** total duration in seconds */
  total: number;
  finished: boolean;
}

interface StepViewModel {
  step: RecipeStep;
  phase: StepPhase;
  phaseIndex: number;
  globalIndex: number;
  ingredientNames: string[];
}

@Component({
  selector: 'app-cook-mode',
  imports: [CommonModule, RouterLink, MaterialModule, TranslatePipe],
  templateUrl: './cook-mode.component.html',
  styleUrl: './cook-mode.component.scss',
})
export class CookModeComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly catalog = inject(RecipeCatalogService);

  private readonly paramMap = toSignal(this.route.paramMap);

  // tick signal drives timer countdown updates.
  private readonly now = signal(Date.now());
  private tickHandle: ReturnType<typeof setInterval> | null = null;
  private wakeLock: WakeLockSentinel | null = null;

  public readonly stepIndex = signal(0);
  public readonly timers = signal<RunningTimer[]>([]);

  public readonly recipe = computed<Recipe | undefined>(() => {
    const id = this.paramMap()?.get('id');
    if (!id) return undefined;
    return this.catalog.byId().get(id);
  });

  public readonly steps = computed<StepViewModel[]>(() => {
    const r = this.recipe();
    if (!r) return [];
    const nameById = new Map<number, string>();
    for (const section of r.sections) {
      for (const item of section.items) {
        if (item.id != null) nameById.set(item.id, item.name);
      }
    }
    const prep = r.steps.filter((s) => s.phase === 'prep');
    const cook = r.steps.filter((s) => s.phase === 'cook');
    const ordered = [...prep, ...cook];
    let prepIdx = 0;
    let cookIdx = 0;
    return ordered.map((s, i) => {
      const phaseIndex = s.phase === 'prep' ? ++prepIdx : ++cookIdx;
      return {
        step: s,
        phase: s.phase,
        phaseIndex,
        globalIndex: i,
        ingredientNames: s.ingredientIds
          .map((id) => nameById.get(id))
          .filter((x): x is string => !!x),
      };
    });
  });

  public readonly currentStep = computed(() => this.steps()[this.stepIndex()]);

  public readonly phaseCount = computed(() => {
    const current = this.currentStep();
    if (!current) return { current: 0, total: 0 };
    const inPhase = this.steps().filter((s) => s.phase === current.phase);
    return { current: current.phaseIndex, total: inPhase.length };
  });

  public readonly totalSteps = computed(() => this.steps().length);

  constructor() {
    this.tickHandle = setInterval(() => this.now.set(Date.now()), 250);
    this.destroyRef.onDestroy(() => {
      if (this.tickHandle) clearInterval(this.tickHandle);
      this.releaseWakeLock();
    });
    void this.acquireWakeLock();

    // Re-acquire wake lock when the tab comes back to foreground.
    document.addEventListener('visibilitychange', this.onVisibility);
    this.destroyRef.onDestroy(() =>
      document.removeEventListener('visibilitychange', this.onVisibility),
    );
  }

  private readonly onVisibility = (): void => {
    if (document.visibilityState === 'visible' && !this.wakeLock) {
      void this.acquireWakeLock();
    }
  };

  private async acquireWakeLock(): Promise<void> {
    const nav = navigator as Navigator & { wakeLock?: { request(type: 'screen'): Promise<WakeLockSentinel> } };
    if (!nav.wakeLock) return;
    try {
      this.wakeLock = await nav.wakeLock.request('screen');
      this.wakeLock.addEventListener('release', () => {
        this.wakeLock = null;
      });
    } catch {
      // user may have denied, or browser unsupported — silently drop.
    }
  }

  private releaseWakeLock(): void {
    if (this.wakeLock) {
      void this.wakeLock.release();
      this.wakeLock = null;
    }
  }

  public prev(): void {
    this.stepIndex.update((i) => Math.max(0, i - 1));
  }

  public next(): void {
    this.stepIndex.update((i) => Math.min(this.totalSteps() - 1, i + 1));
  }

  public exit(): void {
    const r = this.recipe();
    if (r) {
      this.router.navigate(['/recipes', r.id]);
    } else {
      this.router.navigate(['/recipes']);
    }
  }

  public remainingSeconds(t: RunningTimer): number {
    return Math.max(0, Math.ceil((t.endAt - this.now()) / 1000));
  }

  public formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  public findRunning(stepId: number, timerIdx: number): RunningTimer | undefined {
    return this.timers().find((t) => t.stepId === stepId && t.timerIdx === timerIdx);
  }

  public startTimer(stepId: number, timerIdx: number, minutes: number, label: string): void {
    const total = minutes * 60;
    const endAt = Date.now() + total * 1000;
    this.timers.update((list) => {
      const next = list.filter((t) => !(t.stepId === stepId && t.timerIdx === timerIdx));
      next.push({ stepId, timerIdx, label, endAt, total, finished: false });
      return next;
    });
  }

  public stopTimer(stepId: number, timerIdx: number): void {
    this.timers.update((list) =>
      list.filter((t) => !(t.stepId === stepId && t.timerIdx === timerIdx)),
    );
  }

  public isFinished(t: RunningTimer): boolean {
    return this.remainingSeconds(t) === 0;
  }

  public checkAndBeep(t: RunningTimer): void {
    if (this.isFinished(t) && !t.finished) {
      t.finished = true;
      this.beep();
    }
  }

  private beep(): void {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.value = 0.12;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => {
        o.stop();
        void ctx.close();
      }, 650);
    } catch {
      // No audio context — silent fallback.
    }
  }
}
