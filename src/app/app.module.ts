import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { MatBottomSheetModule, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { GoogleMapsModule } from '@angular/google-maps'
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule }    from '@angular/common/http';

import { UserService } from './services/user/user.service';
import { ApiService } from './services/api/api.service';
import { EventEmitterService } from './services/event-emitter.service';
import { FeedbackService } from './services/feedback/feedback.service';
import { PWAUserGuard, PWAGuestGuard, PWAGuard, BrowserGuard, ParticipantGuard, NetworkGuard } from './url-guard';

import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InstallationComponent } from './components/installation/installation.component'
import { PoiComponent } from './components/poi/poi.component';
import { RatingsComponent } from './components/ratings/ratings.component';
import { SigninComponent } from './components/signin/signin.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { PlaceDeltaPipe } from './pipes/place-delta.pipe';
import { SymptomDeltaPipe } from './pipes/symptom-delta.pipe';
import { ReportScorePipe } from './pipes/report-score.pipe';
import { RecoveryKeyComponent } from './components/recovery-key/recovery-key.component';
import { SignoutComponent } from './components/signout/signout.component';
import { HomeComponent } from './components/home/home.component';
import { ResourcesComponent } from './components/home/resources/resources.component';
import { SettingComponent } from './components/home/setting/setting.component';
import { BottomSheetAlertComponent } from './components/bottom-sheet-alert/bottom-sheet-alert.component';
import { RelativeDatePipe } from './pipes/relative-date.pipe';
import { PersonalDataComponent } from './components/personal-data/personal-data.component';
import { CommunityDataComponent } from './components/community-data/community-data.component';
import { NoContentComponent } from './components/no-content/no-content.component';
import { SearchResultsNamePipe } from './pipes/search-results-name.pipe';
import { FeedbackDialogComponent } from './components/feedback-dialog/feedback-dialog.component';

declare var window: any;
window.isProduction = environment.production;

@NgModule({
  declarations: [
    AppComponent,
    InstallationComponent,
    SigninComponent,
    OnboardingComponent,
    PoiComponent,
    RatingsComponent,
    PlaceDeltaPipe,
    SymptomDeltaPipe,
    ReportScorePipe,
    RecoveryKeyComponent,
    SignoutComponent,
    HomeComponent,
    ResourcesComponent,
    SettingComponent,
    BottomSheetAlertComponent,
    RelativeDatePipe,
    PersonalDataComponent,
    CommunityDataComponent,
    NoContentComponent,
    SearchResultsNamePipe,
    FeedbackDialogComponent,
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
    MatDialogModule,
  ],
  providers: [
    UserService,
    ApiService,
    EventEmitterService,
    FeedbackService,
    PWAUserGuard, PWAGuestGuard, PWAGuard, BrowserGuard, ParticipantGuard, NetworkGuard,
    {provide: APP_INITIALIZER, useFactory: InitServices, deps: [UserService], multi: true},
    {provide: MatBottomSheetRef, useValue: {}},
    {provide: MatDialogRef, useValue: {}}
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
