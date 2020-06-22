import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Observer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private statusSubject = new BehaviorSubject(false);
  private user: any;

  constructor() {
    this.user = null;
    this.user = {
      pubkey: 'abc',
      words: 'abc def',
      jwt: 'my-jwt'
    };
    this.statusSubject.next(true);
  }

  public getUser() {
    return Observable.create((observer: Observer<any>) => {
      this.statusSubject.subscribe(ready => {
        if (ready) {
          observer.next(this.user);
          observer.complete();
        }
      });
    });
  }
}
