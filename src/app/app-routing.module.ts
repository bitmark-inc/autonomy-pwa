import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';

const routes: Routes = [
  {path: "", redirectTo: "/landing", pathMatch: 'full'},
  {path: "landing", component: LandingComponent},
  {path: "signin", component: SigninComponent},
  {path: "signup", component: SignupComponent},
  {path: "dashboard", component: DashboardComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
