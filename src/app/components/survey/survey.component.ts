import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AppSettings } from '../../app-settings';
import { trigger, animate, style, transition, state } from '@angular/animations';
import { SurveyService } from '../../services/survey/survey.service';

enum Questions { q1, q2, q3, q4, q5, q6, q7, q8, q9 };

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss'],
  animations: [
    trigger('questionTransition', [
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
    ]),
    trigger('subquestionExpand',[
      state('hidden', style({ height: 0, opacity: 0 })),
      state('shown', style({ height: 'fit-content', opacity: 1 })),
      transition('shown => hidden', [animate(100), style({ opacity: 0})]),
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

  public Questions = Questions;
  public activeQuestion = Questions.q1;

  public answers;

  public survey = new FormGroup({
    q1: new FormControl(99),
    q1_1: new FormControl(99),
    q2: new FormControl(99),
    q2_1: new FormControl(99),
    q2_1_1: new FormControl(99),
    q3: new FormControl(99),
    q3_1: new FormControl([]),
    q4: new FormControl(99),
    q5: new FormControl(99),
    q6: new FormControl(99),
    q7: new FormControl(99),
    q7_1: new FormControl(99),
    q7_1_1: new FormControl(99),
    q8: new FormControl(99),
    q9: new FormControl(99),
    q9_1: new FormControl(99),
    q9_1_1: new FormControl(99),
  });

  constructor(private surveyService: SurveyService) {
    this.answers = AppSettings.SURVEY_ANSWERS;
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    if (this.hasChanged && !this.isCompleted) {
      console.log('submit on destroy');
      this.submitSurvey(this.survey);
    }
  }

  private resetNestedAnswer(form: FormGroup, topFormControlname: string) {
    if (topFormControlname) {
      let resetControlNames = Object.keys(form.controls).filter(k => k.includes(`${topFormControlname}_`));
      resetControlNames.forEach((key) => {
        form.controls[key].setValue(99);
      })
    }
  }

  private saveChange(form: FormGroup) {
    form.updateValueAndValidity();
    setTimeout(() => {
      this.hasChanged = true;
      console.log(form.value);
    }, 0);
  }

  private nextQuestion() {
    setTimeout(() => {
      if (this.activeQuestion === (Object.keys(this.Questions).length / 2) - 1) {
        this.isCompleted = true;
        this.submitSurvey(this.survey);
        this.surveyCompleted.emit(true);
      } else {
        this.activeQuestion += 1;
      }
    }, 0.5 * 1000);
  }

  private submitSurvey(form: FormGroup) {
    this.surveyService.submitSurvey(form.value).subscribe((result) => {
      this.close();
    }, (error) => {
      window.alert(error);
    })
  }

  public saveAndMoveToNext(form: FormGroup, formControlname?: string) {
    this.resetNestedAnswer(form, formControlname);
    this.saveChange(form);
    this.nextQuestion();
  }

  public updateSelectList(form: FormGroup, formControlName: string, selected: number) {
    let controlValues: number[] = form.controls[formControlName].value || [];
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
      return 'pre';
    } else if (questionNum + 1 == this.activeQuestion) {
      return 'next';
    } else {
      return 'other';
    }
  }

}