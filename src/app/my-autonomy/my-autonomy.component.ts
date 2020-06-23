import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api/api.service';

@Component({
  selector: 'app-my-autonomy',
  templateUrl: './my-autonomy.component.html',
  styleUrls: ['./my-autonomy.component.scss']
})
export class MyAutonomyComponent implements OnInit {

  public myProfile: {
    autonomy_score: number,
    autonomy_score_delta: number,
    individual: {
      score: number,
      score_yesterday: number,
      symptom: number,
      symptom_delta: number,
      behavior: number,
      behavior_delta: number,
      last_update: number
    },
    neighbor: {
      confirm: number,
      confirm_delta: number,
      symptom: number,
      symptom_delta: number,
      behavior: number,
      behavior_delta: number,
      score: number,
      score_delta: number
    }
  }

  constructor(private apiService: ApiService) {
    this.getMyProfile();
  }

  ngOnInit() {
  }

  public getMyProfile(): void {
    this.apiService
      .request('get', 'api/autonomy_profile?me=true')
      .subscribe(
        (data: any) => {
          this.myProfile = data;
        },
        (err: any) => {
          console.log(err);
          // TODO: do something
        }
      )
  }

}
