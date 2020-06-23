import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user/user.service';
import { Router } from '@angular/router';
import { SwPush } from '@angular/service-worker';

enum EnumPageStage { Intro01, Intro02, Intro03, Permission }

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  public PageStage = EnumPageStage;
  public stage: EnumPageStage = EnumPageStage.Intro01;
  public locationGranted: boolean = false;
  public notificationGranted: boolean = false;

  constructor(private router: Router, private userService: UserService, private SwPush: SwPush) {
    this.locationGranted = false;
    this.notificationGranted = false;
  }

  ngOnInit() {
    // setTimeout(() => {
    //   this.signup();
    // }, 2000);
  }

  public signup(): void {
    this.userService.register().subscribe(
      (data) => {
        this.router.navigate(['/dashboard']);
      },
      (err) => {
        // TODO: do something
        console.log(err);
      }
    );
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
}
