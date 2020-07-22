declare var window: any;
let macaroon = window.macaroon;

import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Observer, forkJoin, interval } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../base.service';
import { ObserveOnMessage } from 'rxjs/internal/operators/observeOn';

export interface AccountInfo {
  account_number: string,
  recovery_phrase: string,
  encryption_pubkey: string
}
export interface DSTokens { r: string, w: string }
export interface AllDSTokens { PDS: DSTokens, CDS: DSTokens }

export interface UserData {
  account: AccountInfo,
  agentJWT: string,
  dstokens: AllDSTokens,
  preferences: any
}

export interface UserCacheData {
  dstokens: AllDSTokens,
  preferences: any
}

const RECOVERY_STORAGE_KEY: string = 'user-key';
const DATA_STORAGE_KEY: string = 'user-data';
class UserCache {
  public userKey: string;
  public userData: UserCacheData;

  constructor() {}

  public load(): boolean {
    this.userKey = window.localStorage.getItem(RECOVERY_STORAGE_KEY);

    if (this.userKey) {
      let data = window.localStorage.getItem(DATA_STORAGE_KEY);
      if (data) {
        this.userData = JSON.parse(data);
      }
      return true;
    }
    return false;
  }

  public save(key: string, data: UserCacheData) {
    this.userKey = key;
    this.userData = data;
    window.localStorage.setItem(RECOVERY_STORAGE_KEY, this.userKey);
    window.localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(this.userData));
  }

  public clean() {
    window.localStorage.removeItem(RECOVERY_STORAGE_KEY);
    window.localStorage.removeItem(DATA_STORAGE_KEY);
  }
}

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService {
  private statusSubject = new BehaviorSubject(false);
  private user: UserData;
  private cache: UserCache;

  constructor(protected http: HttpClient) {
    super(http);
    this.initService();
  }

  public getStatus = () => this.statusSubject;
  public getUser = () => this.user;
  public getAgentJWT = () => this.user ? this.user.agentJWT : null;
  public getAccountNumber = (): string => this.user ? this.user.account.account_number : null;
  public getRecoveryPhrase = (): string => this.user? this.user.account.recovery_phrase : null;
  public getDSTokens = () : AllDSTokens => this.user? this.user.dstokens : null;

  private async initService() {
    await this.initBitmarkSDK();
    window.BitmarkSdk.setup('my api token', environment.bitmark_network); // TODO: replace this with real configuration

    this.cache = new UserCache();
    if (this.cache.load()) {
      this.user = <any>{};
      this.user.account = window.BitmarkSdk.parseAccount(this.cache.userKey);
      this.user.dstokens = this.cache.userData.dstokens;
      this.user.preferences = this.cache.userData.preferences;
      await this.makeAccount({needRegisterWithAgent: false});
    }
    this.statusSubject.next(true);
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

  public validateAccount(recoveryPhrase: string) {
    return !!window.BitmarkSdk.parseAccount(recoveryPhrase);
  }

  public signin(recoveryPhrase: string) {
    return Observable.create(async (observer) => {
      this.user = <any>{};
      this.user.account = window.BitmarkSdk.parseAccount(recoveryPhrase);
      await this.makeAccount({});
      observer.next();
      observer.complete();
    });
  }

  public signup() {
    return Observable.create(async (observer) => {
      this.user = <any>{};
      this.user.account = window.BitmarkSdk.createNewAccount();
      await this.makeAccount({needRegisterWithAgent: true});
      observer.next();
      observer.complete();
    });
  }

  private async makeAccount(options?: {needRegisterWithAgent?: boolean}) {
    await this.prepareAgentData(options || {});
    await this.prepareAllDataStoresData();
    this.saveCache();
    this.resetAgentJWTPeriodically();
  }

  //=========== WORK WITH AGENT SERVER ==============
  private async prepareAgentData(options: {needRegisterWithAgent?: boolean}) {
    await this.resetAgentJWT();
    if (options.needRegisterWithAgent) {
      await this.registerWithAgent();
    } else {
      let agentData = this.getExistingInfoFromAgent();
      if (!agentData) {
        await this.registerWithAgent();
      }
    }
  }

  private async resetAgentJWT() {
    let accountInfo = this.user.account;
    let currentTimestamp = (new Date()).getTime() + '';
    let signature = window.BitmarkSdk.signMessage(accountInfo.recovery_phrase, currentTimestamp);

    let response: {jwt_token: string} = await this.sendHttpRequest('post', `${environment.autonomy_api_url}api/auth`, {
      signature: signature,
      timestamp: currentTimestamp,
      requester: accountInfo.account_number,
    }).toPromise();

    this.user.agentJWT = response.jwt_token;
  }

  private async getExistingInfoFromAgent() {
    try {
      let myData = await this.sendHttpRequest('get', 'api/accounts/me', {}, {
        headers: {Authorization: `Bearer ${this.user.agentJWT}`}
      }).toPromise();
      return myData;
    } catch (err) {
      return null;
    }
  }

  private async registerWithAgent() {
    return this.sendHttpRequest('post', `${environment.autonomy_api_url}api/accounts`, {
      enc_pub_key: this.user.account.encryption_pubkey,
      metadata: {source: 'pwa'}
    }, {
      headers: {Authorization: `Bearer ${this.user.agentJWT}`}
    }).toPromise();
  }

  private resetAgentJWTPeriodically() {
    interval(30*60*1000).subscribe(
      async () => {
        if (this.user.account) {
          await this.resetAgentJWT();
        }
      }
    );
  }

  //=========== WORK WITH DATA STORE ==============
  private async prepareAllDataStoresData() {
    if (!this.user.dstokens) {
      this.user.dstokens = <any>{};
    }

    if (!this.user.dstokens.PDS) {
      this.user.dstokens.PDS = await this.getSingleDataStoreData(environment.pds_url);
    }

    if (!this.user.dstokens.CDS) {
      this.user.dstokens.CDS = await this.getSingleDataStoreData(environment.cds_url);
    }
  }

  private async getSingleDataStoreData(endpoint: string): Promise<DSTokens> {
    let results = await Promise.all([
      this.registerWithDS(this.user.account, endpoint),
      this.getDSInfo(endpoint)
    ]);
    let encryptedDSTokens = <DSTokens>results[0];
    let dsServerInfo = results[1];
    return {
      r: this.decryptDSToken(this.user.account.recovery_phrase, encryptedDSTokens.r, dsServerInfo.server.enc_pub_key),
      w: this.decryptDSToken(this.user.account.recovery_phrase, encryptedDSTokens.w, dsServerInfo.server.enc_pub_key)
    }
  }

  private async registerWithDS(accountInfo: AccountInfo, dsEndPoint: string) {
    let now = (new Date()).getTime();
    let message = `${accountInfo.encryption_pubkey}|${now}`;
    let signature = window.BitmarkSdk.signMessage(accountInfo.recovery_phrase, message);

    return this.sendHttpRequest('post', `${dsEndPoint}register`, {
      requester: accountInfo.account_number,
      timestamp: now.toString(),
      encryption_public_key: accountInfo.encryption_pubkey,
      signature: signature
    }).toPromise();
  }

  private async getDSInfo(dsEndPoint: string) {
    return this.sendHttpRequest('get', `${dsEndPoint}information`).toPromise();
  }

  private decryptDSToken(recoveryPhrase: string, encryptedToken: string, peerPubkey: string) {
    let token = window.BitmarkSdk.decryptToBase64Url(recoveryPhrase, encryptedToken, peerPubkey);
    return token;
  }

  public addTimeLimitToMacaroon(macaroonToken: string, seconds: number) {
    let now = (new Date()).getTime();
    let expire = Math.floor(now/1000 + seconds);
    let token = macaroon.MacaroonsBuilder.deserialize(macaroonToken);

    token = macaroon.MacaroonsBuilder.modify(token)
      .add_first_party_caveat(`time < ${expire}`)
      .getMacaroon();

    return token.serialize();
  }

  //=========== WORK WITH DATA STORE ==============

  public signout() {
    this.user = null;
    this.cache.clean();
  }

  private saveCache() {
    if (this.user && this.user.account) {
      this.cache.save(this.user.account.recovery_phrase,  {
        dstokens: this.user.dstokens,
        preferences: this.user.preferences
      })
    }
  }

  public setPreference(key: string, value: any) {
    this.user.preferences = this.user.preferences || {};
    this.user.preferences[key] = value;
    this.saveCache();
  }

  public getPreference(key: string) {
    return this.user.preferences ? null : this.user.preferences[key];
  }
}
