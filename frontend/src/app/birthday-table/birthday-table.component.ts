import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable, MatTableDataSource,
  MatTableModule
} from '@angular/material/table';
import {MatSort, MatSortHeader, MatSortModule} from "@angular/material/sort";
import {BirthdayService} from "../service/birthday.service";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatDialog} from "@angular/material/dialog";
import {BirthdayDialogComponent} from "../birthday-dialog/birthday-dialog.component";

export interface Birthday {
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
    MatTableModule,
    MatIconButton,
    MatIcon
  ],
  templateUrl: './birthday-table.component.html',
  styleUrl: './birthday-table.component.scss'
})
export class BirthdayTableComponent implements AfterViewInit, OnChanges {
  displayedColumns = ["first_name", "last_name", "birthday", "edit", "delete"];
  dataSource= new MatTableDataSource<Birthday>()

  @Input() filterString: string | null = null

  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: Birthday, filterString: string) => {
      const compareString = `${data.first_name} ${data.last_name}`.toLowerCase()
      return compareString.includes(filterString.toLowerCase())
    }
  }

  constructor(private birthdayService: BirthdayService, private dialog: MatDialog) {
    this.birthdayService.getBirthdayTable$().subscribe( birthdays => {
      this.dataSource.data = birthdays;
    })
  }

  onEdit(birthday: Birthday){
    this.dialog.open(BirthdayDialogComponent, {data: birthday})
  }

  onDelete(birthday: Birthday){
    this.birthdayService.deleteBirthday(birthday)
  }

  ngOnChanges(_: SimpleChanges) {
    if(this.filterString!=null){
      this.dataSource.filter = this.filterString
    }
  }
}
