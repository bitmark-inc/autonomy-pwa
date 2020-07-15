import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { UserService } from '../user/user.service';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscriber, Observer } from 'rxjs';

enum DSTarget { PDS, CDS, BOTH };

@Injectable({
  providedIn: 'root'
})
export class ApiService extends BaseService {

  public static DSTarget = DSTarget;

  constructor(protected http: HttpClient, private userService: UserService) {
    super(http);
  }

  public request(method: string, url: string, params?, options?, target = DSTarget.PDS) {
    options = options || {};
    options.headers = options.headers || {};
    options.headers['Authorization'] =
      options.headers['Authorization'] || `Bearer ${this.userService.getJWT()}`;

    if (target === DSTarget.BOTH || target === DSTarget.PDS) {
      let dsTokens = this.userService.getTokens().PDS;
      let dsToken = method === 'get' ? dsTokens.r : dsTokens.w;
      options.headers['X-FORWARD-MACAROON-PDS'] = dsToken;
    }

    if (target === DSTarget.BOTH || target === DSTarget.CDS) {
      let dsTokens = this.userService.getTokens().CDS;
      let dsToken = method === 'get' ? dsTokens.r : dsTokens.w;
      options.headers['X-FORWARD-MACAROON-CDS'] = dsToken;
    }

    let dsTokens = target === DSTarget.PDS ? this.userService.getTokens().PDS : this.userService.getTokens().CDS;
    let dsToken = method === 'get' ? dsTokens.r : dsTokens.w;
    let macaroonHeader = `X-FORWARD-MACAROON-${target === DSTarget.CDS ? 'CDS' : 'PDS'}`;

    
    options.headers[macaroonHeader] = options.headers[macaroonHeader] || dsToken;
    return this.sendHttpRequest(method, url, params, options);
  }
}
