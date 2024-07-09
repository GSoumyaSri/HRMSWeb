import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ImagecropService {
  profileImage: string = '';

  onCrop(image: File, formGroup: FormGroup, formControlName: string): void {
    if (image) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImage = e.target.result;
        // Update the form control value with the cropped image data URL
        formGroup.get(formControlName).setValue(this.profileImage);
      };
      reader.readAsDataURL(image);
    } else {
      this.profileImage = '';
      formGroup.get(formControlName).setValue('');
    }
  }
}
