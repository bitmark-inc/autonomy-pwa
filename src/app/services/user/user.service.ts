declare var window: any;

import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Observer, forkJoin, interval } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../base.service';

interface AccountInfo {
  account_number: string,
  recovery_phrase: string,
  encryption_pubkey: string
}

export interface DSTokens { r: string, w: string }
export interface AllDSTokens { PDS: DSTokens, CDS: DSTokens }

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService {

  private userStorageKey: string = 'user-v1';
  private statusSubject = new BehaviorSubject(false);
  private user: {
    jwt: string,
    account: AccountInfo,
    tokens: AllDSTokens,
  }

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
        if (!this.user.tokens) { // old test account without recovery phrase
          localStorage.removeItem(this.userStorageKey);
          this.user = null;
        }
      } catch (err) {}
    }

    if (this.user) {
      this.authenticateWithAgent(this.user.account).subscribe(
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
      window.localStorage.setItem(this.userStorageKey, JSON.stringify(this.user));
    }
  }

  public getStatus = () => this.statusSubject;
  public getUser = () => this.user;
  public getJWT = () => this.user ? this.user.jwt : null;
  public getAccountNumber = (): string => this.user ? this.user.account.account_number : null;
  public getRecoveryPhrase = (): string => this.user? this.user.account.recovery_phrase : null;
  public getTokens = () : AllDSTokens => this.user? this.user.tokens : null;

  private authenticateWithAgent(accountInfo: AccountInfo) {
    return Observable.create(observer => {
      let currentTimestamp = (new Date()).getTime() + '';
      let signature = window.BitmarkSdk.signMessage(accountInfo.recovery_phrase, currentTimestamp);

      this.sendHttpRequest('post', `${environment.autonomy_api_url}api/auth`, {
        signature: signature,
        timestamp: currentTimestamp,
        requester: accountInfo.account_number,
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

  //=========== WORK WITH AGENT SERVER ==============

  // Signup with a new 13-word phrase or just auto create a new one
  public signup(recoveryPhrase?: string) {
    let accountInfo: AccountInfo;

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

      this.authenticateWithAgent(accountInfo).subscribe(
        (jwt: string) => {
          this.register(accountInfo, jwt).subscribe(
            (result) => {
              this.user = {
                jwt: jwt,
                account: accountInfo,
                tokens: null
              };
              this.user.account = accountInfo;
              this.user.jwt = jwt;
              this.authenticateWithDSs(accountInfo).subscribe(
                (result: AllDSTokens) => {
                  this.user.tokens = result;
                  this.saveUser();
                  observer.next(this.user);
                  observer.complete();
                },
                (err) => { observer.error(err); }
              );
            },
            (err) => { observer.error(err); }
          );
        },
        (err) => { observer.error(err); }
      );
    });
  }

  private register(accountInfo: AccountInfo, jwt: string) {
    return Observable.create(observer => {
      this.sendHttpRequest('post', `${environment.autonomy_api_url}api/accounts`, {
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

      this.authenticateWithAgent(accountInfo)
        .subscribe(
        (jwt: string) => {
          this.me(jwt).subscribe(
            (result) => {
              this.user = result;
              this.user.account = accountInfo;
              this.user.jwt = jwt;
              this.authenticateWithDSs(accountInfo).subscribe(
                (result: AllDSTokens) => {
                  this.user.tokens = result;
                  this.saveUser();
                  observer.next(this.user);
                  observer.complete();
                },
                (err) => { observer.error(err); }
              );
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
        this.authenticateWithAgent(this.user.account).subscribe(
          (jwt: string) => {
            this.user.jwt = jwt;
          }
        );
      }
    );
  }

  //=========== WORK WITH DATA STORE ==============
  public authenticateWithDSs(accountInfo: AccountInfo) {
    return Observable.create(observer => {
      forkJoin([
        this.registerWithDS(accountInfo, `${environment.pds_url}`),
        this.getDSInfo(`${environment.pds_url}`),
        this.registerWithDS(accountInfo, `${environment.cds_url}`),
        this.getDSInfo(`${environment.cds_url}`),
      ]).subscribe(
        (results: any[]) => {
          let encryptedPDSTokens = <DSTokens>results[0];
          let pdsServerInfo = results[1];
          let encryptedCDSTokens = <DSTokens>results[2];
          let cdsServerInfo = results[3];

          let pdsTokens: DSTokens = {
            r: this.decryptDSToken(accountInfo.recovery_phrase, encryptedPDSTokens.r, pdsServerInfo.server.enc_pub_key),
            w: this.decryptDSToken(accountInfo.recovery_phrase, encryptedPDSTokens.w, pdsServerInfo.server.enc_pub_key)
          }
          let cdsTokens: DSTokens = {
            r: this.decryptDSToken(accountInfo.recovery_phrase, encryptedCDSTokens.r, cdsServerInfo.server.enc_pub_key),
            w: this.decryptDSToken(accountInfo.recovery_phrase, encryptedCDSTokens.w, cdsServerInfo.server.enc_pub_key)
          }

          observer.next({
            PDS: pdsTokens,
            CDS: cdsTokens
          });
          observer.complete();
        },
        (err) => {
          observer.error(err);
        }
      )
    });
  }

  private decryptDSToken(recoveryPhrase: string, encryptedToken: string, peerPubkey: string) {
    let token = window.BitmarkSdk.decryptText(recoveryPhrase, encryptedToken, peerPubkey);
    return Array.from(token).map(x => ('00' + (<number>x).toString(16)).slice(-2)).join('');
    // return token
  }

  private getDSInfo(dsEndPoint: string) {
    return this.sendHttpRequest('get', `${dsEndPoint}information`);
  }

  private registerWithDS(accountInfo: AccountInfo, dsEndPoint: string) {
    let now = (new Date()).getTime();
    let message = `${accountInfo.encryption_pubkey}|${now}`;
    let signature = window.BitmarkSdk.signMessage(accountInfo.recovery_phrase, message);

    return this.sendHttpRequest('post', `${dsEndPoint}register`, {
      requester: accountInfo.account_number,
      timestamp: now.toString(),
      encryption_public_key: accountInfo.encryption_pubkey,
      signature: signature
    });
  }
  
  //=========== WORK WITH ONE SIGNAL ==============
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

  // public startTrackingLocation(): Observable<any> {
  //   return Observable.create((observer: Observer<any>) => {
  //     if (this.isTrackingLocation) {
  //       observer.next(this.currentLocation);
  //       observer.complete();
  //       return;
  //     }

  //     navigator.geolocation.getCurrentPosition(
  //       (position: {coords: any}) => {
  //         this.currentLocation = position.coords;
  //         this.saveUser();

  //         this.isTrackingLocation = true;
  //         this.updateOnLocationChanged();
  //         observer.next(this.currentLocation);
  //         observer.complete();
  //       },
  //       (err) => {
  //         observer.error(err);
  //       }
  //     );
  //   });
  // }

  // private updateOnLocationChanged() {
  //   navigator.geolocation.watchPosition(
  //     (position: {coords: any}) => {
  //       this.currentLocation = position.coords;
  //       this.saveUser();
  //     },
  //     (err) => {
  //       console.log(err);
  //       // TODO: do something
  //     }
  //   );
  // }
}
