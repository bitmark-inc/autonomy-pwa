import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user/user.service';
import { SurveyService } from 'src/app/services/survey/survey.service';
import { HomepageState as ParentContainerState } from '../homepage.state';

import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-check-in',
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.scss'],
  animations: [
    trigger('surveyTransition', [
      state('main', style({ transform: 'translateX(0)' })),
      state('pre', style({ transform: 'translateX(100%)' })),
      state('next', style({ transform: 'translateX(-100%)' })),
      state('other', style({ transform: 'translateX(-200%)' })),
      transition('void <=> main', [
        animate(200)
      ]),
      transition('next <=> main', [
        animate(200)
      ]),
      transition('main <=> pre', [
        animate(200)
      ])
    ])
  ],
})
export class CheckInComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('welcomeAlert') public welcomeAlert: TemplateRef<any>;

  public surveyShown: boolean = false;
  public surveyCompleted: boolean = false;
  public includeMonthlyQuestion: boolean = false;

  private destroy;
  private rxjsTimer;

  constructor(public dialog: MatDialog, private userService: UserService, private surveyService: SurveyService) {
    this.setSurveyState();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    if (!this.userService.getPreference('welcome-shown')) {
      this.openWelcomeAlert();
      this.userService.setPreference('welcome-shown', true);
    }
  }

  ngOnDestroy() {
    ParentContainerState.fullscreen.next(false);
    if (this.destroy) {
      this.destroy.next();
      this.destroy.complete();
    }
  }

  private setSurveyState() {
    this.surveyCompleted = this.surveyService.surveyDisabled();
    if (this.surveyCompleted) {
      this.enableSurveyTimer();
    } else {
      // include Monthly if survey enable
      this.includeMonthlyQuestion = this.surveyService.includeMonthly();
    }
  }

  private enableSurveyTimer() {
    // set timer to enable survey if it's waiting to next weekly
    this.destroy = new Subject();
    this.rxjsTimer = timer(1000, 5 * 60 * 1000);

    this.rxjsTimer.pipe(takeUntil(this.destroy)).subscribe(() => {
      this.surveyCompleted = this.surveyService.surveyDisabled();
      if (!this.surveyCompleted) {
        this.destroy.next();
        this.destroy.complete();
        this.includeMonthlyQuestion = this.surveyService.includeMonthly();
      }
    })
  }

  public openWelcomeAlert() {
    this.dialog.open(this.welcomeAlert);
  }

  public checkIn() {
    this.surveyShown = true;
    ParentContainerState.fullscreen.next(true);
    this.surveyService.surveyTaken();
  }

  public exitSurvey(shown: boolean) {
    this.surveyShown = shown;
    ParentContainerState.fullscreen.next(false);
  }

  public completeSurvey(completed: boolean) {
    this.surveyCompleted = completed;
    if (this.surveyCompleted) {
      this.surveyService.weeklyCompleted();
    }
  }

  public getSurveyState(): string {
    if (this.surveyShown) {
      return 'main';
    } else if (this.surveyCompleted) {
      return 'next';
    } else {
      return 'pre';
    }
  }

}
