import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { interval } from 'rxjs';
import { SwUpdate } from '@angular/service-worker';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { BottomSheetAlertComponent } from "./bottom-sheet-alert/bottom-sheet-alert.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'autonomy';

  constructor(public breakpointObserver: BreakpointObserver, private swUpdate: SwUpdate, private bottomSheet: MatBottomSheet, private bottomSheetRef: MatBottomSheetRef) {
    const isSmallScreen = breakpointObserver.isMatched('(max-width: 599px)');

    interval(1000 * 60 * 2).subscribe(() => {
      this.swUpdate.checkForUpdate();
    });

    this.swUpdate.available.subscribe(
      () => {
        this.swUpdate.activateUpdate().then(() => {
          this.openBottomSheet();
        });
      }
    );
  }

  private openBottomSheet(): void {
    this.bottomSheetRef = this.bottomSheet.open(BottomSheetAlertComponent, {
      disableClose: true,
      data: {
        error: false,
        header: 'updated',
        mainContent: 'We’ve updated Autonomy to improve performance and stability.',
        leftBtn: 'reload',
        leftBtnAction: () => { location.reload(); },
      }
    });
  }
}
