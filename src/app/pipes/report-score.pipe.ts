import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Pipe({
  name: "reportScore",
})
export class ReportScorePipe implements PipeTransform {
  constructor(private domSanitizer: DomSanitizer) {}

  transform(value: number | string): SafeHtml {
    let obj: string;
    value = parseFloat(value.toString());
    if (value > 3.3) {
      obj = `<div style="color: #2A6D0C;">${value.toFixed(1)}</div>`;
    } else if (value <= 3.3 && value > 1.6 ) {
      obj = `<div style="color: #E7B416;">${value.toFixed(1)}</div>`;
    } else if (value <= 1.6 && value >= 0) {
      obj = `<div style="color: #CC3232;">${value.toFixed(1)}</div>`;
    } else {
      obj = `<div>--</div>`;
    }
    return this.domSanitizer.bypassSecurityTrustHtml(obj);
  }
}
