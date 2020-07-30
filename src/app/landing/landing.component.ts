declare var window: any;

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user/user.service'

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  public clickable: boolean = true;

  constructor(private router: Router, private userService: UserService) { }

  ngOnInit() {
  }

  public isStandalone(): boolean {
    // return (window.matchMedia('(display-mode: standalone)').matches);
    return true;
  }

  public signup(): void {
    if (this.clickable) {
      this.clickable = false;
      this.userService.signup().subscribe(
        (data) => {
          this.clickable = true;
          this.router.navigate(['/home/community']);
        },
        (err) => {
          // TODO: do something
          this.clickable = true;
          console.log(err);
        }
      );
    }
  }

}
