declare var window: any;

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../services/user/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.scss']
})
export class PermissionComponent implements OnInit {

  public locationGranted: boolean = false;
  public notificationGranted: boolean = false;
  public OneSignal = window.OneSignal;

  constructor(private router: Router, private userService: UserService, private ref: ChangeDetectorRef) {
    this.locationGranted = false;
    this.notificationGranted = false;

    this.OneSignal.push(() => {
      var isPushSupported = this.OneSignal.isPushNotificationsSupported();
      console.log(`Push notification is ${isPushSupported ? '' : 'not '}supported`);
    });

    this.OneSignal.push(() => {
      this.OneSignal.isPushNotificationsEnabled((isEnabled: boolean) => {
        console.log(`Push notification is ${isEnabled ? '' : 'not '}enabled`);
        this.notificationGranted = isEnabled;
        this.submitOneSignalTag();
        this.ref.detectChanges();

        if (!isEnabled) {
          this.listenOnSubscriptionChange();
        }
      });
    });
  }

  ngOnInit() {}

  public listenOnSubscriptionChange(): void {
    this.OneSignal.push(() => {
      this.OneSignal.on('subscriptionChange', (isSubscribed: boolean) => {
        if (!this.notificationGranted && isSubscribed) {
          this.submitOneSignalTag();
        }
        this.notificationGranted = isSubscribed;
        this.ref.detectChanges();
      });
    });
  }

  public submitOneSignalTag(): void {
    this.OneSignal.push(() => {
      this.OneSignal.sendTag('account_number', this.userService.getAccountNumber());
    })
  }

  public grantNotificationPermission() {
    this.OneSignal.push(() => {
      this.OneSignal.showNativePrompt();
    });
  }

  public grantLocationPermission() {
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
