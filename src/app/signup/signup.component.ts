import { Router } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

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

  constructor(private router: Router) {
    this.locationChecked = false;
    this.notifyChecked = false;
    this.notifyState = '/assets/img/plus.svg'
    this.locationState = '/assets/img/plus.svg'
  }

  ngOnInit() {}

  public locationPermission() {
    this.locationChecked = true;
    if (this.locationChecked) {
      this.locationState = '/assets/img/checked.svg';
    }
  }

  public notifyPermission() {
    this.notifyChecked = true;
    if (this.notifyChecked) {
      this.notifyState = '/assets/img/checked.svg';
    }
  }

  public done() {
    if (this.locationChecked && this.notifyChecked) {
      this.router.navigate(['dashboard']);
    }
  }

}
