import { Component, OnInit, Inject } from '@angular/core';
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
export class FeedbackDialogComponent implements OnInit {
  public dialogRef: MatDialogRef<FeedbackDialogComponent>;
  public pageStage = FeedbackStage;
  public stage: FeedbackStage = FeedbackStage.Q1;
  public userSatisfied: boolean;
  public feedback: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, private apiService: ApiService, private userService: UserService) {
    this.stage = data.pageStage;
  }

  ngOnInit(): void {
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
