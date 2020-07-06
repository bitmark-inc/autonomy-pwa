import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UserService } from "../services/user/user.service";
import { EventEmitterService } from "../services/event-emitter.service";
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

  constructor(private userService: UserService, private router: Router, private bottomSheet: MatBottomSheet) { }

  ngOnInit() {
  }

  private checkRecoveryWords() {
    let systemWords = this.userService.getRecoveryPhrase();
    return this.key.trim() === systemWords;
  }

  private openBottomSheet(type): void {
    if (type === 'error') {
      this.bottomSheet.open(BottomSheetAlertComponent, {
        data: {
          error: true,
          header: 'error',
          title: 'INCORRECT RECOVERY KEY',
          mainContent: 'You are unable to sign out because you entered an incorrect recovery key for your account. Please try again or double check your recovery key.',
          leftBtn: 'check key',
          rightBtn: 'try again',
        }
      });
    } else {
      this.bottomSheet.open(BottomSheetAlertComponent, {
        data: {
          error: false,
          header: 'signing out',
          mainContent: 'Please wait while we sign you out of Autonomy ...',
        }
      });
    }
  }

  public signout() {
    if (this.key && this.key.split(' ').length === 13) {
      if (this.checkRecoveryWords()) {
        this.userService.signout();
        this.router.navigate(['/landing']);
      } else {
        // show error dialog
        this.openBottomSheet('error');
      }
    }
  }

}
