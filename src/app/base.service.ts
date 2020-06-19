import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import 'rxjs';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseService {
  constructor(protected http: HttpClient) {}

  protected sendHttpRequest(method, url, params?) {
    return Observable.create((observer) => {
      let request;
      switch (method) {
        case 'post':
          request = this.http.post(url, params);
          break;
        case 'put':
          request = this.http.put(url, params);
          break;
        case 'get':
          request = this.http.get(url, params);
          break;
        case 'head':
          request = this.http.head(url);
          break;
        default:
          break;
      }

      // request.map((res) => res.json())
        request.subscribe(
          (data) => {
            observer.next(data);
            observer.complete();
          },
          (error) => observer.error(error.json && error.json() ? new Error(error.json().message) : new Error('can not connect to the server'))
        );
    });
  }
}
