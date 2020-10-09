import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user/user.service';
import { SurveyService } from 'src/app/services/survey/survey.service';

@Component({
  selector: 'app-check-in',
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.scss']
})
export class CheckInComponent implements OnInit, AfterViewInit {
  @ViewChild('welcomeAlert') public welcomeAlert: TemplateRef<any>;

  public surveyShown: boolean = false;
  public surveyCompleted: boolean = false;
  public includeMonthlyQuestion: boolean = false;

  constructor(public dialog: MatDialog, private userService: UserService, private surveyService: SurveyService) {
    this.surveyCompleted = this.surveyService.surveyDisabled();
    if (!this.surveyCompleted) {
      this.includeMonthlyQuestion = this.surveyService.includeMonthly();
    }
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
    this.surveyService.surveyTaken();
  }

  public finishSurvey(completed: boolean) {
    this.surveyCompleted = completed;
    if (this.surveyCompleted) {
      this.surveyService.weeklyCompleted();
    }
  }

}
