declare var window: any;

import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { BottomSheetAlertComponent } from "../bottom-sheet-alert/bottom-sheet-alert.component";
import { ApiService } from '../services/api/api.service';
import { UserService } from '../services/user/user.service';
import { environment } from '../../environments/environment';

enum EnumPageStage { PDE, Save, Read, Delete }

@Component({
  selector: "app-personal-data",
  templateUrl: "./personal-data.component.html",
  styleUrls: ["./personal-data.component.scss"],
})
export class PersonalDataComponent implements OnInit {
  @ViewChild('saveFile') private saveFlieEl: ElementRef;

  public PageStage = EnumPageStage;
  public stage: EnumPageStage = EnumPageStage.PDE;
  public clickable: boolean = true;

  constructor(private router: Router, private bottomSheetRef: MatBottomSheetRef, private bottomSheet: MatBottomSheet, private apiService: ApiService, private userService: UserService, private location: Location) {
    this.setStageByUrl(this.router.url);
  }

  ngOnInit(): void {}

  private setStageByUrl(url: string = '') {
    switch (url) {
      case '/home/setting/pde/save':
        this.stage = this.PageStage.Save;
        break;
      case '/home/setting/pde/read':
        this.stage = this.PageStage.Read;
        break;
      case '/home/setting/pde/delete':
        this.stage = this.PageStage.Delete;
        break;
      default:
        this.stage = this.PageStage.PDE;
        break;
    }
  }

  private openBottomSheet(type): void {
    if (type == 'export') {
      this.bottomSheetRef = this.bottomSheet.open(BottomSheetAlertComponent, {
        disableClose: true,
        data: {
          error: false,
          header: 'exporting',
          mainContent: 'Please wait while your data is processed for export ...',
        }
      });
    } else if (type == 'delete') {
      this.bottomSheetRef = this.bottomSheet.open(BottomSheetAlertComponent, {
        disableClose: true,
        data: {
          error: false,
          header: 'deleting',
          mainContent: 'Please wait while your data is deleted ...',
        }
      });
    }
  }

  private downloadFile(data) {
    const aFile = new Blob([data], { type: 'application/zip'});
    const url = window.URL.createObjectURL(aFile);

    let reader = new FileReader();

    reader.onload = () => {
      this.saveFlieEl.nativeElement.href = url;
      this.saveFlieEl.nativeElement.target = '_blank';
      this.saveFlieEl.nativeElement.download = `PDS-export-${Date.now()}`;
      this.saveFlieEl.nativeElement.click();
      this.saveFlieEl.nativeElement.href = '#';
    }
    reader.readAsDataURL(aFile);
  }

  public exportData() {
    if (this.clickable) {
      this.clickable = false;
      this.openBottomSheet('export');
      this.apiService.requestToDS('get', `${environment.pds_url}data/export`, null, {responseType: 'arraybuffer'}, ApiService.DSTarget.PDS)
          .subscribe((data) => {
            setTimeout(() => {
              this.bottomSheetRef.afterDismissed().subscribe(() => {
                this.downloadFile(data);
                this.clickable = true;
              })
              this.bottomSheetRef.dismiss();
            }, 3 * 1000);
          },
          (err) => {
            console.log(err);
            this.clickable = true;
            this.bottomSheetRef.dismiss();
          })
    }
  }

  public deleteData() {
    if (this.clickable) {
      this.clickable = false;
      if (window.confirm('All of your data will be permanently deleted from your PDE.')) {
        this.openBottomSheet('delete');
        this.apiService.requestToDS('delete', `${environment.pds_url}data/delete`, null, {responseType: 'arraybuffer'}, ApiService.DSTarget.PDS)
            .subscribe(() => {
              this.userService.signout();
              setTimeout(() => {
                this.bottomSheetRef.afterDismissed().subscribe(() => {
                  this.clickable = true;
                  this.router.navigate(['onboarding']);
                });
                this.bottomSheetRef.dismiss();
              }, 3 * 1000);
            },
            (err) => {
              console.log(err);
              this.clickable = true;
              this.bottomSheetRef.dismiss();
            })
      } else {
        this.clickable = true;
      }
    }
  }

  public back(): void {
    this.location.back();
  }
}
