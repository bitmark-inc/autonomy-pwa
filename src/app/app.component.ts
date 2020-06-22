import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'autonomy';

  constructor(breakpointObserver: BreakpointObserver) {
    const isSmallScreen = breakpointObserver.isMatched('(max-width: 599px)');
  }
}
