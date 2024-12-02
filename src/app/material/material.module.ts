import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

@NgModule({
  declarations: [],
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatSlideToggleModule, MatToolbarModule, MatDividerModule, MatChipsModule],
  exports: [MatButtonModule, MatCardModule, MatIconModule, MatSlideToggleModule, MatToolbarModule, MatDividerModule, MatChipsModule],
  providers: [],
})
export class MaterialModule {}
