declare var window: any;

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../services/user/user.service';
import { Router } from '@angular/router';

enum EnumPageStage { Intro01, Intro02, Intro03 }

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  public PageStage = EnumPageStage;
  public stage: EnumPageStage = EnumPageStage.Intro01;

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit() {}

  public signup(): void {
    this.userService.register().subscribe(
      (data) => {
        this.router.navigate(['/permission']);
      },
      (err) => {
        // TODO: do something
        console.log(err);
      }
    );
  }

  public setStage(newStage: EnumPageStage) {
    this.stage = newStage;
  }
}
