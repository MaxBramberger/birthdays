import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BirthdayTableComponent } from './birthday-table.component';

describe('BirthdayTableComponent', () => {
  let component: BirthdayTableComponent;
  let fixture: ComponentFixture<BirthdayTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BirthdayTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BirthdayTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
