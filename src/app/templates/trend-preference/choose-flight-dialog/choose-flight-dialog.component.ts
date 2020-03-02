import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-choose-flight-dialog',
  templateUrl: './choose-flight-dialog.component.html',
  styleUrls: ['./choose-flight-dialog.component.css']
})
export class ChooseFlightDialogComponent implements OnInit {

  public code: string;
  public country: string;
  public img: string;
  public selectedDepart: Date = new Date();

  constructor(public dialogRef: MatDialogRef<ChooseFlightDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.code = this.data.code;
    this.country = this.data.country;
    this.img = this.data.img;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
