import { Injectable } from '@angular/core';
import {BehaviorSubject, from } from "rxjs";
import {Birthday} from "../birthday-table/birthday-table.component";
import {invoke} from "@tauri-apps/api/core";

@Injectable({
  providedIn: 'root'
})
export class BirthdayService {

  private birthdayTable$: BehaviorSubject<Birthday[]> = new BehaviorSubject<Birthday[]>([])

  constructor() {
    this.updateBirthdayTable().then();
  }

  getBirthdayTable$(){
    return this.birthdayTable$.asObservable();
  }

  async updateBirthdayTable(){
    const birthdays = await invoke<Birthday[]>('get_birthdays');
    this.birthdayTable$.next(birthdays);
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

}
