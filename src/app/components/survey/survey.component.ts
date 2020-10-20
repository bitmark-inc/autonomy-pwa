import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AppSettings } from '../../app-settings';
import { trigger, animate, style, transition, state } from '@angular/animations';
import { SurveyService } from '../../services/survey/survey.service';

enum Questions { q1, q2, q3, q4, q5, q6, q7, q8, q9 };
enum MonthlyQuestions { q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13, q14, q15 };

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss'],
  animations: [
    trigger('questionTransition', [
      state('main', style({ transform: 'translateX(0)' })),
      state('next', style({ transform: 'translateX(100%)' })),
      state('pre', style({ transform: 'translateX(-100%)' })),
      state('pre2', style({ transform: 'translateX(-200%)' })),
      state('other', style({ transform: 'translateX(200%)' })),
      transition('main => void', [
        animate(200),
        style({ transform: 'translateX(100%)' })
      ]),
      transition('void => main', [
        animate(200)
      ]),
      transition('next <=> main', [
        animate(200)
      ]),
      transition('main <=> pre', [
        animate(200)
      ]),
      transition('other <=> main', [
        animate(200)
      ]),
      transition('pre <=> next', [
        animate(200)
      ]),
      transition('main <=> pre2', [
        animate(200)
      ]),
    ]),
    trigger('subquestionExpand',[
      state('hidden', style({ display: 'none', height: 0, opacity: 0 })),
      state('shown', style({ display: 'block', height: 'fit-content', opacity: 1 })),
      transition('shown => hidden', [animate(0), style({ opacity: 0})]),
      transition('hidden => shown', [animate(100), style({ opacity: 1})]),
    ])
  ],
})
export class SurveyComponent implements OnInit, OnDestroy {
  @Input() surveyShown: boolean;
  @Input() includeMonthly: boolean;
  @Output() exitSurvey = new EventEmitter();
  @Output() surveyCompleted = new EventEmitter();

  public isCompleted: boolean = false;
  public hasChanged: boolean = false;

  public Questions;
  public activeQuestion: number = 0;

  public answers;
  public monthlyAnswers;
  public survey: FormGroup;

  public weeklySurvey = new FormGroup({
    q1a: new FormControl(9),
    q1b: new FormControl(9),
    q2a: new FormControl(9),
    q2b: new FormControl(9),
    q2c: new FormControl(9),
    q3a: new FormControl(9),
    q3b: new FormControl(0),
    q4: new FormControl(9),
    q5: new FormControl(9),
    q6: new FormControl(9),
    q7a: new FormControl(null),
    q7b: new FormControl(null),
    q7c: new FormControl(null),
    q8: new FormControl(9),
    q9a: new FormControl(9),
    q9b: new FormControl(9),
    q9c: new FormControl(9),
  });

  public monthlySurvey = new FormGroup({
    q1a: new FormControl(9),
    q1b: new FormControl(9),
    q2a: new FormControl(9),
    q2b: new FormControl(9),
    q2c: new FormControl(9),
    q3a: new FormControl(9),
    q3b: new FormControl(0),
    q4: new FormControl(9),
    q5: new FormControl(9),
    q6: new FormControl(9),
    q7a: new FormControl(null),
    q7b: new FormControl(null),
    q7c: new FormControl(null),
    q8: new FormControl(9),
    q9a: new FormControl(9),
    q9b: new FormControl(9),
    q9c: new FormControl(9),
    q10: new FormControl(9),
    q11: new FormControl(9),
    q12: new FormControl(9),
    q13: new FormControl(9),
    q14: new FormControl(9),
    q15: new FormControl(''),
  });

  constructor(private surveyService: SurveyService) {
    this.answers = AppSettings.SURVEY_ANSWERS;
    this.monthlyAnswers = AppSettings.SURVEY_MONTHLY_ANSWERS;
  }

  ngOnInit(): void {
    this.Questions = this.includeMonthly ? MonthlyQuestions : Questions;
    this.survey = this.includeMonthly ? this.monthlySurvey : this.weeklySurvey;
  }

  ngOnDestroy() {
    if (this.hasChanged && !this.isCompleted) {
      console.log('submit on destroy');
      this.submitSurvey(this.survey);
    }
  }

  public resetNestedAnswer(form: FormGroup, resetControlNames: string[]) {
    if (resetControlNames && resetControlNames.length) {
      resetControlNames.forEach((key) => {
        form.controls[key].setValue(9);
      })
    }
  }

  private saveChange(form: FormGroup) {
    form.updateValueAndValidity();
    setTimeout(() => {
      this.hasChanged = true;
    }, 0);
  }

  private nextQuestion(jumpTo?: number) {
    setTimeout(() => {
      if (this.activeQuestion === (Object.keys(this.Questions).length / 2) - 1) {
        this.isCompleted = true;
        this.submitSurvey(this.survey);
        this.surveyCompleted.emit(true);
      } else {
        this.activeQuestion = jumpTo ? jumpTo : this.activeQuestion + 1;
      }
    }, 0.5 * 1000);
  }

  private submitSurvey(form: FormGroup) {
    this.formatFormData(form);
    this.surveyService.submitSurvey(form.value).subscribe((result) => {
      this.close();
    }, (error) => {
      window.alert(error);
    })
  }

  private formatFormData(form: FormGroup) {
    Object.keys(form.value).forEach((key) => {
      if (form.controls[key].value === null) {
        form.controls[key].setValue(99); // default 99 if none value
      }
    });
  }

  public saveAndMoveToNext(form: FormGroup, formControlname?: string[], jumpTo?: number) {
    this.resetNestedAnswer(form, formControlname);
    this.saveChange(form);
    this.nextQuestion(jumpTo);
  }

  public updateSelectList(form: FormGroup, formControlName: string, selected: string) {
    let controlValues: string[] = form.controls[formControlName].value || [];
    if (controlValues.includes(selected)) {
      let index = controlValues.indexOf(selected);
      controlValues.splice(index, 1);
    } else {
      controlValues.push(selected);
    }
    form.controls[formControlName].setValue(controlValues);
  }

  public close() {
    this.exitSurvey.emit(false);
  }

  public getStateAnimation(questionNum: number): string {
    if (this.activeQuestion == questionNum) {
      return 'main';
    } else if (questionNum - 1 == this.activeQuestion) {
      return 'next';
    } else if (questionNum + 1 == this.activeQuestion) {
      return 'pre';
    } else if (questionNum + 2 == this.activeQuestion) {
      return 'pre2';
    } else {
      return 'other';
    }
  }

}
