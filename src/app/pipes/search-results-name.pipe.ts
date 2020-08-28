import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'searchResultsName'
})
export class SearchResultsNamePipe implements PipeTransform {
  constructor(private domSanitizer: DomSanitizer){}

  transform(value: string, searchKey: string): SafeHtml {
    if (searchKey) {
      let regx = new RegExp(searchKey,'gi');
      let obj = value.replace(regx, `<span style="color: #FDB515">${searchKey}</span>`)
      return this.domSanitizer.bypassSecurityTrustHtml(obj);
    } else {
      return this.domSanitizer.bypassSecurityTrustHtml(value);
    }
  }

}
