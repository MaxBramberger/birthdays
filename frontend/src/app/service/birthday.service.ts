import {Injectable} from '@angular/core';
import {BehaviorSubject, from} from "rxjs";
import {Birthday} from "../birthday-table/birthday-table.component";
import {invoke} from "@tauri-apps/api/core";
import {save} from '@tauri-apps/plugin-dialog';

@Injectable({
  providedIn: 'root'
})
export class BirthdayService {

  private birthdayTable$: BehaviorSubject<Birthday[]> = new BehaviorSubject<Birthday[]>([]);

  private loading$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.updateBirthdayTable().then();
  }

  getBirthdayTable$(){
    return this.birthdayTable$.asObservable();
  }

  getLoading$(){
      return this.loading$.asObservable();
  }

  async updateBirthdayTable(){
    this.loading$.next(true);
    const birthdays = await invoke<Birthday[]>('get_birthdays');
    birthdays.sort((a, b) => {
        const dayMonthYearA = getDayMonthYearFromBirthdayString(a.birthday);
        const dayMonthYearB = getDayMonthYearFromBirthdayString(b.birthday);
        return  dayMonthYearB.day + 100*dayMonthYearB.month - dayMonthYearA.day - 100*dayMonthYearA.month;
    })
    this.birthdayTable$.next(birthdays);
    this.loading$.next(false);
  }

  addBirthday(birthdayIn: Omit<Birthday, 'id'>){
    from(invoke("add_birthday", {firstName: birthdayIn.first_name, lastName: birthdayIn.last_name, birthday: birthdayIn.birthday})).subscribe(
        () => {
          this.updateBirthdayTable().then();
        }
    )
  }

  updateBirthday(birthday: Birthday) {
    from(invoke("update_birthday", {id: birthday.id, firstName: birthday.first_name, lastName: birthday.last_name, birthday: birthday.birthday})).subscribe(
        () => {
          this.updateBirthdayTable().then();
        }
    )
  }

  deleteBirthday(birthday: Birthday){
    from(invoke("delete_birthday", {id: birthday.id})).subscribe(
        () => {
          this.updateBirthdayTable().then();
        }
    )
  }

  async exportToFile(){
      try {
          // Open a save dialog to select the location and file name
          const filePath = await save({
              title: 'Save Birthday List',
              defaultPath: 'birthdays.csv',
              filters: [
                  { name: 'CSV Files', extensions: ['csv'] },
                  { name: 'All Files', extensions: ['*'] },
              ],
          });

          // Check if the user selected a file path
          if (filePath) {
              // Send the file path and birthday data to the backend
              await invoke('file_export', { filePath:filePath });
              console.log('Birthdays exported successfully.');
          } else {
              console.log('No file path was chosen.');
          }
      } catch (error) {
          console.error('Failed to export birthdays:', error);
      }
  }

  async importFile(fileContent: string){
    try {
        this.loading$.next(true);
        await invoke('file_import', { parseFileContent: fileContent }).then(() =>this.updateBirthdayTable());
        this.loading$.next(false);
    } catch (error) {
        console.log(error);
    }
  }
}

export function getDayMonthYearFromBirthdayString(birthday: string): DayMonthYear {
    const split = birthday.split('.');
    return {
        day: parseInt(split[0]),
        month: parseInt(split[1]),
        year: parseInt(split[2])
    }
}

export interface DayMonthYear {
    day: number,
    month: number,
    year: number
}