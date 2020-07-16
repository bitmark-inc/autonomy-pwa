import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";

@Pipe({
  name: "reportScore",
})
export class ReportScorePipe implements PipeTransform {
  constructor(private domSanitizer: DomSanitizer) {}

  transform(value: any): any {
    let obj: any;
    value = parseFloat(value).toFixed(1);
    if (value > 3.3) {
      obj = `<div style="color: #2A6D0C;">${value}</div>`;
    } else if (value <= 3.3 && value > 1.6 ) {
      obj = `<div style="color: #E7B416;">${value}</div>`;
    } else if (value <= 1.6 && value >= 0) {
      obj = `<div style="color: #CC3232;">${value}</div>`;
    } else {
      obj = `<div>--</div>`;
    }
    return this.domSanitizer.bypassSecurityTrustHtml(obj);
  }
}
