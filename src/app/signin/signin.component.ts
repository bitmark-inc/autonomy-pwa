import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user/user.service';
import { EventEmitterService } from "../services/event-emitter.service";

@Component({
  selector: "app-signin",
  templateUrl: "./signin.component.html",
  styleUrls: ["./signin.component.scss"],
})
export class SigninComponent implements OnInit {
  public key: string;

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit() {}

  public signin() {
    if (this.key) {
      this.userService.signin(this.key).subscribe(
        (data) => {
          this.router.navigate(['/permission']);
        },
        (err) => {
          console.log(err);
          // TODO: do something
          EventEmitterService.getEventEmitter(EventEmitterService.Events.ModalDialog).emit({
            open: true,
            title: 'error',
            subTitle: 'INCORRECT RECOVERY KEY',
            message: 'You are unable to sign in because you entered an incorrect recovery key. Please double check your recovery key and try again.',
            type: 'warning'
          });
        }
      );
    }
  }
}
