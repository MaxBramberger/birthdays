import {Component, ElementRef, ViewChild} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {BirthdayTableComponent} from "./birthday-table/birthday-table.component";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {BirthdayDialogComponent} from "./birthday-dialog/birthday-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {MatFormField, MatFormFieldModule} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {invoke} from "@tauri-apps/api/core";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BirthdayTableComponent, MatIconButton, MatIcon, MatFormField, MatInput, FormsModule, MatFormFieldModule, MatButton],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent{

  @ViewChild('fileInput') fileInput!: ElementRef;

  filterString: string | null = null;

  constructor(private dialog: MatDialog) {
  }
  onAdd(){
    this.dialog.open(BirthdayDialogComponent, {data: undefined});
  }

  onFileSelect() {
    this.fileInput.nativeElement.click();
  }

  handleFileImport(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.readFileContent(file);
    }
  }

  private async readFileContent(file: File) {
    const reader = new FileReader();
    reader.onload = async () => {
      const fileContent = reader.result as string;
      this.sendFileToBackend(fileContent);
    };
    reader.readAsText(file);
  }

  private async sendFileToBackend(fileContent: string){
    try {
      const parsedData = await invoke('parse_file_content', { fileContent });
      console.log('Parsed data:', parsedData);
    } catch (error) {
      console.error('Error parsing file content:', error);
    }
  }
}
