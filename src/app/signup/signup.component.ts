declare var window: any;

import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { UserService } from '../services/user/user.service';
import { Router } from '@angular/router';

enum EnumPageStage { Intro01, Intro02, Intro03, OnInstall }

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, OnDestroy {
  @ViewChild('addBtn') private promoptBtn: ElementRef;

  public PageStage = EnumPageStage;
  public stage: EnumPageStage = EnumPageStage.Intro01;
  public clickable: boolean = true;
  public deferredPrompt: any;
  public isShowAddBtn: boolean = false;

  // detect browser
  public isIOSSafari: boolean;
  public isIOSOther: boolean;
  public isMobileExceptIOS: boolean;
  public isDesktop: boolean;

  public viewHeight: string;

  constructor(private router: Router, private userService: UserService) {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.router.navigate(['/landing']);
    }
    this.viewHeight = `${window.innerHeight}px`;
  }
  
  ngOnInit() {
    this.detectBrowser();

    if (this.isMobileExceptIOS) {
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        this.deferredPrompt = e;
        // Update UI to notify the user they can add to home screen
        this.isShowAddBtn = true;
      });
    }
  }

  ngOnDestroy() {
    if (this.isMobileExceptIOS) {
      window.removeEventListener('beforeinstallprompt');
    }
  }

  private detectBrowser() {
    this.isIOSSafari = /(iPad|iPhone|iPod)/gi.test(navigator.userAgent) &&
      !/CriOS/.test(navigator.userAgent) &&
      !/FxiOS/.test(navigator.userAgent) &&
      !/OPiOS/.test(navigator.userAgent) &&
      !/mercury/.test(navigator.userAgent);
    this.isIOSOther = /(iPad|iPhone|iPod)/gi.test(navigator.userAgent) && !this.isIOSSafari;
    this.isMobileExceptIOS = /(Android|BlackBerry|IEMobile|Opera Mini)/gi.test(navigator.userAgent);
    this.isDesktop = !this.isIOSSafari && !this.isIOSOther && !this.isMobileExceptIOS;
  }

  public addToHomeScreen() {
    if (this.deferredPrompt) {
      // hide our user interface that shows our A2HS button
      this.isShowAddBtn = false;
      // Show the prompt
      this.deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      this.deferredPrompt.userChoice
        .then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
          } else {
            console.log('User dismissed the A2HS prompt');
          }
          this.deferredPrompt = null;
        });
    }
  }

  public setStage(newStage: EnumPageStage) {
    this.stage = newStage;
  }
}
