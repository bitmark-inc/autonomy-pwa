import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { PoiComponent } from './poi/poi.component';
import { RatingsComponent } from './ratings/ratings.component';
import { RecoveryKeyComponent } from "./recovery-key/recovery-key.component";
import { SignoutComponent } from "./signout/signout.component";
import { HomeComponent } from './home/home.component';
import { SettingComponent } from './home/setting/setting.component';
import { CommunityComponent } from './home/community/community.component';
import { ResourcesComponent } from './home/resources/resources.component';
import { PersonalDataComponent } from './personal-data/personal-data.component';
import { CommunityDataComponent } from './community-data/community-data.component';
import { AuthGuard, GuestGuard } from './url-guard';

const routes: Routes = [
  {path: 'landing', component: LandingComponent, canActivate: [GuestGuard]},
  {path: 'signin', component: SigninComponent, canActivate: [GuestGuard]},
  {path: 'signup', component: SignupComponent, canActivate: [GuestGuard]},
  {path: 'home', component: HomeComponent, canActivate: [AuthGuard], children: [
    {path: '', redirectTo: 'community', pathMatch: 'full'},
    { path: 'community', component: CommunityComponent},
    {path: 'resources', component: ResourcesComponent},
    {path: 'setting', component: SettingComponent},
  ]},
  {path: 'pois/:id', component: PoiComponent, canActivate: [AuthGuard]},
  {path: 'rating/:id', component: RatingsComponent, canActivate: [AuthGuard]},
  {path: 'locations/:lat/:long', component: PoiComponent, canActivate: [AuthGuard]},
  {path: 'recovery-key', component: RecoveryKeyComponent, canActivate: [AuthGuard]},
  {path: 'signout', component: SignoutComponent, canActivate: [AuthGuard]},
  {path: 'pde', component: PersonalDataComponent, canActivate: [AuthGuard]},
  {path: 'pde/save', component: PersonalDataComponent, canActivate: [AuthGuard]},
  {path: 'pde/read', component: PersonalDataComponent, canActivate: [AuthGuard]},
  {path: 'pde/delete', component: PersonalDataComponent, canActivate: [AuthGuard]},
  {path: 'cde', component: CommunityDataComponent, canActivate: [AuthGuard]},
  {path: 'cde/save', component: CommunityDataComponent, canActivate: [AuthGuard]},
  {path: 'cde/read', component: CommunityDataComponent, canActivate: [AuthGuard]},
  {path: 'cde/submit', component: CommunityDataComponent, canActivate: [AuthGuard]},
  {path: '**', redirectTo: 'landing'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
