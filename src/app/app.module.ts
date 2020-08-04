import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { FormsModule } from "@angular/forms";

import { MatBottomSheetModule, MatBottomSheetRef } from "@angular/material/bottom-sheet";
import { MatTableModule } from "@angular/material/table";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatRadioModule } from "@angular/material/radio";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { GoogleMapsModule } from '@angular/google-maps'
import { TextFieldModule } from "@angular/cdk/text-field";
import { MatTabsModule } from '@angular/material/tabs';

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
import { PlaceDeltaPipe } from './pipes/place-delta.pipe';
import { SymptomDeltaPipe } from './pipes/symptom-delta.pipe';
import { ReportScorePipe } from './pipes/report-score.pipe';
import { RecoveryKeyComponent } from './recovery-key/recovery-key.component';
import { SignoutComponent } from './signout/signout.component';
import { HomeComponent } from './home/home.component';
import { CommunityComponent } from './home/community/community.component';
import { ResourcesComponent } from './home/resources/resources.component';
import { SettingComponent } from './home/setting/setting.component';
import { BottomSheetAlertComponent } from "./bottom-sheet-alert/bottom-sheet-alert.component";
import { RelativeDatePipe } from './pipes/relative-date.pipe';
import { PersonalDataComponent } from './personal-data/personal-data.component';
import { CommunityDataComponent } from './community-data/community-data.component';

declare var window: any;
window.isProduction = environment.production;

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    SigninComponent,
    SignupComponent,
    PoiComponent,
    RatingsComponent,
    PlaceDeltaPipe,
    SymptomDeltaPipe,
    ReportScorePipe,
    RecoveryKeyComponent,
    SignoutComponent,
    HomeComponent,
    CommunityComponent,
    ResourcesComponent,
    SettingComponent,
    BottomSheetAlertComponent,
    RelativeDatePipe,
    PersonalDataComponent,
    CommunityDataComponent,
  ],
  imports: [
    BrowserModule,
    HammerModule,
    AppRoutingModule,
    HttpClientModule,
    ServiceWorkerModule.register('OneSignalSDKWorker.js', { enabled: environment.production }),
    BrowserAnimationsModule,
    FormsModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatListModule,
    MatRadioModule,
    TextFieldModule,
    MatBottomSheetModule,
    MatProgressBarModule,
    GoogleMapsModule,
    MatTabsModule,
  ],
  providers: [
    UserService,
    ApiService,
    EventEmitterService,
    AuthGuard,
    GuestGuard,
    {provide: APP_INITIALIZER, useFactory: InitServices, deps: [UserService], multi: true},
    {provide: MatBottomSheetRef, useValue: {}}
  ],
  bootstrap: [AppComponent],
  entryComponents: [BottomSheetAlertComponent]
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
