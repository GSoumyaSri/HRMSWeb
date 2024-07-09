import { FormArray, ValidationErrors, AbstractControl } from '@angular/forms';

export function FormArrayValidationForDuplication(): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const formArray = control as FormArray;
        const duplicateControls: AbstractControl<any, any>[] = [];
        const uniqueControls: AbstractControl<any, any>[] = [];
        const duplicateCodeControls: AbstractControl<any, any>[] = [];
        const uniqueCodeControls: AbstractControl<any, any>[] = [];
        formArray.controls.forEach(control => {
        const count = formArray.controls.filter(
          x => x.get("name")!.value
            === control.get("name")!.value
        ).length;
        if (count > 1) {
          if(control.get("name")!.value !=null && control.get("name")!.value !="")
          {
          duplicateControls.push(control);
          }
        } else {
          uniqueControls.push(control);
        }
      });
      formArray.controls.forEach(control => {
        const count1 = formArray.controls.filter(
          x => x.get("code")!.value
            === control.get("code")!.value
        ).length;
        if (count1 > 1) {
          if(control.get("code")!.value !=null && control.get("code")!.value !="")
          {
          duplicateCodeControls.push(control);
          }
        } else {
          uniqueCodeControls.push(control);
        }
      });
      duplicateControls.forEach(duplicateControl => {
        duplicateControl.get("name")!.setErrors(
          Object.assign({}, duplicateControl.get("name")!.errors, {
            notUnique: true
          })
        );
      });
      uniqueControls.forEach((control: any) => {
        let errors = control.get("name").errors;
        if (errors) {
          delete errors.notUnique;
          errors = Object.keys(control.get("name").errors).length ? control.get("name").errors : null;
        }
        control.get("name").setErrors(errors);
      });
  
      duplicateCodeControls.forEach(duplicateControl => {
        duplicateControl.get("code")!.setErrors(
          Object.assign({}, duplicateControl.get("code")!.errors, {
            notUnique: true
          })
        );
      });
  
      uniqueCodeControls.forEach((control: any) => {
        let errors = control.get("code").errors;
        if (errors) {
          delete errors.notUnique;
          errors = Object.keys(control.get("code").errors).length ? control.get("code").errors : null;
        }
        control.get("code").setErrors(errors);
      });
      return null;
  
      };
    }


    