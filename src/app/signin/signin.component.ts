import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user/user.service';

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

  constructor(private router: Router, private userService: UserService) {}

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
        }
      );
    }
  }

  public setStage(newStage: EnumPageStage) {
    this.stage = newStage;
    if (this.stage === EnumPageStage.Permission) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          this.locationGranted = true;
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
