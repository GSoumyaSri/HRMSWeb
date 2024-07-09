import { AbstractControl, ValidatorFn } from "@angular/forms";

export class DateValidators {
  static dateRangeValidator(dateField1: string, dateField2: string, validatorField: { [key: string]: boolean }): ValidatorFn {
      return (control: AbstractControl): { [key: string]: boolean } | null => {
          const date1 = control.get(dateField1)?.value;
          const date2 = control.get(dateField2)?.value;
          if ((date1 !== null && date2 !== null) && date1 > date2) {
              return validatorField;
          }
          return null;
      };
  }
}
