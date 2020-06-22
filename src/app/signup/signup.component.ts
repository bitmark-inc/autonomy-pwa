import { Component, OnInit } from '@angular/core';

enum EnumPageStage { Intro01, Intro02, Intro03, Permission }

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  public PageStage = EnumPageStage;
  public stage: EnumPageStage = EnumPageStage.Intro01;

  constructor() { }

  ngOnInit() {}

}
