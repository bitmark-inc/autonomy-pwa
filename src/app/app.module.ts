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
  MatCheckboxModule,
  MatBottomSheetModule,
  MatProgressBarModule,
  MatBottomSheetRef,
} from "@angular/material";
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
import { AlertDialogComponent } from "./alert-dialog/alert-dialog.component";
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

declare var window: any;
window.isProduction = environment.production;

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    SigninComponent,
    SignupComponent,
    PoiComponent,
    AlertDialogComponent,
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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
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
    MatCheckboxModule,
    MatProgressBarModule,
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
