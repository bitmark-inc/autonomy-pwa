import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user/user.service';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { BottomSheetAlertComponent } from "../bottom-sheet-alert/bottom-sheet-alert.component";

@Component({
  selector: "app-signin",
  templateUrl: "./signin.component.html",
  styleUrls: ["./signin.component.scss"],
})
export class SigninComponent implements OnInit {
  @ViewChild('recoveryKey', { static: true }) recoveryKey: ElementRef;

  public key: string;
  public clickable: boolean = true;

  constructor(private router: Router, private userService: UserService, private bottomSheet: MatBottomSheet, private bottomSheetRef: MatBottomSheetRef) {}

  ngOnInit() {
    // this.recoveryKey.nativeElement.focus();
  }

  private openBottomSheet(type): void {
    if (type === 'error') {
      this.bottomSheetRef = this.bottomSheet.open(BottomSheetAlertComponent, {
        disableClose: true,
        data: {
          error: true,
          header: 'error',
          title: 'INCORRECT RECOVERY KEY',
          mainContent: 'You are unable to sign in because you entered an incorrect recovery key. Please double check your recovery key and try again.',
          leftBtn: 'cancel',
          rightBtn: 'try again',
          leftBtnAction: () => {
            this.bottomSheetRef.afterDismissed().subscribe(() => {
              this.key = '';
            })
            this.bottomSheetRef.dismiss();
          },
          rightBtnAction: () => { this.bottomSheetRef.dismiss() },
        }
      });
    } else {
      this.bottomSheetRef = this.bottomSheet.open(BottomSheetAlertComponent, {
        disableClose: true,
        data: {
          error: false,
          header: 'signing in',
          mainContent: 'Please wait while we sign you in to Autonomy and recover your account ...',
        }
      });
    }
  }

  public signin() {
    if (!navigator.onLine) {
      window.alert('No internet. Please check your network connection.');
      return false;
    }
    if (this.clickable && this.key) {
      this.clickable = false;
      this.openBottomSheet("ok");
      this.userService.signin(this.key.trim()).subscribe(
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
          this.clickable = true;
          this.openBottomSheet('error');
        }
      );
    }
  }
}
