import { AppSettings } from '../../app-settings';
import * as moment from "moment";

let weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export class Util {
  constructor() {}

  private static revertWeekdayIndex(index: number): number {
    return index > 6 ? index - 7 : index;
  }

  private static checkConsecutive(array): [boolean, number] {
    let isConsecute: boolean = false;
    let consecutiveCount: number = 1;

    let tmpCheck = array[0];
    for (let i = 1; i < array.length; i++) {
      if (array[i] - 1 == tmpCheck) {
        isConsecute = true;
        consecutiveCount += 1;
        tmpCheck = array[i];
      } else {
        break;
      }
    }
    return [isConsecute, consecutiveCount];
  }

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

  public static openHoursFormat(openHours, todayOnly: boolean = false): any {
    let output;
    let tmp = Object.values(openHours);
    if (todayOnly) {
      output = tmp[moment().weekday()];
    } else {
      // create the same time group
      output = [];
      for (let i = 0; i < tmp.length; i++) {
        let exiting = output.filter(item => item.openHour == tmp[i]);
        if (exiting.length) {
          let exitIndexInOutput = output.indexOf(exiting[0]);
          output[exitIndexInOutput].dates = output[exitIndexInOutput].dates.concat(i);
        } else {
          output.push({
            openHour: tmp[i],
            dates: [i]
          })
        }
      }

      // format for display
      for (let i = 0; i < output.length; i++) {
        let dateOnSameHours = output[i].dates;
        if (dateOnSameHours.length > 2) {
          output[i].dates = []; // clear for prepare to add new format
          let from = '';
          let to = '';
          if (dateOnSameHours.includes(6) && dateOnSameHours.includes(0)) {
            dateOnSameHours = dateOnSameHours.map(date => (date < 2) ? (date + 7) : date).sort();
          } else {
            dateOnSameHours = dateOnSameHours.map(date => date);
          }
          while (dateOnSameHours.length) {
            let consecute = this.checkConsecutive(dateOnSameHours);
            if (consecute[0] && consecute[1] > 2) {
              from = weekday[this.revertWeekdayIndex(dateOnSameHours[0])];
              to = weekday[this.revertWeekdayIndex(dateOnSameHours[consecute[1] - 1])];
              output[i].dates = output[i].dates.concat(`${from}-${to}`);
            } else {
              dateOnSameHours.slice(0, consecute[1]).forEach((item) => {
                output[i].dates = output[i].dates.concat(`${weekday[this.revertWeekdayIndex(item)]}`);
              });
            }
            dateOnSameHours.splice(0, consecute[1]);
          }
        } else {
          output[i].dates = dateOnSameHours.map(date => weekday[date]);
        }
        output[i].dates = output[i].dates.join(', ');
      }
    }
    return output;
  }
}
