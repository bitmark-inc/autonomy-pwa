import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user/user.service';

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
  public locationChecked: boolean;
  public notifyChecked: boolean;

  constructor(private router: Router, private userService: UserService) {
    this.locationChecked = false;
    this.notifyChecked = false;
  }

  ngOnInit() {}

  public signin() {
    if (this.key) {
      this.userService.signin(this.key).subscribe(
        (data) => {
          this.stage = this.PageStage.Permission;
        },
        (err) => {
          console.log(err);
          // TODO: do something
        }
      );
    }
  }

  public locationPermission() {
    this.locationChecked = true;
  }

  public notifyPermission() {
    this.notifyChecked = true;
  }

  public done() {
    if (this.locationChecked && this.notifyChecked) {
      this.router.navigate(["/dashboard"]);
    }
  }
}
