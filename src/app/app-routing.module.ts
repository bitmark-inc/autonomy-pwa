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
import { from } from 'rxjs';

const routes: Routes = [
  {path: 'landing/b', component: LandingComponent, canActivate: [GuestGuard]},
  {path: 'landing/p/signin', component: SigninComponent, canActivate: [GuestGuard]},
  {path: 'landing/p', component: SignupComponent, canActivate: [GuestGuard]},
  {path: 'landing/p/irb', component: SignupComponent, canActivate: [GuestGuard]},
  {path: 'home', component: HomeComponent, canActivate: [AuthGuard], children: [
    {path: '', redirectTo: 'trends', pathMatch: 'full'},
    {path: 'trends', component: HomeComponent},
    {path: 'resources', component: HomeComponent},
    {path: 'setting', component: HomeComponent},
  ]},
  {path: 'home/resources/pois/:id', component: PoiComponent, canActivate: [AuthGuard]},
  {path: 'rating/:id', component: RatingsComponent, canActivate: [AuthGuard]},
  {path: 'home/setting/recovery-key', component: RecoveryKeyComponent, canActivate: [AuthGuard]},
  {path: 'home/setting/signout', component: SignoutComponent, canActivate: [AuthGuard]},
  {path: 'home/setting/pde', component: PersonalDataComponent, canActivate: [AuthGuard]},
  {path: 'home/setting/pde/save', component: PersonalDataComponent, canActivate: [AuthGuard]},
  {path: 'home/setting/pde/read', component: PersonalDataComponent, canActivate: [AuthGuard]},
  {path: 'home/setting/pde/delete', component: PersonalDataComponent, canActivate: [AuthGuard]},
  {path: 'home/setting/cde', component: CommunityDataComponent, canActivate: [AuthGuard]},
  {path: 'home/setting/cde/save', component: CommunityDataComponent, canActivate: [AuthGuard]},
  {path: 'home/setting/cde/read', component: CommunityDataComponent, canActivate: [AuthGuard]},
  {path: 'home/setting/cde/submit', component: CommunityDataComponent, canActivate: [AuthGuard]},
  {path: '**', redirectTo: 'landing/b'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
