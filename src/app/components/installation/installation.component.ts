declare var window: any;

import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { UserService } from 'src/app/services/user/user.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { timer } from 'rxjs';

enum EnumPageStage { Landing, Intro01, Intro02, Intro03, OnInstall };
enum CopyStage {INIT, Copied};

@Component({
  selector: 'app-installation',
  templateUrl: './installation.component.html',
  styleUrls: ['./installation.component.scss']
})
export class InstallationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('appUrl') private appUrlInput: ElementRef;

  public PageStage = EnumPageStage;
  public stage: EnumPageStage = EnumPageStage.Landing;
  public clickable: boolean = true;
  public webappUrl: string;
  public CopyStage = CopyStage;
  public copyStage: CopyStage = CopyStage.INIT; 

  public deferredPrompt: any;
  public isShowAddBtn: boolean = false;

  // detect browser
  public isIOSSafari: boolean;
  public isIOSOther: boolean;
  public isMobileExceptIOS: boolean;
  public isDesktop: boolean;

  public viewHeight: string;
  private pID: string;

  constructor(private activatedRoute: ActivatedRoute, private userService: UserService) {
    this.viewHeight = `${window.innerHeight}px`;
    this.activatedRoute.queryParams.subscribe((params) => {
      this.pID = params['pid'] || this.userService.getParticipantID();
    })
  }
  
  ngOnInit() {
    this.detectBrowser();
    this.webappUrl = `${environment.autonomy_app_url}/ucberkeley?pid=${this.pID}`;
    if (this.isMobileExceptIOS) {
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        this.deferredPrompt = e;
        console.log('Prompt event is '+`${this.deferredPrompt ? '' : 'not'}`+' supported')
        // Update UI to notify the user they can add to home screen
        this.isShowAddBtn = true;
      });
    }
  }

  ngAfterViewInit() {
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

  public copy() {
    if (this.copyStage === CopyStage.INIT) {
      let nativeEl = this.appUrlInput.nativeElement;
      this.copyStage = CopyStage.Copied;
      nativeEl.insertAdjacentHTML('beforeend', '<input class="tempAccId">');
      const tempEl = nativeEl.getElementsByClassName('tempAccId')[0];
      tempEl.value = nativeEl.innerText;
      tempEl.select();
      window.document.execCommand('copy');
      tempEl.remove();
      timer(3 * 1000).subscribe(() => {
          this.copyStage = CopyStage.INIT;
      });
    }
  }

  public setStage(newStage: EnumPageStage) {
    this.stage = newStage;
  }
}
