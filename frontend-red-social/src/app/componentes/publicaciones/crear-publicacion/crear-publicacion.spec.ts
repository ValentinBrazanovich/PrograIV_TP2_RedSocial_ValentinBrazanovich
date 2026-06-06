import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPublicacion } from './crear-publicacion';

describe('CrearPublicacion', () => {
  let component: CrearPublicacion;
  let fixture: ComponentFixture<CrearPublicacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearPublicacion],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearPublicacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
