import { Injectable } from '@angular/core';
import { UserService } from '../user/user.service';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';

import * as moment from 'moment';

const NEXT_WEEKLY_SURVEY_AT: string = 'next_weekly_survey_at';
const SURVEY_TAKEN: string = 'survey-taken';
const SURVEY_GOT_DEMOGRAPHICS: string = 'survey_got_demographics';

const WEEKLY_SURVEY_ID: string = 'weekly_01';
const DEMOGRAPHICS_SURVEY_ID: string = 'weekly_include_demographics_01';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {

  constructor(private userService: UserService, private apiService: ApiService) { }

  public weeklyCompleted() {
    this.userService.setPreference(NEXT_WEEKLY_SURVEY_AT, moment().add(7, 'days').format());
    if (!this.userService.getPreference(SURVEY_GOT_DEMOGRAPHICS)) {
      this.userService.setPreference(SURVEY_GOT_DEMOGRAPHICS, true);
    }
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

  public includeDemoGraphics(): boolean {
    return !this.userService.getPreference(SURVEY_GOT_DEMOGRAPHICS);
  }

  public submitSurvey(data) {
    let surveyID = this.includeDemoGraphics() ? DEMOGRAPHICS_SURVEY_ID : WEEKLY_SURVEY_ID;
    return this.apiService.request('post', `${environment.autonomy_api_url}api/survey`, {
      survey_id: surveyID,
      contents: data
    }, null, null)
  }

}
