import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api/api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public myAutonomy: { autonomy_score: number }
  public pois: { id: string, score: number }[];

  constructor(private apiService: ApiService) {
    this.getMyAutonomy();
    this.getMyPOIs();
  }

  ngOnInit() {}

  public getMyAutonomy(): void {
    this.apiService
      .request('get', 'api/autonomy_profile?me=true')
      .subscribe(
        (data: any) => {
          this.myAutonomy = data;
        },
        (err: any) => {
          console.log(err);
          // TODO: do something
        }
      )
  }

  public getMyPOIs(): void {
    this.apiService
      .request('get', 'api/accounts/me/pois')
      .subscribe(
        (data: any) => {
          this.pois = data;
        },
        (err: any) => {
          console.log(err);
          // TODO: do something
        }
      )
  }

}
