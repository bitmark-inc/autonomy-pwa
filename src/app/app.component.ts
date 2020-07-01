import { Component, ViewChild, ElementRef } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { AlertDialogComponent } from "./alert-dialog/alert-dialog.component";
import { EventEmitterService } from "./services/event-emitter.service";
import { interval } from 'rxjs';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'autonomy';

  @ViewChild('modalAlert', {static: false}) public modalAlert: ElementRef;

  constructor(public dialog: MatDialog, public breakpointObserver: BreakpointObserver, private swUpdate: SwUpdate) {
    const isSmallScreen = breakpointObserver.isMatched('(max-width: 599px)');

    EventEmitterService.getEventEmitter(EventEmitterService.Events.ModalDialog).subscribe((data) => {
      if (data.open) {
        this.openModal(data.title, data.subTitle || '', data.message, data.type, data.cancel || null, data.retry || null);
      } else {
        this.dialog.closeAll();
      }
    });

    interval(1000 * 60 * 60).subscribe(() => {
      this.swUpdate.checkForUpdate();
    });

    this.swUpdate.available.subscribe(
      () => {
        console.log('A new version is detected.');
        this.swUpdate.activateUpdate().then(() => {
          console.log('A new version is downloaded.');
        });
      }
    );
  }

  public openModal(title:string, subTitle: string, message:string, type:string = 'info', yes:Function = null, no:Function = null) {
    const dialogConfig = new MatDialogConfig();

    if (type == 'warning') {
      dialogConfig.disableClose = true;
    }
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
        title: title,
        subTitle: subTitle,
        message: message,
        type: type
    };
    dialogConfig.minWidth = 400;

    const dialogRef = this.dialog.open(AlertDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        if(yes){
          yes();
        }
      }else{
        if(no){
          no();
        }
      }
    });
  }
}
