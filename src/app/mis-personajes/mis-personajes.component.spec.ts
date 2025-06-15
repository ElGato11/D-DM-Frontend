import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisPersonajesComponent } from './mis-personajes.component';

describe('MisPersonajesComponent', () => {
  let component: MisPersonajesComponent;
  let fixture: ComponentFixture<MisPersonajesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisPersonajesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MisPersonajesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
