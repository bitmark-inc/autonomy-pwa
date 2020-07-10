import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { PermissionComponent } from './permission/permission.component';
import { PoiSearchComponent } from './poi-search/poi-search.component';
import { PoiComponent } from './poi/poi.component';
import { RatingsComponent } from './ratings/ratings.component';
import { ProfileComponent } from './profile/profile.component';
import { RecoveryKeyComponent } from "./recovery-key/recovery-key.component";
import { SignoutComponent } from "./signout/signout.component";
import { HomeComponent } from './home/home.component';
import { SettingComponent } from './home/setting/setting.component';
import { CommunityComponent } from './home/community/community.component';
import { ResourcesComponent } from './home/resources/resources.component';
import { AuthGuard, GuestGuard } from './url-guard';

const routes: Routes = [
  {path: 'landing', component: LandingComponent, canActivate: [GuestGuard]},
  {path: 'signin', component: SigninComponent, canActivate: [GuestGuard]},
  {path: 'signup', component: SignupComponent, canActivate: [GuestGuard]},
  {path: 'permission', component: PermissionComponent, canActivate: [AuthGuard]},
  {path: 'home', component: HomeComponent, canActivate: [AuthGuard], children: [
    {path: '', redirectTo: 'community', pathMatch: 'full'},
    { path: 'community', component: CommunityComponent},
    {path: 'resources', component: ResourcesComponent},
    {path: 'setting', component: SettingComponent},
  ]},
  {path: 'poi-search', component: PoiSearchComponent, canActivate: [AuthGuard]},
  {path: 'pois/:id', component: PoiComponent, canActivate: [AuthGuard]},
  {path: 'rating/:id', component: RatingsComponent, canActivate: [AuthGuard]},
  {path: 'locations/:lat/:long', component: PoiComponent, canActivate: [AuthGuard]},
  {path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]},
  {path: 'recovery-key', component: RecoveryKeyComponent, canActivate: [AuthGuard]},
  {path: 'signout', component: SignoutComponent, canActivate: [AuthGuard]},
  {path: '**', redirectTo: 'landing'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
