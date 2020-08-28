import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Pipe({
  name: "symptomDelta",
})
export class SymptomDeltaPipe implements PipeTransform {
  constructor(private domSanitizer: DomSanitizer) {}

  transform(value: number | string): SafeHtml {
    let obj: string;
    value = parseFloat(value.toString());
    if (value > 0) {
      obj = `<div class="red"><img src="/assets/img/arrow-up-red.svg" alt=""> ${Math.abs(value).toFixed(2)}%</div>`;
    } else if (value < 0) {
      obj = `<div class="green"><img src="/assets/img/arrow-down-green.svg" alt=""> ${Math.abs(value).toFixed(2)}%</div>`;
    } else {
      obj = `<div class="grey">${Math.abs(value).toFixed(2)}%</div>`;
    }
    return this.domSanitizer.bypassSecurityTrustHtml(obj);
  }
}
