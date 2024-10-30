import {Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {BirthdayTableComponent} from "./birthday-table/birthday-table.component";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {BirthdayDialogComponent} from "./birthday-dialog/birthday-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {MatFormField, MatFormFieldModule} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BirthdayTableComponent, MatIconButton, MatIcon, MatFormField, MatInput, FormsModule, MatFormFieldModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent{

  filterString: string | null = null;

  constructor(private dialog: MatDialog) {
  }
  onAdd(){
    this.dialog.open(BirthdayDialogComponent, {data: undefined});
  }
}
