import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BirdrockresComponent } from './birdrockres.component';

describe('BirdrockresComponent', () => {
  let component: BirdrockresComponent;
  let fixture: ComponentFixture<BirdrockresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BirdrockresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BirdrockresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
