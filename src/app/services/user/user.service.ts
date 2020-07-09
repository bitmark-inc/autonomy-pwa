declare var window: any;

import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Observer, observable, timer, interval } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../base.service';

import { v4 as uuidv4 } from 'uuid';
import { mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService {

  private userStorageKey: string = 'user-v1';
  private statusSubject = new BehaviorSubject(false);
  private user: {
    id: string,
    jwt: string,
    account_number: string,
    recovery_phrase: string,
    encryption_pubkey: string,
    state: {
      last_active_time: string,
      location: string,
    },
    metadata: {},
    created_at: string,
    updated_at: string

    currentLocation: {latitude: number, longitude: number}
  };

  private isTrackingLocation: boolean = false;
  private currentLocation: {latitude: number, longitude: number};

  constructor(protected http: HttpClient) {
    super(http);
    this.initService();
  }

  private async initService() {
    await this.initBitmarkSDK();
    window.BitmarkSdk.setup('my api token', environment.bitmark_network); // TODO: replace this with real configuration

    let localUserData = window.localStorage.getItem(this.userStorageKey);
    if (localUserData) {
      try {
        this.user = JSON.parse(localUserData);
        if (!this.user.recovery_phrase) { // old test account without recovery phrase
          localStorage.removeItem(this.userStorageKey);
          this.user = null;
        }
      } catch (err) {}
    }

    if (this.user) {
      if (this.user.currentLocation != null) {
        this.currentLocation = this.user.currentLocation;
        this.startTrackingLocation().subscribe();
      }
      this.authenticate(this.user.account_number, this.user.recovery_phrase).subscribe(
        (jwt: string) => {
          this.user.jwt = jwt;
          this.statusSubject.next(true);
        },
        (err) => {
          console.log(err);
          // TODO: do something
        }
      );
    } else {
      this.statusSubject.next(true);
    }
    this.resetJWTPeriodically();
  }

  private async initBitmarkSDK() {
    if (!window.BitmarkSdk) {
      window.BitmarkSdk = {};
      let InstantiateStreaming = async (resp, importObject) => {
        const source = await (await resp).arrayBuffer();
        return await WebAssembly.instantiate(source, importObject);
      };
      let go = new window.Go();
      let result = await InstantiateStreaming(fetch('main.wasm'), go.importObject)
      go.run(result.instance);
    }
  }

  private saveUser() {
    if (this.user) {
      this.user.currentLocation = this.currentLocation;
      window.localStorage.setItem(this.userStorageKey, JSON.stringify(this.user));
    }
  }

  public getStatus() {
    return this.statusSubject;
  }

  public getUser() {
    return this.user;
  }

  public getJWT() {
    return this.user ? this.user.jwt : null;
  }

  public getAccountNumber(): string {
    return this.user.account_number;
  }

  public getRecoveryPhrase(): string {
    return this.user.recovery_phrase;
  }

  public getCurrentLocation(): {latitude: number, longitude: number} {
    return this.currentLocation;
  }

  private authenticate(accountNumber: string, recoveryPhrase: string) {
    return Observable.create(observer => {
      let currentTimestamp = (new Date()).getTime() + '';
      let signature = window.BitmarkSdk.signMessage(recoveryPhrase, currentTimestamp);

      this.sendHttpRequest('post', 'api/auth', {
        signature: signature,
        timestamp: currentTimestamp,
        requester: accountNumber,
      }).subscribe(
        (data: {jwt_token: string}) => {
          observer.next(data.jwt_token);
          observer.complete();
        },
        (err) => { observer.error(err); }
      );
    });
  }

  public validateAccount(recoveryPhrase: string) {
    return !!window.BitmarkSdk.parseAccount(recoveryPhrase);
  }

  // Signup with a new 13-word phrase or just auto create a new one
  public signup(recoveryPhrase?: string) {
    let accountInfo: {
      account_number: string,
      recovery_phrase: string,
      encryption_pubkey: string
    };

    return Observable.create(observer => {
      if (recoveryPhrase) {
        accountInfo = window.BitmarkSdk.parseAccount(recoveryPhrase);
        if (!accountInfo) {
          observer.error(new Error('invalid recovery phrase for bitmark account'));
          return;
        }
      } else {
        accountInfo = window.BitmarkSdk.createNewAccount();
      }

      this.authenticate(accountInfo.account_number, accountInfo.recovery_phrase).subscribe(
        (jwt) => {
          this.register(accountInfo, jwt).subscribe(
            (result) => {
              this.user = result;
              this.user.recovery_phrase = accountInfo.recovery_phrase;
              this.user.account_number = accountInfo.account_number;
              this.user.encryption_pubkey = accountInfo.encryption_pubkey;
              this.user.jwt = jwt;
              this.saveUser();
              observer.next();
              observer.complete();
            },
            (err) => { observer.error(err); }
          );
        },
        (err) => { observer.error(err); }
      );
    });
  }

  private register(accountInfo, jwt) {
    return Observable.create(observer => {
      this.sendHttpRequest('post', 'api/accounts', {
        enc_pub_key: accountInfo.encryption_pubkey,
        metadata: {source: 'pwa'}
      }, {
        headers: {
          Authorization: 'Bearer ' + jwt
        }
      }).subscribe(
        (data: {result: any}) => {
          observer.next(data.result);
          observer.complete();
        },
        (err) => {
          observer.error(err);
        });
    });
  }

  public signin(recoveryPhrase: string) {
    return Observable.create(observer => {
      let accountInfo = window.BitmarkSdk.parseAccount(recoveryPhrase);
      if (!accountInfo) {
        observer.error(new Error('invalid recovery phrase'));
      }

      this.authenticate(accountInfo.account_number, recoveryPhrase)
        .subscribe(
        (jwt) => {
          this.me(jwt).subscribe(
            (result) => {
              this.user = result;
              this.user.recovery_phrase = accountInfo.recovery_phrase;
              this.user.account_number = accountInfo.account_number;
              this.user.encryption_pubkey = accountInfo.encryption_pubkey;
              this.user.jwt = jwt;
              this.saveUser();
              observer.next();
              observer.complete();
            },
            (err) => { observer.error(err); }
          )
        },
        (err) => { observer.error(err); }
      );
    });
  }

  private me(jwt: string) {
    return Observable.create(observer => {
      this.sendHttpRequest('get', 'api/accounts/me', {}, {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      }).subscribe(
        (data: {result: any}) => {
          observer.next(data.result);
          observer.complete();
        },
        (err) => { observer.error(err); }
      );
    });
  }

  private resetJWTPeriodically() {
    interval(30*60*1000).subscribe(
      () => {
        if (!this.user) {
          return;
        }
        this.authenticate(this.user.account_number, this.user.recovery_phrase).subscribe(
          (jwt: string) => {
            this.user.jwt = jwt;
          }
        );
      }
    );
  }

  public submitOneSignalTag(): void {
    window.OneSignal.push(() => {
      window.OneSignal.sendTag('account_number', this.getAccountNumber());
    })
  }

  public removeOneSignalTag(): void {
    window.OneSignal.push(() => {
      window.OneSignal.isPushNotificationsEnabled((isEnabled: boolean) => {
        if (isEnabled) {
          window.OneSignal.sendTag('account_number', '');
        }
      });
    });
  }

  public signout() {
    localStorage.removeItem(this.userStorageKey);
    this.removeOneSignalTag();
    this.user = null;
  }

  public startTrackingLocation(): Observable<any> {
    return Observable.create((observer: Observer<any>) => {
      if (this.isTrackingLocation) {
        observer.next(this.currentLocation);
        observer.complete();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position: {coords: any}) => {
          this.currentLocation = position.coords;
          this.saveUser();

          this.isTrackingLocation = true;
          this.updateOnLocationChanged();
          observer.next(this.currentLocation);
          observer.complete();
        },
        (err) => {
          observer.error(err);
        }
      );
    });
  }

  private updateOnLocationChanged() {
    navigator.geolocation.watchPosition(
      (position: {coords: any}) => {
        this.currentLocation = position.coords;
        this.saveUser();
      },
      (err) => {
        console.log(err);
        // TODO: do something
      }
    );
  }
}
