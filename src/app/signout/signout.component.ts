import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UserService } from "../services/user/user.service";

enum EnumPageStage { Direction, Keys }

@Component({
  selector: 'app-signout',
  templateUrl: './signout.component.html',
  styleUrls: ['./signout.component.scss']
})
export class SignoutComponent implements OnInit {
  public PageStage = EnumPageStage;
  public stage: EnumPageStage = EnumPageStage.Direction;
  public key: string;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
  }

  public signout() {
    if (this.key) {
      this.userService.signout();
      this.router.navigate(['/landing']);
    }
  }

}
