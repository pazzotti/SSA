import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'customDate' })
export class CustomDatePipe implements PipeTransform {
  transform(value: string): string {
    const date = new Date(value);

    // Add one day to the date
    date.setDate(date.getDate() + 1);

    return `${this.twoDigits(date.getDate())}-${this.twoDigits(date.getMonth() + 1)}-${date.getFullYear()}`;
  }

  private twoDigits(value: number): string {
    return value < 10 ? '0' + value : '' + value;
  }
}
