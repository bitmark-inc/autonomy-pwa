import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PoiSearchComponent } from './poi-search/poi-search.component';
import { MyAutonomyComponent } from './my-autonomy/my-autonomy.component';
import { PoiComponent } from './poi/poi.component';
import { RatingsComponent } from './ratings/ratings.component';
import { ProfileComponent } from './profile/profile.component';
import { ReportSymptomComponent } from './report-symptom/report-symptom.component';
import { ReportBehaviorComponent } from './report-behavior/report-behavior.component';
import { AuthGuard, GuestGuard } from './url-guard';

const routes: Routes = [
  {path: "landing", component: LandingComponent, canActivate: [GuestGuard]},
  {path: "signin", component: SigninComponent, canActivate: [GuestGuard]},
  {path: "signup", component: SignupComponent, canActivate: [GuestGuard]},
  {path: "dashboard", component: DashboardComponent, canActivate: [AuthGuard]},
  {path: "poi-search", component: PoiSearchComponent, canActivate: [AuthGuard]},
  {path: "my-autonomy", component: MyAutonomyComponent, canActivate: [AuthGuard]},
  {path: "pois/:id", component: PoiComponent, canActivate: [AuthGuard]},
  {path: "rating/:id", component: RatingsComponent, canActivate: [AuthGuard]},
  {path: "locations/:lat/:long", component: PoiComponent, canActivate: [AuthGuard]},
  {path: "profile", component: ProfileComponent, canActivate: [AuthGuard]},
  {path: "report-symptom", component: ReportSymptomComponent, canActivate: [AuthGuard]},
  {path: "report-behavior", component: ReportBehaviorComponent, canActivate: [AuthGuard]},
  {path: "**", redirectTo: 'landing'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
