import { AppSettings } from '../../app-settings';

export class Util {
  constructor() {}

  public static scoreToColor(score: number, isLight: boolean): string {
    if (!score) {
      return AppSettings.PLACE_NONE_COLOR;
    }

    let colorSet = isLight ? AppSettings.PLACE_LIGHT_COLORS : AppSettings.PLACE_DARK_COLORS;
    let colorCode = AppSettings.PLACE_NONE_COLOR;

    score = parseFloat(score.toFixed(1));
    for (let i = 0; i < colorSet.length; i++) {
      if (colorSet[i].from <= score && colorSet[i].to >= score) {
        colorCode = colorSet[i].code;
        break;
      }
    }
    return colorCode;
  }

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
