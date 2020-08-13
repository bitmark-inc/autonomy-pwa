declare var window: any;

import { environment } from '../../environments/environment';
import { NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user/user.service';
import { ApiService } from '../services/api/api.service';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { BottomSheetAlertComponent } from '../bottom-sheet-alert/bottom-sheet-alert.component';
import { from } from 'rxjs';

enum EnumPageStage { Intro, Consent }

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"],
})
export class SignupComponent implements OnInit {
  public PageStage = EnumPageStage;
  public stage: EnumPageStage = EnumPageStage.Intro;
  public clickable: boolean = true;
  public isIOSSafari: boolean;
  public pID: string;
  public pidValid: boolean = true;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private userService: UserService, private apiService: ApiService, private bottomSheet: MatBottomSheet, private bottomSheetRef: MatBottomSheetRef, private http: HttpClient, private ngZone: NgZone) {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.pID = params['pid'] || this.userService.getParticipantID();
      this.userService.saveParticipantID(this.pID);
    })
    this.isIOSSafari = /(iPad|iPhone|iPod)/gi.test(navigator.userAgent) &&
      !/CriOS/.test(navigator.userAgent) &&
      !/FxiOS/.test(navigator.userAgent) &&
      !/OPiOS/.test(navigator.userAgent) &&
      !/mercury/.test(navigator.userAgent);
  }

  ngOnInit() {}

  private setStageByUrl(url: string = '') {
    switch (url) {
      case '/landing/p':
        this.stage = this.PageStage.Intro;
        break;
      case '/landing/p/irb':
        this.stage = this.PageStage.Consent;
        break;
      default:
        this.stage = this.PageStage.Intro;
        break;
    }
  }

  private openBottomSheet(): void {
    this.bottomSheetRef = this.bottomSheet.open(BottomSheetAlertComponent, {
      disableClose: true,
      data: {
        error: false,
        header: "CREATING",
        mainContent: "Creating your Autonomy account ...",
      },
    });
  }

  private downloadFile() {
    let headers = new HttpHeaders();
    headers = headers.set('Accept', 'application/pdf');
    this.http.get('/assets/files/UCB_Safe_Campus_Study_Informed_Consent.pdf', { headers: headers, responseType: 'arraybuffer' })
    .subscribe(
      (data: any) => {
      const aFile = new Blob([data], { type: 'application/pdf'});
      const url = window.URL.createObjectURL(aFile);
      let reader = new FileReader();
      let link = document.createElement('a');

      reader.onload = () => {
        link.href = url;
        link.target = '_blank';
        link.download = 'UCB_Safe_Campus_Study_Informed_Consent';
        link.click();
      }
      reader.readAsDataURL(aFile);
      },
      err => {},
      () => {
        if (this.isIOSSafari) {
          this.router.navigate(['/home/trends']);
        }
      }
    )
  }

  public isStandalone(): boolean {
    return window.matchMedia("(display-mode: standalone)").matches;
  }

  public consentMark(agree: boolean) {
    if (this.clickable) {
      this.clickable = false;
      this.apiService.requestByGuest('put', `${environment.autonomy_api_url}api/consent`,
      {
        participant_id: this.pID,
        consented: agree
      }).subscribe(() => {
        this.clickable = true;
        if (!agree) {
          this.stage = this.PageStage.Intro;
        }
      },
      (err) => {
        this.clickable = true;
        console.log(err);
      })
    }
  }

  public signup(needDownload: boolean = false): void {
    if (this.clickable) {
      this.clickable = false;
      this.openBottomSheet();
      this.userService.signup().subscribe(
        (data) => {
          this.clickable = true;
          this.consentMark(true);
          setTimeout(() => {
            this.bottomSheetRef.afterDismissed().subscribe(() => {
              if (needDownload) {
                this.ngZone.runOutsideAngular(() => {
                  this.downloadFile();
                });
                if (!this.isIOSSafari) {
                  this.router.navigate(['/home/trends']);
                }
              } else {
                this.router.navigate(['/home/trends']);
              }
            });
            this.bottomSheetRef.dismiss();
          }, 2.5 * 1000);
        },
        (err) => {
          // TODO: do something
          this.bottomSheetRef.afterDismissed().subscribe(() => {
            if (err.code === 5566) {
              this.userService.removeParticipantID();
              this.pID = '';
              this.stage = this.PageStage.Intro;
            }
            this.clickable = true;
          });
          this.bottomSheetRef.dismiss();
        }
      );
    }
  }
}
