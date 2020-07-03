import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";

@Pipe({
  name: "placeDelta",
})
export class PlaceDeltaPipe implements PipeTransform {
  constructor(private domSanitizer: DomSanitizer) {}

  transform(value: any): any {
    let obj: any;
    value = parseFloat(value).toFixed(2);
    if (value > 0) {
      obj = `<div class="green"><img src="/assets/img/arrow-up-green.svg" alt=""> ${value}%</div>`;
    } else if (value < 0) {
      obj = `<div class="red"><img src="/assets/img/arrow-down-red.svg" alt=""> ${value}%</div>`;
    } else {
      obj = `<div class="grey">${value}%</div>`;
    }
    return this.domSanitizer.bypassSecurityTrustHtml(obj);
  }
}
