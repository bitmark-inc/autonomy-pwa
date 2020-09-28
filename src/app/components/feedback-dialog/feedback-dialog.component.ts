import { Component, OnInit, Inject, ElementRef, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api/api.service';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/services/user/user.service';

enum FeedbackStage { Q1, Q2, Thanks };

const Q1_REPLIED: string = 'Q1_replied';
const Q2_REPLIED: string = 'Q2_replied';

interface DialogData {
  pageStage: FeedbackStage;
}

@Component({
  selector: 'app-feedback-dialog',
  templateUrl: './feedback-dialog.component.html',
  styleUrls: ['./feedback-dialog.component.scss']
})
export class FeedbackDialogComponent implements OnInit, OnDestroy {
  public dialogRef: MatDialogRef<FeedbackDialogComponent>;
  public pageStage = FeedbackStage;
  public stage: FeedbackStage = FeedbackStage.Q1;
  public userSatisfied: boolean;
  public feedback: string = '';

  private oldBackgroundColor: string;
  private darkModeColor;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, private apiService: ApiService, private userService: UserService, private elementRef: ElementRef) {
    this.stage = data.pageStage;
    this.oldBackgroundColor = this.elementRef.nativeElement.ownerDocument.body.style.background;
    this.updateColorTheme();
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.elementRef.nativeElement.ownerDocument.body.style.background = this.oldBackgroundColor;
  }

  private updateColorTheme() {
    switch (this.oldBackgroundColor) {
      case 'rgb(231, 180, 22)':
        this.darkModeColor = 'rgb(163, 126, 15)'
        break;
      case 'rgb(45, 201, 55)':
        this.darkModeColor = 'rgb(33, 145, 41)'
        break;
      case 'rgb(153, 193, 64)':
        this.darkModeColor = 'rgb(106, 135, 44)'
        break;
      case 'rgb(219, 123, 43)':
        this.darkModeColor = 'rgb(153, 83, 26)'
        break;
      case 'rgb(204, 50, 50)':
        this.darkModeColor = 'rgb(144, 35, 35)'
        break;
      case 'rgb(221, 213, 199)':
        this.darkModeColor = 'rgb(217, 210, 191)'
        break;
      default:
        this.darkModeColor = 'rgb(217, 210, 191)'
        break;
    }

    this.elementRef.nativeElement.ownerDocument.body.style.background = this.oldBackgroundColor != '' && this.oldBackgroundColor !== 'initial' ? this.darkModeColor : 'rgba(0,0,0,0.32)';
  }

  public satisfied(vote: boolean) {
    this.userSatisfied = vote;
    this.userService.setPreference(Q1_REPLIED, true);
    this.stage = this.pageStage.Q2;
  }

  public submit() {
    if (this.feedback) {
      this.apiService.request('post', `${environment.autonomy_api_url}api/feedback`,{
        user_satisfied: this.userSatisfied,
        feedback: this.feedback
      }, null, null).subscribe((result) => {
        this.userService.setPreference(Q2_REPLIED, true);
        this.stage = this.pageStage.Thanks;
      })
    } else {
      // Todo something
      console.log('can not submit without feedback');
    }
  }
}
