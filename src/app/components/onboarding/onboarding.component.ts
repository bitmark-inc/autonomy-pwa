declare var window: any;

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user/user.service';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { BottomSheetAlertComponent } from '../bottom-sheet-alert/bottom-sheet-alert.component';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent implements OnInit {
  public clickable: boolean = true;
  public pID: string;

  constructor(private router: Router, private userService: UserService, private bottomSheet: MatBottomSheet, private bottomSheetRef: MatBottomSheetRef) {}

  ngOnInit() {}

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

  public isStandalone(): boolean {
    return window.matchMedia("(display-mode: standalone)").matches;
  }

  public signup(): void {
    if (this.clickable) {
      this.clickable = false;
      this.openBottomSheet();
      this.userService.signup().subscribe(
        (data) => {
          setTimeout(() => {
            this.bottomSheetRef.afterDismissed().subscribe(() => {
              this.clickable = true;
              this.router.navigate(['/home']);
            });
            this.bottomSheetRef.dismiss();
          }, 3 * 1000);
        },
        (err) => {
          // TODO: do something
          this.bottomSheetRef.afterDismissed().subscribe(() => {
            window.alert(err.message);
            this.clickable = true;
          });
          this.bottomSheetRef.dismiss();
        }
      );
    }
  }
}
