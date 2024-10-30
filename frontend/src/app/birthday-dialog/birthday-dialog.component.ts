import {Component, Inject} from '@angular/core';
import {MatCard, MatCardActions, MatCardContent} from "@angular/material/card";
import {MatFormField, MatFormFieldModule} from "@angular/material/form-field";
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogRef} from "@angular/material/dialog";
import {Birthday} from "../birthday-table/birthday-table.component";
import {FormsModule} from "@angular/forms";
import { MatDatepickerModule} from "@angular/material/datepicker";
import {MomentDateAdapter } from "@angular/material-moment-adapter";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
} from "@angular/material/core";
import {MatInputModule} from "@angular/material/input";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {BirthdayService} from "../service/birthday.service";

const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YYYY',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  }
};

@Component({
  imports: [
    MatCard,
    MatCardContent,
    MatFormField,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    FormsModule,
    MatDialogActions,
    MatCardActions,
    MatButton,
    MatIconButton,
    MatIcon
  ],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS},
  ],
  selector: 'app-birthday-dialog',
  standalone: true,
  styleUrl: './birthday-dialog.component.scss',
  templateUrl: './birthday-dialog.component.html'
})
export class BirthdayDialogComponent {

  first_name: string = '';
  last_name: string = '';
  id: number | undefined;

  birthdayMomentPrivate: object | null = null

  set birthday(birthdayString: string | null){
    if(birthdayString !== null){
      const split = birthdayString.split('.');
      const day = parseInt(split[0]);
      const month = parseInt(split[1]) - 1;
      const year = parseInt(split[2]);
      this.birthdayMomentPrivate = this.momentDateAdapter.createDate(year, month, day)
    } else {
      this.birthdayMomentPrivate = null
    }
  }

  get birthday(){
    if(this.birthdayMomentPrivate !== null){
      const day = this.momentDateAdapter.getDate(this.birthdayMomentPrivate as any);
      const month = this.momentDateAdapter.getMonth(this.birthdayMomentPrivate as any) + 1;
      const year = this.momentDateAdapter.getYear(this.birthdayMomentPrivate as any);
      return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`
    } else {
      return null;
    }
  }


  constructor(private dialogRef: MatDialogRef<BirthdayDialogComponent>,
              private birthdayService: BirthdayService,
              private momentDateAdapter: DateAdapter<any>,
              @Inject(MAT_DIALOG_DATA) data?: Birthday) {
    if(data){
      this.id = data.id;
      this.first_name = data.first_name;
      this.last_name = data.last_name;
      this.birthday = data.birthday
    }
  }

  cancel(): void {
    this.dialogRef.close(); // Close the dialog without saving
  }

  confirm(): void {
    if(this.birthday){
      if(this.id === undefined){
        this.birthdayService.addBirthday(
            {
              birthday: this.birthday,
              last_name: this.last_name,
              first_name: this.first_name
            }
          )
      } else {
        this.birthdayService.updateBirthday({
          id: this.id,
          birthday: this.birthday,
          last_name: this.last_name,
          first_name: this.first_name
        })
      }
      this.dialogRef.close(); // Close the dialog and pass the result
    }
  }

  isFormValid(): boolean {
    console.log(this.birthday)
    return this.first_name.trim() !== '' &&
        this.last_name.trim() !== '' &&
        this.isDateValid(this.birthday);
  }

  private isDateValid(date: string | null): boolean {
    return date !== null;
  }

}
