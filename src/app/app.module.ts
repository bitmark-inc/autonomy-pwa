import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { FormsModule } from "@angular/forms";
import { MatToolbarModule, MatCardModule, MatGridListModule, MatDialogModule, MatButtonModule, MatIconModule } from '@angular/material';

import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule }    from '@angular/common/http';

import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LandingComponent } from './landing/landing.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PoiComponent } from './poi/poi.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { ProfileComponent } from './profile/profile.component';
import { ReportSymptomComponent } from './report-symptom/report-symptom.component';
import { ReportBehaviorComponent } from './report-behavior/report-behavior.component';

import { UserService } from './services/user/user.service';
import { ApiService } from './services/api/api.service';
import { EventEmitterService } from "./services/event-emitter.service";
import { AuthGuard, GuestGuard } from './url-guard';
import { MyAutonomyComponent } from './my-autonomy/my-autonomy.component';
import { AlertDialogComponent } from "./alert-dialog/alert-dialog.component";
import { PoiSearchComponent } from './poi-search/poi-search.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    DashboardComponent,
    SigninComponent,
    SignupComponent,
    ProfileComponent,
    PoiComponent,
    ReportSymptomComponent,
    ReportBehaviorComponent,
    MyAutonomyComponent,
    AlertDialogComponent,
    PoiSearchComponent,
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
  entryComponents: [AlertDialogComponent]
})
export class AppModule { }

function InitServices(userService: UserService) {
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
