import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectComponentComponent } from './inspect-component.component';

describe('InspectComponentComponent', () => {
  let component: InspectComponentComponent;
  let fixture: ComponentFixture<InspectComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspectComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InspectComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
