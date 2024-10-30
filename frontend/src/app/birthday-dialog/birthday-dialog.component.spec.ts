import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BirthdayDialogComponent } from './birthday-dialog.component';

describe('BirthdayDialogComponent', () => {
  let component: BirthdayDialogComponent;
  let fixture: ComponentFixture<BirthdayDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BirthdayDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BirthdayDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
