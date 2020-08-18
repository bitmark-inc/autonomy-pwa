import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InstallationComponent } from './installation/installation.component';
import { SigninComponent } from './signin/signin.component';
import { OnboardingComponent } from './onboarding/onboarding.component';
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
import { PWAUserGuard, PWAGuestGuard, PWAGuard, BrowserGuard, ParticipantGuard, NetworkGuard } from './url-guard';

const routes: Routes = [
  {path: '', redirectTo: 'installation', pathMatch: 'full'},
  {path: 'ucberkeley', redirectTo: 'installation'},
  {path: 'installation', component: InstallationComponent, canActivate: [NetworkGuard, ParticipantGuard, BrowserGuard]},
  {path: 'onboarding/signin', component: SigninComponent, canActivate: [NetworkGuard, ParticipantGuard, PWAGuard, PWAGuestGuard]},
  {path: 'onboarding', component: OnboardingComponent, canActivate: [NetworkGuard, ParticipantGuard, PWAGuard, PWAGuestGuard]},
  {path: 'onboarding/irb', component: OnboardingComponent, canActivate: [NetworkGuard, ParticipantGuard, PWAGuard, PWAGuestGuard]},
  {path: 'home', component: HomeComponent, canActivate: [NetworkGuard, ParticipantGuard, PWAGuard, PWAUserGuard], children: [
    {path: '', redirectTo: 'trends', pathMatch: 'full'},
    {path: 'trends', component: HomeComponent, canActivate: [NetworkGuard, ParticipantGuard, PWAGuard, PWAUserGuard]},
    {path: 'resources', component: HomeComponent, canActivate: [NetworkGuard, ParticipantGuard, PWAGuard, PWAUserGuard]},
    {path: 'setting', component: HomeComponent, canActivate: [NetworkGuard, ParticipantGuard, PWAGuard, PWAUserGuard]},
  ]},
  {path: 'home/resources/pois/:id', component: PoiComponent, canActivate: [NetworkGuard, ParticipantGuard, PWAGuard, PWAUserGuard]},
  {path: 'rating/:id', component: RatingsComponent, canActivate: [NetworkGuard, ParticipantGuard, PWAGuard, PWAUserGuard]},
  {path: 'home/setting/recovery-key', component: RecoveryKeyComponent, canActivate: [NetworkGuard, ParticipantGuard, PWAGuard, PWAUserGuard]},
  {path: 'home/setting/signout', component: SignoutComponent, canActivate: [NetworkGuard, ParticipantGuard, PWAGuard, PWAUserGuard]},
  {path: 'home/setting/pde', component: PersonalDataComponent, canActivate: [NetworkGuard, ParticipantGuard, PWAGuard, PWAUserGuard]},
  {path: 'home/setting/pde/save', component: PersonalDataComponent, canActivate: [NetworkGuard, ParticipantGuard, PWAGuard, PWAUserGuard]},
  {path: 'home/setting/pde/read', component: PersonalDataComponent, canActivate: [NetworkGuard, ParticipantGuard, PWAGuard, PWAUserGuard]},
  {path: 'home/setting/pde/delete', component: PersonalDataComponent, canActivate: [NetworkGuard, ParticipantGuard, PWAGuard, PWAUserGuard]},
  {path: 'home/setting/cde', component: CommunityDataComponent, canActivate: [NetworkGuard, ParticipantGuard, PWAGuard, PWAUserGuard]},
  {path: 'home/setting/cde/save', component: CommunityDataComponent, canActivate: [NetworkGuard, ParticipantGuard, PWAGuard, PWAUserGuard]},
  {path: 'home/setting/cde/read', component: CommunityDataComponent, canActivate: [NetworkGuard, ParticipantGuard, PWAGuard, PWAUserGuard]},
  {path: 'home/setting/cde/submit', component: CommunityDataComponent, canActivate: [NetworkGuard, ParticipantGuard, PWAGuard, PWAUserGuard]},
  {path: '404', component: NoContentComponent},
  {path: '**', redirectTo: 'installation'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
