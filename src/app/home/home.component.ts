import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  public isFullScreen: boolean = false;
  
  constructor(public router: Router) {}

  ngOnInit() {}
}
