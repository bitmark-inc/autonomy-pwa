import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { UserService } from '../user/user.service';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscriber, Observer } from 'rxjs';

enum DSTarget { PDS, CDS };

@Injectable({
  providedIn: 'root'
})
export class ApiService extends BaseService {

  public static DSTarget = DSTarget;

  constructor(protected http: HttpClient, private userService: UserService) {
    super(http);
  }

  public request(method: string, url: string, params?, options?, target = DSTarget.PDS) {
    let dsTokens = target === DSTarget.PDS ? this.userService.getTokens().PDS : this.userService.getTokens().CDS;
    let dsToken = method === 'get' ? dsTokens.r : dsTokens.w;
    let jwt = this.userService.getJWT();

    options = options || {};
    options.headers = options.headers || {};
    options.headers['X-FORWARD-MACAROON'] = options.headers['X-FORWARD-MACAROON'] || dsToken;
    options.headers.Authorization = options.headers.Authorization || `Bearer ${jwt}`;
    let currentLocation = this.userService.getCurrentLocation();
    if (currentLocation) {
      options.headers['Geo-Position'] = `${currentLocation.latitude};${currentLocation.longitude}`;
    }
    return this.sendHttpRequest(method, url, params, options);
  }
}
