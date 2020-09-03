import { Injectable, EventEmitter } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class EventEmitterService {
  public static Events = {
    FeedbackDialogShown: 'feedback-dialog-shown',
    BottomSheetBtn: 'bottom-sheet-btn'
  };

  private static eventEmitters = {};

  constructor() {}

  public static getEventEmitter(eventName) {
    this.eventEmitters[eventName] = this.eventEmitters[eventName] || new EventEmitter();
    return this.eventEmitters[eventName];
  }
}
