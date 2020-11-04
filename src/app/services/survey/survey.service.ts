import { Injectable } from '@angular/core';
import { UserService } from '../user/user.service';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';

import * as moment from 'moment';

const FIRST_SURVEY_SUBMITTED: string = 'first_survey_submitted';
const NEXT_WEEKLY_SURVEY_AT: string = 'next_weekly_survey_at';
const NEXT_MONTHLY_SURVEY_AT: string = 'next_monthly_survey_at';
const SURVEY_TAKEN: string = 'survey-taken';

const WEEKLY_SURVEY_ID: string = 'weekly_02';
const FIRST_SURVEY: string = 'first_week_02';
const MONTHLY_SURVEY_ID: string = 'include_monthly_02';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {

  constructor(private userService: UserService, private apiService: ApiService) { }

  public weeklyCompleted() {
    this.userService.setPreference(NEXT_WEEKLY_SURVEY_AT, moment().add(7, 'days').format());
    this.userService.setPreference(NEXT_MONTHLY_SURVEY_AT, moment().add(28, 'days').format());
  }

  public surveyTaken() {
    // only apply for the first time uesr take the survey
    if (!this.userService.getPreference(SURVEY_TAKEN)) {
      this.userService.setPreference(SURVEY_TAKEN, true);
    }
  }

  public surveyDisabled(): boolean {
    return this.userService.getPreference(NEXT_WEEKLY_SURVEY_AT) && moment().isBefore(moment(this.userService.getPreference(NEXT_WEEKLY_SURVEY_AT)));
  }

  public includeDemoGraphic(order: string): boolean {
    return !this.userService.getPreference(`got_demographic_${order}`);
  }

  public includeMonthly(): boolean {
    return (this.userService.getPreference(NEXT_MONTHLY_SURVEY_AT) && moment().isAfter(moment(this.userService.getPreference(NEXT_MONTHLY_SURVEY_AT))));
  }

  public isFirstSurvey(): boolean {
    return !this.userService.getPreference(FIRST_SURVEY_SUBMITTED);
  }

  public submitSurvey(data) {
    let surveyID = this.isFirstSurvey() ? FIRST_SURVEY : (this.includeMonthly() ? MONTHLY_SURVEY_ID : WEEKLY_SURVEY_ID);
    return this.apiService.request('post', `${environment.autonomy_api_url}api/survey`, {
      survey_id: surveyID,
      contents: data
    }, null, null)
  }

  public firstSurveySubmitted() {
    this.userService.setPreference(FIRST_SURVEY_SUBMITTED, true);
  }

  public demograhicSkip(order: string) {
    this.userService.setPreference(`got_demographic_${order}`, true);
  }

}
