import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user/user.service';
import { EventEmitterService } from "../services/event-emitter.service";
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { BottomSheetAlertComponent } from "../bottom-sheet-alert/bottom-sheet-alert.component";

@Component({
  selector: "app-signin",
  templateUrl: "./signin.component.html",
  styleUrls: ["./signin.component.scss"],
})
export class SigninComponent implements OnInit {
  public key: string;

  constructor(private router: Router, private userService: UserService, private bottomSheet: MatBottomSheet, private bottomSheetRef: MatBottomSheetRef) {}

  ngOnInit() {}

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
    if (this.key) {
      this.openBottomSheet("ok");
      this.userService.signin(this.key).subscribe(
        (data) => {
          setTimeout(() => {
            this.bottomSheetRef.afterDismissed().subscribe(() => {
              this.router.navigate(['/home']);
            });
            this.bottomSheetRef.dismiss();
          }, 3 * 1000);
        },
        (err) => {
          console.log(err);
          // TODO: do something
          this.openBottomSheet('error');
          EventEmitterService.getEventEmitter(EventEmitterService.Events.BottomSheetBtn).subscribe((data) => {
            if (data.action) { // left action
              this.bottomSheetRef.afterDismissed().subscribe(() => {
                this.key = '';
              })
              this.bottomSheetRef.dismiss();
            } else { // right action
              this.bottomSheetRef.dismiss();
            }
          })
        }
      );
    }
  }
}
