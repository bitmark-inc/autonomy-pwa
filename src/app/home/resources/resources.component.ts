import { Router } from '@angular/router';
import { ApiService } from './../../services/api/api.service';
import { Component, OnInit } from '@angular/core';
import { HomepageState as ParentContainerState } from '../homepage.state';

@Component({
  selector: "app-resources",
  templateUrl: "./resources.component.html",
  styleUrls: ["./resources.component.scss"],
})
export class ResourcesComponent implements OnInit {

  public resources: {
    id: string;
    name: string;
  }[];

  constructor(private apiService: ApiService, public router: Router) {
    this.getResourcesForSearching();
  }

  ngOnInit() {
  }

  public onInputFocus() {
    ParentContainerState.fullscreen.next(true);
  }

  private getResourcesForSearching() {
    this.apiService.request("get", `api/resources?suggestion=true`).subscribe(
      (data: { resources: any }) => {
        this.resources = data.resources;
      },
      (err) => {
        console.log(err);
        // TODO: do something
      }
    );
  }
}
