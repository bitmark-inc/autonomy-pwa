declare var window: any;

import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { UserService } from '../services/user/user.service';
import { Router } from '@angular/router';

enum EnumPageStage { Intro01, Intro02, Intro03 }

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  @ViewChild('addBtn') private promoptBtn: ElementRef;

  public PageStage = EnumPageStage;
  public stage: EnumPageStage = EnumPageStage.Intro01;
  public clickable: boolean = true;
  public deferredPrompt: any;
  public isShowAddBtn: boolean = true;

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit() {
    if (this.promoptBtn) {
      const addBtn = this.promoptBtn.nativeElement.querySelector('.add-button');
      console.log(addBtn);

      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        this.deferredPrompt = e;
        // Update UI to notify the user they can add to home screen
        this.isShowAddBtn = true;

        addBtn.addEventListener('click', (e) => {
          // hide our user interface that shows our A2HS button
          this.isShowAddBtn = false;
          // Show the prompt
          this.deferredPrompt.prompt();
          // Wait for the user to respond to the prompt
          this.deferredPrompt.userChoice.then((choiceResult) => {
              if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
              } else {
                console.log('User dismissed the A2HS prompt');
              }
              this.deferredPrompt = null;
            });
        });
      });
    }
  }

  // public addToHomeScreen() {
  //   // hide our user interface that shows our A2HS button
  //   this.isShowAddBtn = false;
  //   // Show the prompt
  //   this.deferredPrompt.prompt();
  //   // Wait for the user to respond to the prompt
  //   this.deferredPrompt.userChoice
  //     .then((choiceResult) => {
  //       if (choiceResult.outcome === 'accepted') {
  //         console.log('User accepted the A2HS prompt');
  //       } else {
  //         console.log('User dismissed the A2HS prompt');
  //       }
  //       this.deferredPrompt = null;
  //     });
  // }


  public signup(): void {
    if (this.clickable) {
      this.clickable = false;
      this.userService.signup().subscribe(
        (data) => {
          this.clickable = true;
          this.router.navigate(['/home']);
        },
        (err) => {
          // TODO: do something
          this.clickable = true;
          console.log(err);
        }
      );
    }
  }

  public setStage(newStage: EnumPageStage) {
    this.stage = newStage;
  }
}
