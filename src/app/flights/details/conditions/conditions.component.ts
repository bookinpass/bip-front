import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

import * as _ from 'underscore.string';

@Component({
  selector: 'app-conditions',
  templateUrl: './conditions.component.html',
  styleUrls: ['./conditions.component.css']
})
export class ConditionsComponent {

  public conditions = new Map<string, string>();

  constructor(@Inject(MAT_DIALOG_DATA) data: any,
              public dialogRef: MatDialogRef<ConditionsComponent>) {
    for (let i = 1; i < 5; i++) {
      if (this.notNull(data.conditions[i]) && this.notNull(data.conditions[i].fareNotes) &&
        this.notNull(data.conditions[i].fareNotes.descriptions)) {
        data.conditions[i].fareNotes.descriptions.forEach(x => {
          const text = '<p>' + _.humanize(x.text).replace(/[*]{3}/g, '</p><p>').replace(/[.]{3}/g, '</p><p>') + '</p>';
          this.conditions.set(_.humanize(x.descriptionType), text);
        });
      }
    }
  }

  private notNull = (item: any) => {
    return item !== null && item !== undefined;
  }

}
