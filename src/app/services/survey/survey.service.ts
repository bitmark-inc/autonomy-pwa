import { Injectable } from '@angular/core';
import { UserService } from '../user/user.service';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';

import * as moment from 'moment';

const NEXT_WEEKLY_SURVEY_AT: string = 'next_weekly_survey_at';
const NEXT_MONTHLY_SURVEY_AT: string = 'next_monthly_survey_at';
const SURVEY_TAKEN: string = 'survey-taken';

const WEEKLY_SURVEY_ID: string = 'weekly_01';
const MONTHLY_SURVEY_ID: string = 'monthly_01';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {

  constructor(private userService: UserService, private apiService: ApiService) { }

  public weeklyCompleted() {
    this.userService.setPreference(NEXT_WEEKLY_SURVEY_AT, moment().add(7, 'days').format());
    if (this.includeMonthly()) {
      this.userService.setPreference(NEXT_MONTHLY_SURVEY_AT, moment().add(28, 'days').format());
    }
  }

  public surveyTaken() {
    if (!this.userService.getPreference(SURVEY_TAKEN)) {
      this.userService.setPreference(SURVEY_TAKEN, true);
      this.userService.setPreference(NEXT_MONTHLY_SURVEY_AT, moment().add(28, 'days').format());
    }
  }

  public surveyDisabled(): boolean {
    return this.userService.getPreference(NEXT_WEEKLY_SURVEY_AT) && moment().isBefore(moment(this.userService.getPreference(NEXT_WEEKLY_SURVEY_AT)));
  }

  public includeMonthly(): boolean {
    return (this.userService.getPreference(NEXT_MONTHLY_SURVEY_AT) && moment().isAfter(moment(this.userService.getPreference(NEXT_MONTHLY_SURVEY_AT))))
  }

  public submitSurvey(data) {
    let surveyID = this.includeMonthly() ? MONTHLY_SURVEY_ID : WEEKLY_SURVEY_ID;
    return this.apiService.request('post', `${environment.autonomy_api_url}api/survey`, {
      survey_id: surveyID,
      contents: data
    }, null, null)
  }

}
