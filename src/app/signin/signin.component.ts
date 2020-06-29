import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user/user.service';
import { EventEmitterService } from "../services/event-emitter.service";

enum EnumPageStage { RecoveryPhrase, Permission }

@Component({
  selector: "app-signin",
  templateUrl: "./signin.component.html",
  styleUrls: ["./signin.component.scss"],
})
export class SigninComponent implements OnInit {
  public PageStage = EnumPageStage;
  public stage: EnumPageStage = EnumPageStage.RecoveryPhrase;

  public key: string;
  public locationGranted: boolean = false;
  public notificationGranted: boolean = false;

  constructor(private router: Router, private userService: UserService, private ref: ChangeDetectorRef) {}

  ngOnInit() {}

  public signin() {
    if (this.key) {
      this.userService.signin(this.key).subscribe(
        (data) => {
          this.setStage(EnumPageStage.Permission);
        },
        (err) => {
          console.log(err);
          // TODO: do something
          EventEmitterService.getEventEmitter(EventEmitterService.Events.ModalDialog).emit({
            open: true,
            title: 'error',
            subTitle: 'INCORRECT RECOVERY KEY',
            message: 'You are unable to sign in because you entered an incorrect recovery key. Please double check your recovery key and try again.',
            type: 'warning'
          });
        }
      );
    }
  }

  public setStage(newStage: EnumPageStage) {
    this.stage = newStage;
    if (this.stage === EnumPageStage.Permission) {
      this.userService
        .startTrackingLocation()
        .subscribe(
          (coordinate) => {
            this.locationGranted = true;
            this.ref.detectChanges();
          },
          (err) => {
            console.log('Getting user location error');
            switch(err.code) {
              case err.PERMISSION_DENIED:
                console.log("User denied the request for Geolocation.");
                break;
              case err.POSITION_UNAVAILABLE:
                console.log("Location information is unavailable.");
                break;
              case err.TIMEOUT:
                console.log("The request to get user location timed out.");
                break;
              default:
                console.log("An unknown error occurred.");
                break;
            }
          }
        )
    }
  }

  public done() {
    this.router.navigate(["/dashboard"]);
  }
}
