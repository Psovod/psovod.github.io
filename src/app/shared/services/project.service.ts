import { Injectable, signal, WritableSignal } from '@angular/core';
export interface _Component {
  name: string;
  path: Thumbnail;
  _onlyView: OnlyView;
  _i18n: string;
  // code: Array<CodeSnippet>;
}
export interface Thumbnail {
  desktop: string | null;
  mobile: string | null;
}
export type OnlyView = 'desktop' | 'mobile' | 'both';
// export interface CodeSnippet {
//   title: string;
//   text: string;
//   language: 'HTML' | 'typescript' | 'javascript' | 'css';
// }
@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private _component: WritableSignal<_Component | null> = signal(null);

  public get component(): _Component | null {
    return this._component();
  }

  public set component(value: _Component) {
    this._component.set(value);
  }
}
