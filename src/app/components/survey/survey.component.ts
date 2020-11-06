import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AppSettings } from '../../app-settings';
import { trigger, animate, style, transition, state } from '@angular/animations';
import { SurveyService } from '../../services/survey/survey.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

// enum FirstWeekQuestions { q0, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13, q14, q15, q16, q17, q18, q19, q20, q21, q22 };
// enum WeeklyQuestions { q0, q1, q2, q3, q4, q5, q6, q7, q8, q9, 'q10.1', q13, q14, q15, q16, q17, q18, q19, q20, q21, q22 };
// enum MonthlyQuestions { q0, q1, q2, q3, q4, q5, q6, q7, q8, q9, 'q10.1', q13, q14, q15, q16, q17, q18, q19, q20, q21, q22, m1, m2, m3 };

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
  @Input() firstSurvey: boolean;
  @Output() exitSurvey = new EventEmitter();
  @Output() surveyCompleted = new EventEmitter();

  public isCompleted: boolean = false;
  public hasChanged: boolean = false;

  public Questions;
  public activeQuestion: number = 0;

  public answers;
  public demographicAnswers;
  public monthlyAnswers;

  public FirstWeekQuestions = { q0: 0, q1: 1, q2: 2, q3: 3, q4: 4, q5: 5, q6: 6, q7: 7, q8: 8, q9: 9, q10: 10, q11: 11, q12: 12, q13: 13, q14: 14, q15: 15, q16: 16, q17: 17, q18: 18, q19: 19, q20: 20, q21: 21, q22: 22 };
  public WeeklyQuestions = { q0: 0, q1: 1, q2: 2, q3: 3, q4: 4, q5: 5, q6: 6, q7: 7, q8: 8, q9: 9, 'q10.1': 10, q13: 11, q14: 12, q15: 13, q16: 14, q17: 15, q18: 16, q19: 17, q20: 18, q21: 19, q22: 20 };
  public MonthlyQuestions = { q0: 0, q1: 1, q2: 2, q3: 3, q4: 4, q5: 5, q6: 6, q7: 7, q8: 8, q9: 9, 'q10.1': 10, q13: 11, q14: 12, q15: 13, q16: 14, q17: 15, q18: 16, q19: 17, q20: 18, q21: 19, q22: 20, m1: 21, m2: 22, m3:23 };

  public demoGraphicQuestions = ['q16', 'q17', 'q18', 'q19', 'q20'];

  public survey: FormGroup;

  public firstWeekSurvey = new FormGroup({
    q0: new FormControl(9),
    q1: new FormControl(9),
    q1a: new FormControl(9),
    q2: new FormControl(9),
    q2a: new FormControl(9),
    q2b: new FormControl(9),
    q3: new FormControl(9),
    q3a: new FormControl(0),
    q4: new FormControl(9),
    q5: new FormControl(9),
    q6: new FormControl(9),
    q7: new FormControl(9),
    q8: new FormControl(9),
    q9: new FormControl(9),
    q9a: new FormControl(9),
    q10: new FormControl(9),
    q11: new FormControl(9),
    q11a: new FormControl(9),
    q12: new FormControl([]),
    q13: new FormControl(null),
    q13a: new FormControl(null),
    q13b: new FormControl(null),
    q14: new FormControl(9),
    q14a: new FormControl(9),
    q14b: new FormControl(9),
    q15: new FormControl(9),
    q15a: new FormControl(9),
    q15b: new FormControl(9),
    q16: new FormControl(99),
    q17: new FormControl(99),
    q18: new FormControl(99),
    q19: new FormControl(99),
    q20: new FormControl(99),
    q21: new FormControl(''),
    q22: new FormControl(''),
  });
  public weeklySurvey = new FormGroup({
    q0: new FormControl(9),
    q1: new FormControl(9),
    q1a: new FormControl(9),
    q2: new FormControl(9),
    q2a: new FormControl(9),
    q2b: new FormControl(9),
    q3: new FormControl(9),
    q3a: new FormControl(0),
    q4: new FormControl(9),
    q5: new FormControl(9),
    q6: new FormControl(9),
    q7: new FormControl(9),
    q8: new FormControl(9),
    q9: new FormControl(9),
    q9a: new FormControl(9),
    'q10.1': new FormControl(9),
    q13: new FormControl(null),
    q13a: new FormControl(null),
    q13b: new FormControl(null),
    q14: new FormControl(9),
    q14a: new FormControl(9),
    q14b: new FormControl(9),
    q15: new FormControl(9),
    q15a: new FormControl(9),
    q15b: new FormControl(9),
    q16: new FormControl(99),
    q17: new FormControl(99),
    q18: new FormControl(99),
    q19: new FormControl(99),
    q20: new FormControl(99),
    q21: new FormControl(''),
    q22: new FormControl(''),
  });
  public monthlySurvey = new FormGroup({
    q0: new FormControl(9),
    q1: new FormControl(9),
    q1a: new FormControl(9),
    q2: new FormControl(9),
    q2a: new FormControl(9),
    q2b: new FormControl(9),
    q3: new FormControl(9),
    q3a: new FormControl(0),
    q4: new FormControl(9),
    q5: new FormControl(9),
    q6: new FormControl(9),
    q7: new FormControl(9),
    q8: new FormControl(9),
    q9: new FormControl(9),
    q9a: new FormControl(9),
    'q10.1': new FormControl(9),
    q13: new FormControl(null),
    q13a: new FormControl(null),
    q13b: new FormControl(null),
    q14: new FormControl(9),
    q14a: new FormControl(9),
    q14b: new FormControl(9),
    q15: new FormControl(9),
    q15a: new FormControl(9),
    q15b: new FormControl(9),
    q16: new FormControl(99),
    q17: new FormControl(99),
    q18: new FormControl(99),
    q19: new FormControl(99),
    q20: new FormControl(99),
    q21: new FormControl(''),
    q22: new FormControl(''),
    m1: new FormControl(9),
    m2: new FormControl(9),
    m3: new FormControl(9),
  });

  public orderAnswer12 = ['World Health Organization', 'U.S. Centers for Disease Control and Prevention', 'Federal government', 'State government', 'City or local government', 'Local public health agency', 'Technology companies', 'My own healthcare provider'];

  constructor(private surveyService: SurveyService) {
    this.answers = AppSettings.SURVEY_ANSWERS;
    this.demographicAnswers = AppSettings.SURVEY_DEMOGRAPHIC_ANSWERS;
    this.monthlyAnswers = AppSettings.MONTHLY_SURVEY_ANSWERS;
  }

  ngOnInit(): void {
    this.Questions = this.firstSurvey ? this.FirstWeekQuestions : (this.includeMonthly ? this.MonthlyQuestions : this.WeeklyQuestions);
    this.survey = this.firstSurvey ? this.firstWeekSurvey : (this.includeMonthly ? this.monthlySurvey : this.weeklySurvey);
    this.initDemographicQuestion();
  }

  ngOnDestroy() {
    if (this.hasChanged && !this.isCompleted) {
      console.log('submit on destroy');
      this.submitSurvey(this.survey);
    }
  }

  private initDemographicQuestion() {
    this.demoGraphicQuestions.forEach((order) => {
      if (!this.surveyService.includeDemoGraphic(order)) {
        this.removeQuestion(this.survey, order);
        this.updateQuestionOrder(this.Questions[order] + 1, false);
        delete this.Questions[order];
      }
    })
  }

  public resetNestedAnswer(form: FormGroup, resetControlNames: string[]) {
    if (resetControlNames && resetControlNames.length) {
      resetControlNames.forEach((key) => {
        if (key == 'q3a') {
          if (form.controls[key].value) {
            form.controls[key].value.forEach((sub) => {
              this.removeQuestion(form, `q3b.${sub}`);
              this.updateQuestionOrder(this.Questions.q4, false);
              delete this.Questions[`q3b.${sub}`]
              this.updateOrderOfDynamicQuestion('q3b.', 'q3');
            })
            form.controls[key].setValue(0);
          }
        } else {
          form.controls[key].setValue(9);
        }
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
      if (this.activeQuestion === (Object.keys(this.Questions).length) - 1) {
        this.isCompleted = true;
        this.submitSurvey(this.survey);
        this.surveyCompleted.emit(true);
      } else {
        this.activeQuestion = jumpTo ? jumpTo : this.activeQuestion + 1;
      }
    }, 0.5 * 1000);
  }

  private submitSurvey(form: FormGroup) {
    this.formatFormDataForInput(form);
    this.surveyService.submitSurvey(form.value).subscribe((result) => {
      if (this.firstSurvey) {
        this.surveyService.firstSurveySubmitted();
      }
      this.close();
    }, (error) => {
      window.alert(error);
    })
  }

  private formatFormDataForInput(form: FormGroup) {
    Object.keys(form.value).forEach((key) => {
      if (form.controls[key].value === null) {
        if (key.includes('q13')) {
          form.controls[key].setValue(99); // default 99 if none value
        }
      }
    });
  }

  private addQuestion(form: FormGroup, name: string) {
    form.addControl(name, new FormControl(null));
  }

  private removeQuestion(form: FormGroup, name: string) {
    form.removeControl(name);
  }

  private updateQuestionOrder(updateFromOrder: number, add: boolean) {
    Object.keys(this.Questions).forEach((key) => {
      if (this.Questions[key] >= updateFromOrder) {
        if (add) {
          this.Questions[key] += 1;
        } else {
          this.Questions[key] -= 1;
        }
      }
    })
  }

  private updateOrderOfDynamicQuestion(dynamicParent: string, previoursOfGroup: string) {
    let dynamicQuestions = Object.keys(this.Questions).filter(key => key.includes(dynamicParent));
    dynamicQuestions.forEach((q, index) => {
      this.Questions[q] = index + this.Questions[previoursOfGroup] + 1;
    })
  }

  public saveAndMoveToNext(form: FormGroup, formControlname?: string[], jumpTo?: number, demoGraphicOrder?: string) {
    if (demoGraphicOrder) {
      this.updateDemographicStorage(demoGraphicOrder);
    }
    this.resetNestedAnswer(form, formControlname);
    this.saveChange(form);
    this.nextQuestion(jumpTo);
  }

  public updateSelectList(form: FormGroup, formControlName: string, selected: string) {
    let controlValues: string[] = form.controls[formControlName].value || [];
    if (controlValues.includes(selected)) { // remove selection
      let index = controlValues.indexOf(selected);
      controlValues.splice(index, 1);
      this.removeQuestion(form, `q3b.${selected}`);

      this.updateQuestionOrder(this.Questions.q4, false);
      delete this.Questions[`q3b.${selected}`];
      this.updateOrderOfDynamicQuestion('q3b.', 'q3');
    } else { // add selection
      controlValues.push(selected);
      this.addQuestion(form, `q3b.${selected}`);

      let updateOrder = this.Questions.q4;
      this.updateQuestionOrder(updateOrder, true);

      let newQuestion = {};
      newQuestion[`q3b.${selected}`] = updateOrder;
      this.Questions = {...this.Questions, ...newQuestion};
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

  public drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.orderAnswer12, event.previousIndex, event.currentIndex);
  }

  public saveOrderList12() {
    let data = [];
    this.orderAnswer12.forEach((value, i) => {
      data.push(`${i + 1} - ${value}`);
    });
    this.survey.controls['q12'].setValue(data);
    this.nextQuestion();
  }

  public askDemographic(order: string): boolean {
    return Object.keys(this.Questions).includes(order);
  }

  public updateDemographicStorage(order: string) {
    if (this.demoGraphicQuestions.includes(order) && this.survey.controls[order].value !== this.demographicAnswers.notAnswer.id) {
      this.surveyService.demograhicSkip(order);
    }
  }

  public getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }
}
