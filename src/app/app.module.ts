import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { FormsModule } from "@angular/forms";
import {
  MatToolbarModule,
  MatCardModule,
  MatGridListModule,
  MatDialogModule,
  MatButtonModule,
  MatIconModule,
  MatTableModule,
  MatListModule,
  MatRadioModule,
} from "@angular/material";
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { TextFieldModule } from "@angular/cdk/text-field";

import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule }    from '@angular/common/http';

import { UserService } from './services/user/user.service';
import { ApiService } from './services/api/api.service';
import { EventEmitterService } from "./services/event-emitter.service";
import { AuthGuard, GuestGuard } from './url-guard';

import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LandingComponent } from './landing/landing.component';
import { PoiComponent } from './poi/poi.component';
import { RatingsComponent } from './ratings/ratings.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { ProfileComponent } from './profile/profile.component';
import { AlertDialogComponent } from "./alert-dialog/alert-dialog.component";
import { PoiSearchComponent } from './poi-search/poi-search.component';
import { PlaceDeltaPipe } from './pipes/place-delta.pipe';
import { SymptomDeltaPipe } from './pipes/symptom-delta.pipe';
import { ReportScorePipe } from './pipes/report-score.pipe';
import { PermissionComponent } from './permission/permission.component';
import { RecoveryKeyComponent } from './recovery-key/recovery-key.component';
import { SignoutComponent } from './signout/signout.component';
import { HomeComponent } from './home/home.component';
import { YouComponent } from './home/you/you.component';
import { CommunityComponent } from './home/community/community.component';
import { ResourcesComponent } from './home/resources/resources.component';
import { BottomSheetAlertComponent } from "./bottom-sheet-alert/bottom-sheet-alert.component";

declare var window: any;
window.isProduction = environment.production;

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    SigninComponent,
    SignupComponent,
    ProfileComponent,
    PoiComponent,
    AlertDialogComponent,
    PoiSearchComponent,
    RatingsComponent,
    PlaceDeltaPipe,
    SymptomDeltaPipe,
    ReportScorePipe,
    PermissionComponent,
    RecoveryKeyComponent,
    SignoutComponent,
    HomeComponent,
    YouComponent,
    CommunityComponent,
    ResourcesComponent,
    BottomSheetAlertComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ServiceWorkerModule.register('OneSignalSDKWorker.js', { enabled: environment.production }),
    BrowserAnimationsModule,
    FormsModule,
    MatToolbarModule,
    MatCardModule,
    MatGridListModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatListModule,
    MatRadioModule,
    TextFieldModule,
    MatBottomSheetModule,
  ],
  providers: [
    UserService,
    ApiService,
    EventEmitterService,
    AuthGuard,
    GuestGuard,
    {provide: APP_INITIALIZER, useFactory: InitServices, deps: [UserService], multi: true}
  ],
  bootstrap: [AppComponent],
  entryComponents: [AlertDialogComponent, BottomSheetAlertComponent]
})
export class AppModule { }

export function InitServices(userService: UserService) {
  return (): Promise<any> => {
    return new Promise((resolve, reject) => {
      userService.getStatus().subscribe(ready => {
        if (ready) {
          resolve();
        }
      })
    });
  }
}
