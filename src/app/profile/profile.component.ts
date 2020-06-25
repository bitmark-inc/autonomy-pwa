declare var window: any;

import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { UserService } from '../services/user/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  constructor(private location: Location, private userService: UserService) { }

  ngOnInit() {}

  public back(): void {
    this.location.back();
  }

  public openIntercom(): void {
    let hash = window.sha3_256(this.userService.getAccountNumber());
    let icUserID = `Autonomy_pwa_${hash}`;
    window.Intercom('boot', {
      app_id: window.App.config.IntercomAppID,
      user_id: icUserID,
      hide_default_launcher: true
    });
    window.Intercom('show');
  }

}
