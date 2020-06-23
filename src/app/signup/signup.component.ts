import { Component, OnInit } from '@angular/core';
import { UserService } from '../user/user.service';
import { Router } from '@angular/router';

enum EnumPageStage { Intro01, Intro02, Intro03, Permission }

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  public PageStage = EnumPageStage;
  public stage: EnumPageStage = EnumPageStage.Intro01;
  public locationChecked: boolean;
  public notifyChecked: boolean;
  public notifyState: any;
  public locationState: any;

  constructor(private router: Router, private userService: UserService) {
    this.locationChecked = false;
    this.notifyChecked = false;
    this.notifyState = '/assets/img/plus.svg'
    this.locationState = '/assets/img/plus.svg'
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

  public locationPermission() {
    this.locationChecked = true;
  }

  public notifyPermission() {
    this.notifyChecked = true;
  }

  public done() {
    if (this.locationChecked && this.notifyChecked) {
      this.router.navigate(['dashboard']);
    }
  }

}
