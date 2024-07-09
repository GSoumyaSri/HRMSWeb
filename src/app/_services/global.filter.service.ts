// global-filter.service.ts
import { Injectable } from '@angular/core';
import { Table } from 'primeng/table';
import { DatePipe } from '@angular/common';
import { DataView } from 'primeng/dataview';

@Injectable({
  providedIn: 'root',
})
export class GlobalFilterService {
  constructor(private datePipe: DatePipe) { }

  filterTableByDate(table: Table, searchTerm: string) {
    var enteredValue = searchTerm.toLowerCase();
    if (enteredValue === 'yes') {
      table.filterGlobal(true, 'equals');
    } else if (enteredValue === 'no') {
      table.filterGlobal(false, 'equals');
    } else {
      const dateFormatRegex = /^(\d{2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{4})$/;
      if (dateFormatRegex.test(searchTerm)) {
        const [day, month, year] = searchTerm.split('-');
        const monthMap: { [key: string]: string } = {
          'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
          'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
          'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };
        const monthNumber = monthMap[month];
        const date = `${year}-${monthNumber}-${day}`;
        table.filterGlobal(date, 'contains');
      } else {
        table.filterGlobal(searchTerm, 'contains');
      }
    }
  }


  filterCardByDate(dv: DataView, searchTerm: string) {
    const dateFormatRegex = /^(\d{2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{4})$/;
    if (dateFormatRegex.test(searchTerm)) {
      const [day, month, year] = searchTerm.split('-');
      const monthMap: { [key: string]: string } = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      };
      const monthNumber = monthMap[month];
      const date = `${year}-${monthNumber}-${day}`;
      dv.filter(date, 'contains');
    } else {
      dv.filter(searchTerm, 'contains');
    }
  }
}
