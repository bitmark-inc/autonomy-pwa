import { Component, OnInit, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { EventEmitterService } from "../services/event-emitter.service";

enum EnumAction { Left = 1, Right = 0 }

@Component({
  selector: 'app-bottom-sheet-alert',
  templateUrl: './bottom-sheet-alert.component.html',
  styleUrls: ['./bottom-sheet-alert.component.scss']
})
export class BottomSheetAlertComponent implements OnInit {
  public alertError: boolean = false;
  public header: string;
  public title: string;
  public mainContent: string;
  public leftBtn: string;
  public rightBtn: string;

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: any) {
    this.header = data.header;
    this.mainContent = data.mainContent;
    // these data define for only show error case
    if (data.error) {
      this.alertError = data.error;
      this.title = data.title;
      this.leftBtn = data.leftBtn;
      this.rightBtn = data.rightBtn;
    }
  }

  ngOnInit() {
  }

  public leftAction() {
    if (this.alertError) {
      EventEmitterService.getEventEmitter(EventEmitterService.Events.BottomSheetBtn).emit({
        action: EnumAction.Left
      })
    }
  }

  public rightAction() {
    if (this.alertError) {
      EventEmitterService.getEventEmitter(EventEmitterService.Events.BottomSheetBtn).emit({
        action: EnumAction.Right
      })
    }
  }

}
