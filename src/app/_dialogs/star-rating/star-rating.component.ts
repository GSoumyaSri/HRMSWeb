import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styles: [
  ]
})
export class StarRatingComponent {
  @Input() control: FormControl;

  stars: any[] = [1, 2, 3, 4, 5];
  ratings: number;
  clickCount: number = 0;
  highlightedStar: number | null = null;

  ngOnInit(): void {
    if (this.control) {
      this.control.valueChanges.subscribe((value) => {
        this.ratings = value;
      });
    }
    if (this.control !== null) {
      const index = this.highlightedStar;
      this.handleValueofExpertise(index)
    }
  }

  handleValueofExpertise(index: number): void {
    if (this.ratings !== null && this.control) {
      
      // Get the existing value from this.control
      const existingValue = this.control.value;

      // Set the fill level based on the existing value or the clicked index
      let fillLevel = existingValue !== undefined ? existingValue : index + 1;

      // Update the rating based on the fill level and ensure it stays within the range of 0 to 5
      this.ratings = Math.min(Math.max(fillLevel, 0), 5);

      // Update the form control value
      this.control.setValue(this.ratings);

      // Update the highlighted star index
      this.highlightedStar = index;
    }
  }

  handleClick(index: number): void {
    if (this.ratings !== null) {
      let fillLevel: number;

      // Increment the click count only if a different star is clicked
      if (this.highlightedStar !== index) {
        this.clickCount = 1;
      } else {
        this.clickCount = (this.clickCount % 3) + 1;
      }

      if (this.clickCount === 1) {
        fillLevel = index + 0.5;
      } else if (this.clickCount === 2) {
        fillLevel = index + 1; // Set to 1 on the second click
      } else {
        fillLevel = index + 0; // Reset to 0 on the third click
        this.clickCount = 0;
      }
      // Update the rating based on the fill level and ensure it stays within the range of 0 to 5
      this.ratings = Math.min(Math.max(fillLevel, 0), 5);
      // Update the form control value
      if (this.control) {
        this.control.setValue(this.ratings);
      }
      // Update the highlighted star index
      this.highlightedStar = index;
    }
  }
}
