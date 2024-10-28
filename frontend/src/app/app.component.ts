import {Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {BirthdayTableComponent} from "./birthday-table/birthday-table.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BirthdayTableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent{
}
