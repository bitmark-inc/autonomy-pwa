import { Component, OnInit } from '@angular/core';
import { trigger, transition, animate, style, query, state} from "@angular/animations";
import { UserService } from "../services/user/user.service";

enum EnumPageStage { Direction, Keys }

@Component({
  selector: "app-recovery-key",
  templateUrl: "./recovery-key.component.html",
  styleUrls: ["./recovery-key.component.scss"],
  animations: [
    trigger('wordsSlide', [
      state('*', style({
        transform: "translateX({{pos}}%)",
      }), {params: {pos: 0}}),
      transition('* => *', [
        animate(200)
      ])
    ])
  ]
})
export class RecoveryKeyComponent implements OnInit {
  public PageStage = EnumPageStage;
  public stage: EnumPageStage = EnumPageStage.Direction;
  public words: any;
  public indexShowing: number = 0;
  public slideStateTest: string = 'center';

  constructor(private userService: UserService) {
    this.getRecoveryWords();
  }

  ngOnInit() {}

  private getRecoveryWords() {
    this.words = this.userService.getRecoveryPhrase().split(' ');
  }

  public setStage(newStage: EnumPageStage) {
    this.stage = newStage;
  }

  public onSwipeLeft() {
    if (this.indexShowing < this.words.length - 1) {
      this.indexShowing++;
    }
  }

  public onSwipeRight() {
    if (this.indexShowing >= 1) {
      this.indexShowing--;
    }
  }
}
