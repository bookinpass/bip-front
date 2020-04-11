import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-general-condition',
  templateUrl: './general-condition.component.html',
  styleUrls: ['./general-condition.component.css']
})
export class GeneralConditionComponent {

  constructor(public dialogRef: MatDialogRef<GeneralConditionComponent>) {
  }

  public close() {
    this.dialogRef.close();
  }

}
