declare var window: any;

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user/user.service';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { BottomSheetAlertComponent } from "../bottom-sheet-alert/bottom-sheet-alert.component";

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  public clickable: boolean = true;

  constructor(private router: Router, private userService: UserService, private bottomSheet: MatBottomSheet, private bottomSheetRef: MatBottomSheetRef) { }

  ngOnInit() {
  }

  private openBottomSheet(): void {
    this.bottomSheetRef = this.bottomSheet.open(BottomSheetAlertComponent, {
      disableClose: true,
      data: {
        error: false,
        header: 'CREATING',
        mainContent: 'Creating your Autonomy account ...',
      }
    });
  }

  public isStandalone(): boolean {
    return (window.matchMedia('(display-mode: standalone)').matches);
  }

  public signup(): void {
    if (this.clickable) {
      this.clickable = false;
      this.openBottomSheet()
      this.userService.signup().subscribe(
        (data) => {
          setTimeout(() => {
            this.bottomSheetRef.afterDismissed().subscribe(() => {
              this.clickable = true;
              this.router.navigate(['/home/community']);
            })
            this.bottomSheetRef.dismiss();
          }, 3 * 1000);
        },
        (err) => {
          // TODO: do something
          this.clickable = true;
          console.log(err);
        }
      );
    }
  }

}
