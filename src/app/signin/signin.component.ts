import { Component, OnInit } from '@angular/core';

enum EnumPageStage { RecoveryPhrase, Permission }

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

  public PageStage = EnumPageStage;
  public stage: EnumPageStage = EnumPageStage.RecoveryPhrase;

  constructor() { }

  ngOnInit() {
  }

}
