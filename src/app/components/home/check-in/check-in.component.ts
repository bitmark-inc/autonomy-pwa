import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-check-in',
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.scss']
})
export class CheckInComponent implements OnInit, AfterViewInit {
  @ViewChild('welcomeAlert') public welcomeAlert: TemplateRef<any>;

  public surveyShown: boolean = false;

  constructor(public dialog: MatDialog, private userService: UserService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    if (!this.userService.getPreference('welcome-shown')) {
      this.openWelcomeAlert();
      this.userService.setPreference('welcome-shown', true);
    }
  }

  public openWelcomeAlert() {
    this.dialog.open(this.welcomeAlert);
  }

  public checkIn() {
    this.surveyShown = true;
    if (!this.userService.getPreference('survey-taken')) {
      this.userService.setPreference('survey-taken', true);
    }
  }

}
