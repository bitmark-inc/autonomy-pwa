import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api/api.service';

enum EnumPageView {Main, Search, Thanks, CommonGuide};

@Component({
  selector: "app-report-behavior",
  templateUrl: "./report-behavior.component.html",
  styleUrls: ["./report-behavior.component.scss"],
})
export class ReportBehaviorComponent implements OnInit {
  @ViewChild("searchInput", { static: true }) searchInput: ElementRef;

  public PageView = EnumPageView;
  public view: EnumPageView = EnumPageView.Main;

  public behaviors: {
    id: string;
    name: string;
    description: string;
    existing: boolean;
    recommended: boolean;
    picked: boolean;
  }[];

  public keyword: string;

  public autocompleteBehaviors: {
    id: string;
    name: string;
    description: string;
    matched: boolean;
  }[];

  public behaviorMetric: {
    me: {
      total_today: number;
      delta: number;
    };
    community: {
      avg_today: number;
      delta: number;
    };
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private apiService: ApiService,
    public router: Router
  ) {
    this.autocompleteBehaviors = [];
    this.keyword = "";
    this.getBehaviors();
    this.getAutocompleteBehaviors();
  }

  ngOnInit() {}

  public setView(newView: EnumPageView) {
    this.view = newView;
    if (this.view === EnumPageView.Search) {
      if (this.autocompleteBehaviors.length === 0) {
        this.getAutocompleteBehaviors();
      }
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      }, 100);
    } else if (this.view === EnumPageView.Thanks && !this.behaviorMetric) {
      this.getBehaviorMetric();
    }
  }

  public autocomplete() {
    this.autocompleteBehaviors.forEach((behavior) => {
      behavior.matched = behavior.name.includes(this.keyword);
    });
  }

  public toggleBehaviorPicking(name: string, force?: boolean) {
    name = name.toLowerCase().trim();
    let found = this.behaviors.find((behavior) => behavior.name.toLowerCase() === name);
    if (found) {
      found.picked = force === undefined ? !found.picked : force;
    } else {
      this.addBehavior(name);
    }
  }

  public addBehavior(name: string) {
    this.apiService
      .request("post", "api/behaviors", {
        name: name,
        description: "",
      })
      .subscribe((data: {id: string}) => {
        this.behaviors.push({
          id: data.id,
          name,
          description: '',
          recommended: false,
          existing: true,
          picked: true
        });
      });
  }

  public submit() {
    let report = this.behaviors
      .filter((symptom) => symptom.picked)
      .map((symptom) => symptom.id);
    if (!report.length) {
      return;
    }

    this.apiService
      .request("post", "api/behaviors/report", {
        behaviors: report,
      })
      .subscribe(
        () => {
          this.setView(EnumPageView.Thanks);
        },
        (err: any) => {
          console.log(err);
          // TODO: do something
        }
      );
  }

  public existNearBehaviours() {
    return this.behaviors.some((b) => !b.recommended);
  }

  public isSubmit() {
    return this.behaviors.some((b) => b.picked);
  }

  private getBehaviors(): void {
    this.apiService.request("get", `api/v2/behaviors`).subscribe(
      (data: { official_behaviors: any; neighborhood_behaviors: any }) => {
        this.behaviors = [];
        data.official_behaviors.forEach((symptom) => {
          symptom.recommended = true;
          symptom.existing = true;
          symptom.picked = false;
          this.behaviors.push(symptom);
        });
        data.neighborhood_behaviors.forEach((symptom) => {
          symptom.recommended = false;
          symptom.existing = true;
          symptom.picked = false;
          this.behaviors.push(symptom);
        });
      },
      (err: any) => {
        console.log(err);
        // TODO: do something
      }
    );
  }

  private getAutocompleteBehaviors(): void {
    this.apiService.request("get", `api/v2/behaviors?all=true`).subscribe(
      (data: { customized_behaviors: any; official_behaviors: any }) => {
        this.autocompleteBehaviors = data.official_behaviors.concat(
          data.customized_behaviors
        );
      },
      (err: any) => {
        console.log(err);
        // TODO: do something
      }
    );
  }

  private getBehaviorMetric(): void {
    this.apiService.request("get", "api/metrics/behavior").subscribe(
      (data) => {
        this.behaviorMetric = data;
      },
      (err: any) => {
        console.log(err);
        // TODO: do something
      }
    );
  }
}
