import { Component, OnInit } from '@angular/core';
import { trigger, transition, animate, style, state} from "@angular/animations";
import { UserService } from "../services/user/user.service";

enum EnumPageStage { Direction, Keys }

@Component({
  selector: "app-recovery-key",
  templateUrl: "./recovery-key.component.html",
  styleUrls: ["./recovery-key.component.scss"],
  animations: [
    trigger("slideInOutWord", [
      state('right', style({
        transform: "translateX(50%)",
        fontSize: "1.5em",
        opacity: 0.5,
      })),
      state('center', style({
        transform: "translateX(0)",
        fontSize: "2em",
        opacity: 1,
      })),
      state('left', style({
        transform: "translateX(-50%)",
        fontSize: "1.5em",
        opacity: 0.5,
      })),
      transition("right=>center", [
        animate("450ms ease-in"),
      ]),
      transition("center=>right", [
        animate("450ms ease-out"),
      ]),
      transition("center=>left", [
        animate("450ms ease-out"),
      ]),
      transition("left=>center", [
        animate("450ms ease-in"),
      ]),
    ])
  ],
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

  public onSwipeLeft(index) {
    if (index < 12) {
      this.indexShowing = index + 1;
    }
  }

  public onSwipeRight(index) {
    if (index > 0) {
      this.indexShowing = index - 1;
    }
  }
}
