import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from "@angular/material";

enum EnumAlertType { Info = 'info', Warn = 'warning' }

@Component({
  selector: "app-alert-dialog",
  templateUrl: "./alert-dialog.component.html",
  styleUrls: ["./alert-dialog.component.scss"],
})
export class AlertDialogComponent implements OnInit {
  public modalTitle: string;
  public modalSubTitle: string;
  public modalMessage: string;
  public modalType: EnumAlertType = EnumAlertType.Info;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.modalTitle = data.title;
    this.modalSubTitle = data.subTitle;
    this.modalMessage = data.message;
    this.modalType = data.type;
  }

  ngOnInit() {}
}
