import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user/user.service';

enum EnumPageStage { RecoveryPhrase, Permission }

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

  public PageStage = EnumPageStage;
  public stage: EnumPageStage = EnumPageStage.RecoveryPhrase;

  public key: string;

  constructor(private router: Router, private userService: UserService) { }

  ngOnInit() {
  }

  public signin() {
    this.userService.signin(this.key).subscribe(
      (data) => {
        this.router.navigate(['/dashboard']);
      },
      (err) => {
        console.log(err);
        // TODO: do something
      }
    )
  }
}
