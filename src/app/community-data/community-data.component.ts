declare var window: any;

import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { BottomSheetAlertComponent } from "../bottom-sheet-alert/bottom-sheet-alert.component";
import { ApiService } from '../services/api/api.service';
import { UserService } from '../services/user/user.service';
import { environment } from '../../environments/environment';

enum EnumPageStage { CDE, Submit, Save, Read }

@Component({
  selector: 'app-community-data',
  templateUrl: './community-data.component.html',
  styleUrls: ['./community-data.component.scss']
})
export class CommunityDataComponent implements OnInit {
  @ViewChild('saveFile') private saveFlieEl: ElementRef;

  public PageStage = EnumPageStage;
  public stage: EnumPageStage = EnumPageStage.CDE;
  public clickable: boolean = true;

  constructor(private router: Router, private bottomSheetRef: MatBottomSheetRef, private bottomSheet: MatBottomSheet, private apiService: ApiService, private userService: UserService, private location: Location) {
    this.setStageByUrl(this.router.url);
  }


  ngOnInit(): void {
  }

  private setStageByUrl(url: string = '') {
    switch (url) {
      case '/home/setting/cde/save':
        this.stage = this.PageStage.Save;
        break;
      case '/home/setting/cde/read':
        this.stage = this.PageStage.Read;
        break;
      case '/home/setting/cde/submit':
        this.stage = this.PageStage.Submit;
        break;
      default:
        this.stage = this.PageStage.CDE;
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
    }
  }

  private downloadFile(data) {
    const aFile = new Blob([data], { type: 'application/zip'});
    const url = window.URL.createObjectURL(aFile);

    let reader = new FileReader();

    reader.onload = () => {
      this.saveFlieEl.nativeElement.href = url;
      this.saveFlieEl.nativeElement.download = `CDS-export-${Date.now()}`;
      this.saveFlieEl.nativeElement.click();
      this.saveFlieEl.nativeElement.href = '#';
    }

    reader.readAsDataURL(aFile);
  }

  public exportData() {
    if (this.clickable) {
      this.clickable = false;
      this.openBottomSheet('export');
      this.apiService.requestToDS('get', `${environment.cds_url}data/export`, null, {responseType: 'arraybuffer'}, ApiService.DSTarget.CDS)
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
            this.bottomSheetRef.afterDismissed().subscribe(() => {
              this.clickable = true;
              window.alert(err.message);
            })
            this.bottomSheetRef.dismiss();
          })
    }
  }

  public back(): void {
    this.location.back();
  }
}
