import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-general-condition',
  templateUrl: './general-condition.component.html',
  styleUrls: ['./general-condition.component.css']
})
export class GeneralConditionComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<GeneralConditionComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    setTimeout(() => window.scrollTo(0, 0), 50);
  }

  public close() {
    this.dialogRef.close();
  }

}
