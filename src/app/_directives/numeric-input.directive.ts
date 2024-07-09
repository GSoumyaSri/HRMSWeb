import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumericInput]'
})
export class NumericInputDirective {
  // This class is responsible for filtering input values, allowing only numbers and up to two decimal places.
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInputChange(event: any) {
    const initialValue = event.target.value;
    const filteredValue = initialValue.replace(/[^0-9.]/g, '').replace(/(\.\d{0,2}).*/g, '$1');
    if (initialValue !== filteredValue) {
      event.target.value = filteredValue;
      event.preventDefault();
    }
  }
}