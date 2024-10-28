import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable, MatTableDataSource,
  MatTableModule
} from '@angular/material/table';
import {from, Observable} from "rxjs";
import {invoke} from "@tauri-apps/api/core";
import {MatSort, MatSortHeader, MatSortModule} from "@angular/material/sort";

interface Birthday {
  id: number,
  first_name: string,
  last_name: string,
  birthday: string,
}

@Component({
  selector: 'app-birthday-table',
  standalone: true,
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatCellDef,
    MatHeaderCellDef,
    MatHeaderRow,
    MatRow,
    MatRowDef,
    MatHeaderRowDef,
    MatSortHeader,
    MatSort,
    MatSortModule,
    MatTableModule
  ],
  templateUrl: './birthday-table.component.html',
  styleUrl: './birthday-table.component.scss'
})
export class BirthdayTableComponent implements OnInit, AfterViewInit {
  displayedColumns = ["first_name", "last_name", "birthday"];
  dataSource= new MatTableDataSource<Birthday>()

  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  ngOnInit() {
    this.getBirthdays().subscribe( birthdays => {
      this.dataSource.data = birthdays;
      console.log(birthdays)}
    )
  }

  // Method to get all birthdays from the backend
  getBirthdays(): Observable<Birthday[]> {
    // Use 'from' to convert the promise to an observable
    return from(invoke<Birthday[]>('get_birthdays'));
  }
}
