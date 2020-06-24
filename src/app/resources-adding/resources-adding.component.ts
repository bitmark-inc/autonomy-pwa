import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api/api.service';
import { v4 as uuidv4 } from 'uuid';

enum EnumPageView {Main, Search};

@Component({
  selector: 'app-resources-adding',
  templateUrl: './resources-adding.component.html',
  styleUrls: ['./resources-adding.component.scss']
})
export class ResourcesAddingComponent implements OnInit {
  public PageView = EnumPageView;
  public view: EnumPageView = EnumPageView.Main;

  public poiID: string;

  public resources: {
    id: string,
    name: string,
    picked: boolean,
    existing: boolean
  }[];

  public keyword: string;
  public autocompleteResources: {
    id: string,
    name: string,
    matched: boolean
  }[];

  constructor(private activatedRoute: ActivatedRoute, private location: Location, private apiService: ApiService) {
    this.autocompleteResources = [];
    this.keyword = '';

    this.activatedRoute.params.subscribe((params) => {
      this.poiID = params.id;
      this.getImportantResources();
    });
  }

  ngOnInit() {}

  public setView(newView: EnumPageView) {
    this.view = newView;
    if (this.view === EnumPageView.Search && this.autocompleteResources.length === 0) {
      this.getRecommendedResources();
    }
  }

  public autocomplete() {
    this.autocompleteResources.forEach((resource) => {
      resource.matched = resource.name.includes(this.keyword);
    });
  }

  public toggleResourcePicking(name: string, force?: boolean) {
    name = name.toLowerCase().trim();
    let found = this.resources.find(resource => resource.name === name);
    if (found) {
      found.picked = force === undefined ? !found.picked : force;
    } else {
      this.resources.push({
        id: uuidv4(),
        name: name,
        picked: true,
        existing: false
      })
    }
  }

  public submit() {
    let existingResources = this.resources.filter(resource => resource.existing && resource.picked).map(resource => resource.id);
    let newResources = this.resources.filter(resource => !resource.existing && resource.picked).map(resource => resource.name);

    this.apiService
      .request('post', `api/points-of-interest/${this.poiID}/resources`, {
        resource_ids: existingResources,
        new_resource_names: newResources
      })
      .subscribe(
        (data: {resources: any}) => {
          // Do something
        },
        (err: any) => {
          console.log(err);
          // TODO: do something
        }
      );
  }

  private getImportantResources(): void {
    this.apiService
      .request('get', `api/points-of-interest/${this.poiID}/resources?important=true`)
      .subscribe(
        (data: {resources: any}) => {
          this.resources = data.resources;
          this.resources.forEach((resource) => {
            resource.picked = false;
            resource.existing = true;
          });
        },
        (err: any) => {
          console.log(err);
          // TODO: do something
        }
      );
  }

  private getRecommendedResources() {
    this.apiService
      .request('get', `api/points-of-interest/${this.poiID}/resources`)
      .subscribe(
        (data: {resources: any}) => {
          this.autocompleteResources = data.resources;
          this.autocompleteResources.forEach(resource => resource.matched = false);
        },
        (err: any) => {
          console.log(err);
          // TODO: do something
        }
      );
  }

}
