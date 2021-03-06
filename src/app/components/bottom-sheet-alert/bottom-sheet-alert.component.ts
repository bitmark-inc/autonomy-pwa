import { Component, OnInit, Inject, ElementRef, OnDestroy } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

interface BottomSheetData {
  error: boolean,
  header: string,
  mainContent: string,
  title?: string,
  leftBtn?: string,
  rightBtn?: string,
  leftBtnAction?: () => {},
  rightBtnAction?: () => {}
}

@Component({
  selector: 'app-bottom-sheet-alert',
  templateUrl: './bottom-sheet-alert.component.html',
  styleUrls: ['./bottom-sheet-alert.component.scss']
})
export class BottomSheetAlertComponent implements OnInit, OnDestroy {
  public alertError: boolean = false;
  public header: string;
  public title: string;
  public mainContent: string;
  public leftBtn: string;
  public rightBtn: string;

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: BottomSheetData, private elementRef: ElementRef) {
    this.elementRef.nativeElement.ownerDocument.body.style.background = 'rgba(0,0,0,0.325)';

    this.header = data.header;
    this.mainContent = data.mainContent;
    // these data define for only show error case
    if (data.error) {
      this.alertError = data.error;
      this.title = data.title;
      this.rightBtn = data.rightBtn;
    }
    this.leftBtn = data.leftBtn ? data.leftBtn : '';
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.elementRef.nativeElement.ownerDocument.body.style.background = 'initial';
  }

  public tryAction() {
    
  }

  public leftAction() {
    if (this.data.leftBtnAction) {
      this.data.leftBtnAction();
    }
  }

  public rightAction() {
    if (this.data.leftBtnAction) {
      this.data.rightBtnAction();
    }
  }

}
