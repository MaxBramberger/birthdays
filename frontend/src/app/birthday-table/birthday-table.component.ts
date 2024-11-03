import {AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
  MatTableModule
} from '@angular/material/table';
import {MatSort, MatSortHeader, MatSortModule} from "@angular/material/sort";
import {BirthdayService, getDayMonthYearFromBirthdayString} from "../service/birthday.service";
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

interface FilterObject{
  showAll: 'showAll' | 'showClose';
  filterString: string | null;
}

// returns true if date has identical month than today or if the date distance is smaller equal 14 days
function dateModuloFilter(a: Birthday){
  const today = new Date()

  const dayMonthYear =getDayMonthYearFromBirthdayString(a.birthday);
  const monthDiff = dayMonthYear.month - today.getMonth() - 1;

  if(Math.abs(monthDiff) > 1){
    return false;
  } else if (monthDiff > 0){
    const dayDistance = dayMonthYear.day + 31 - today.getDay();
    return dayDistance <= 7;
  } else if (monthDiff < 0){
      const dayDistance = today.getDay() + 31 - dayMonthYear.day
      return dayDistance <= 7;
  } else {
    return true;
  }

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

  @Input() filterString: string | null = null;
  @Input() showAll: 'showAll' | 'showClose' = 'showClose';

  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.setDataSourceSortingAccessor();
    this.dataSource.filterPredicate = (data: Birthday, filterString: string) => {
      const filterObject : FilterObject = JSON.parse(filterString);
      const compareString = `${data.first_name} ${data.last_name}`.toLowerCase()
      const filterStringOk = filterObject.filterString ? compareString.includes(filterObject.filterString.toLowerCase()): true
      if(filterObject.showAll == 'showAll'){
        return filterStringOk;
      } else {
        return dateModuloFilter(data) && filterStringOk;
      }
    }
    const filterObject: FilterObject = {
      filterString: this.filterString === null ? '' : this.filterString, showAll: this.showAll
    }
    this.dataSource.filter = JSON.stringify(filterObject)
  }

  constructor(private birthdayService: BirthdayService, private dialog: MatDialog) {
    this.birthdayService.getBirthdayTable$().subscribe( birthdays => {
      this.dataSource.data = birthdays;
      this.dataSource.filter
    })
  }

  onEdit(birthday: Birthday){
    this.dialog.open(BirthdayDialogComponent, {data: birthday})
  }

  onDelete(birthday: Birthday){
    this.birthdayService.deleteBirthday(birthday)
  }

  ngOnChanges(_: SimpleChanges) {
      const filterObject: FilterObject = {
        filterString: this.filterString === null ? '' : this.filterString, showAll: this.showAll
      }
      this.dataSource.filter = JSON.stringify(filterObject)
  }

  setDataSourceSortingAccessor(){
    this.dataSource.sortingDataAccessor = (row: Birthday, sortHeaderId) => {
      if(sortHeaderId === 'first_name'  || sortHeaderId === 'last_name'){
        return row[sortHeaderId]
      } else if (sortHeaderId === 'birthday') {
        const dayMonthYear = getDayMonthYearFromBirthdayString(row.birthday);
        return  dayMonthYear.day + 100*dayMonthYear.month;
      }
      else {
        return '';
      }
    }
  }
}
