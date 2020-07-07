import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  constructor() {}

  // Time format example: 2020-06-21T00:00:00+07:00
  public static toISOStringWithLocalTimezone(date: Date): string {
    let addZero = (num: number) => `${Math.abs(num) > 9 ? '' : '0'}${num}`;
    let timezone = date.getTimezoneOffset();
    let timezoneSign = timezone < 0 ? '+' : '-';

    timezone = Math.abs(timezone);

    let result = date.getFullYear() + '-' +
                addZero(date.getMonth() + 1) + '-' +
                addZero(date.getDate()) + 'T' +
                addZero(date.getHours()) + ':' +
                addZero(date.getMinutes()) + ':' +
                addZero(date.getSeconds()) + ':' +
                timezoneSign + addZero(timezone/60) + ':' + addZero(timezone%60);
    return result;
  }
}
