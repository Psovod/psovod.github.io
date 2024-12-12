import { Injectable, signal, WritableSignal } from '@angular/core';
export interface _Component {
  name: string;
  summary: string;
  path: Thumbnail;
  // code: Array<CodeSnippet>;
}
export interface Thumbnail {
  desktop: string;
  mobile: string;
}
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
