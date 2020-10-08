import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-check-in',
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.scss']
})
export class CheckInComponent implements OnInit {
  @ViewChild('welcomeAlert') public welcomeAlert: TemplateRef<any>;

  public surveyShown: boolean = false;

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  public openWelcomeAlert() {
    this.dialog.open(this.welcomeAlert);
  }

}
