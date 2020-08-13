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
import { NoContentComponent} from './no-content/no-content.component'
import { AuthGuard, GuestGuard, ParticipantGuard } from './url-guard';

const routes: Routes = [
  {path: '', component: LandingComponent, canActivate: [ParticipantGuard, GuestGuard]},
  {path: 'landing/b', component: LandingComponent, canActivate: [ParticipantGuard, GuestGuard]},
  {path: 'landing/p/signin', component: SigninComponent, canActivate: [ParticipantGuard, GuestGuard]},
  {path: 'landing/p', component: SignupComponent, canActivate: [ParticipantGuard, GuestGuard]},
  {path: 'landing/p/irb', component: SignupComponent, canActivate: [ParticipantGuard, GuestGuard]},
  {path: 'home', component: HomeComponent, canActivate: [ParticipantGuard, AuthGuard], children: [
    {path: '', redirectTo: 'trends', pathMatch: 'full'},
    {path: 'trends', component: HomeComponent, canActivate: [ParticipantGuard, AuthGuard]},
    {path: 'resources', component: HomeComponent, canActivate: [ParticipantGuard, AuthGuard]},
    {path: 'setting', component: HomeComponent, canActivate: [ParticipantGuard, AuthGuard]},
  ]},
  {path: 'home/resources/pois/:id', component: PoiComponent, canActivate: [ParticipantGuard, AuthGuard]},
  {path: 'rating/:id', component: RatingsComponent, canActivate: [ParticipantGuard, AuthGuard]},
  {path: 'home/setting/recovery-key', component: RecoveryKeyComponent, canActivate: [ParticipantGuard, AuthGuard]},
  {path: 'home/setting/signout', component: SignoutComponent, canActivate: [ParticipantGuard, AuthGuard]},
  {path: 'home/setting/pde', component: PersonalDataComponent, canActivate: [ParticipantGuard, AuthGuard]},
  {path: 'home/setting/pde/save', component: PersonalDataComponent, canActivate: [ParticipantGuard, AuthGuard]},
  {path: 'home/setting/pde/read', component: PersonalDataComponent, canActivate: [ParticipantGuard, AuthGuard]},
  {path: 'home/setting/pde/delete', component: PersonalDataComponent, canActivate: [ParticipantGuard, AuthGuard]},
  {path: 'home/setting/cde', component: CommunityDataComponent, canActivate: [ParticipantGuard, AuthGuard]},
  {path: 'home/setting/cde/save', component: CommunityDataComponent, canActivate: [ParticipantGuard, AuthGuard]},
  {path: 'home/setting/cde/read', component: CommunityDataComponent, canActivate: [ParticipantGuard, AuthGuard]},
  {path: 'home/setting/cde/submit', component: CommunityDataComponent, canActivate: [ParticipantGuard, AuthGuard]},
  {path: '404', component: NoContentComponent},
  {path: '**', redirectTo: 'landing/b'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
