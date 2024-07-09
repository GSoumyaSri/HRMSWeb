export const FORMAT_DATE = (date: Date): Date => {
    return new Date(Date.UTC(date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()));
}
export const FORMAT_MONTH = (date: Date, format: string = 'MMM y'): string => {
    const options: Intl.DateTimeFormatOptions = { month: format === MONTH ? 'short' : undefined };
    return new Intl.DateTimeFormat('en-US', options).format(date);
};
export const DATE_FORMAT = (date: Date, format: string = 'yyyy-MM-dd'): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    switch (format) {
        case 'yyyy-MM-dd':
            return `${year}-${month}-${day}`;
        // Add more cases for other formats if needed
        default:
            return ''; // Return an empty string for unknown formats
    }
};
export const DATE_FORMAT_MONTH = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    return `${year}-${month}`;
};

export const DateTimeFormatter = () => {
    const formattedDate = new Date().toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).replace(',', '');

    const [datePart, timePart] = formattedDate.split(', ');
    const [monthPart, dayPart, yearPart] = datePart.split(' ');

    // Rearranging the time part
    const [time, meridiem] = timePart.split(' ');
    const [hour, minute] = time.split(':');
    const formattedTime = `${hour.padStart(2, '0')}.${minute} ${meridiem}`;

    return `${dayPart} ${monthPart} ${yearPart}, ${formattedTime}`;
}


export const MEDIUM_DATE = 'dd-MMM-yyyy';
export const SHORT_DATE = 'dd-MM-yyyy';
export const LONG_DATE = 'dd MMMM, yyyy';
export const ORIGINAL_DOB = 'MMM y';
export const MONTH = 'MMM';
export const DATE_OF_JOINING = 'd MMM y';
export const ATTENDANCE_DATE = ' d MMM,YYYY';


