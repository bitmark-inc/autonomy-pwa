import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UserService } from "../services/user/user.service";
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { BottomSheetAlertComponent } from "../bottom-sheet-alert/bottom-sheet-alert.component";

enum EnumPageStage { Direction, Keys }

@Component({
  selector: 'app-signout',
  templateUrl: './signout.component.html',
  styleUrls: ['./signout.component.scss']
})
export class SignoutComponent implements OnInit {
  public PageStage = EnumPageStage;
  public stage: EnumPageStage = EnumPageStage.Direction;
  public key: string;
  public clickable: boolean = true;

  constructor(private userService: UserService, private router: Router, private bottomSheet: MatBottomSheet, private bottomSheetRef: MatBottomSheetRef) { }

  ngOnInit() {
  }

  private checkRecoveryWords() {
    this.key = this.key.trim();
    let systemWords = this.userService.getRecoveryPhrase();
    return this.key === systemWords;
  }

  private openBottomSheet(type): void {
    if (type === 'error') {
      this.bottomSheetRef = this.bottomSheet.open(BottomSheetAlertComponent, {
        disableClose: true,
        data: {
          error: true,
          header: 'error',
          title: 'INCORRECT RECOVERY KEY',
          mainContent: 'You are unable to sign out because you entered an incorrect recovery key for your account. Please try again or double check your recovery key.',
          leftBtn: 'check key',
          rightBtn: 'try again',
          leftBtnAction: () => {
            this.bottomSheetRef.afterDismissed().subscribe(() => {
              this.router.navigate(['/home/setting/recovery-key']);
            })
            this.bottomSheetRef.dismiss();
          },
          rightBtnAction: () => { this.bottomSheetRef.dismiss() }
        }
      });
    } else {
      this.bottomSheetRef = this.bottomSheet.open(BottomSheetAlertComponent, {
        disableClose: true,
        data: {
          error: false,
          header: 'signing out',
          mainContent: 'Please wait while we sign you out of Autonomy ...',
        }
      });
    }
  }

  public signout() {
    if (!navigator.onLine) {
      window.alert('Please check your network connection, then try again.');
      return false;
    }
    if (this.clickable && this.key && this.key.trim().split(' ').length === 13) {
      this.clickable = false;
      if (this.checkRecoveryWords()) {
        this.openBottomSheet('ok');
        this.userService.signout();
        setTimeout(() => {
          this.bottomSheetRef.afterDismissed().subscribe(() => {
            this.clickable = true;
            this.router.navigate(['/onboarding']);
          })
          this.bottomSheetRef.dismiss();
        }, 3 * 1000);
      } else {
        // show error dialog
        this.openBottomSheet('error');
        this.clickable = true;
      }
    }
  }

}
