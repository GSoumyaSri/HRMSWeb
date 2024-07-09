/* Regular Expersions */
export const RG_ALPHA_ONLY = /^[a-zA-Z()]+(\s+[a-zA-Z()]+)*$/;
export const RG_NUMERIC_ONLY = '[0-9]*';
export const RG_ALPHA_NUMERIC = /^[-a-zA-Z0-9-]+(\s+[-a-zA-Z0-9-]+)*$/;
export const RG_PHONE_NO = '^[5-9][0-9]{9}$';
export const RG_EMAIL = /^(?!\.)(?!.*\.$)(?!.*\.\.)[a-zA-Z0-9.]{1,}@[a-zA-Z.]{2,15}[.]{1}[a-zA-Z]{2,3}$/;
export const RG_ADDRESS = /^[-a-zA-Z0-9-/.;:,_()]+([\s][-a-zA-Z0-9-/.;:,_()]+)*$/;
export const RG_PANNO = '^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$';
export const RG_PINCODE = '^[1-9][0-9]{5}$';
export const RG_AADHAAR = /^(?!0{12}|1{12}|2{12}|3{12}|4{12}|5{12}|6{12}|7{12}|8{12}|9{12})\d{12}$/;
export const RG_IFSC = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const IP_ADDRESS_NO =/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
export const RG_DECIMAL=/^\d+(\.\d{1,3})?$/;



/* Min and Max lengths */
export const MIN_LENGTH_2 = 2;
export const MIN_LENGTH_4 = 4;
export const MIN_LENGTH_6 = 6;
export const MIN_LENGTH_5 = 5;
export const MIN_LENGTH_20 = 20;
export const MIN_LENGTH_11 = 11;
export const MIN_LENGTH_8 = 8;
export const MIN_LENGTH_21 = 21;
export const MIN_LENGTH_100 = 100;
export const MAX_LENGTH_7 =7;
export const MAX_LENGTH_2 = 2;
export const MAX_LENGTH_3 = 3;
export const MAX_LENGTH_8 = 8;
export const MAX_LENGTH_6 = 6;
export const MAX_LENGTH_10 = 10;
export const MAX_LENGTH_15 =15;
export const MAX_LENGTH_21 =21;
export const MAX_LENGTH_20 = 20;
export const MAX_LENGTH_30 = 30;
export const MAX_LENGTH_50 = 50;
export const MAX_LENGTH_100 = 100;
export const MAX_LENGTH_25 = 25;
export const MAX_LENGTH_256 = 256;
export const MIN_ACCNO = 9;
export const MIN_AADHAAR = 12;
