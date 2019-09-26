import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly apiUrl = environment.apiUrl;

  constructor(
    private httpClient: HttpClient
  ) {
  }

  delete<T>(url: string): Observable<T> {
    const refinedUrl = this.helperLink(url);

    return this.wrapRequest(
      this.httpClient.post<T>(refinedUrl + '/delete', null)
    );
  }

  get<T>(url: string, params?: any): Observable<T> {
    const refinedUrl = this.helperLink(url);

    const result = !params
      ? this.httpClient.get<T>(refinedUrl, { headers: this.headers })
      : this.httpClient.get<T>(refinedUrl, { params: this.paramsToQuery(params), headers: this.headers });

    return this.wrapRequest(result);
  }

  patch<T>(url: string,
           body?: object): Observable<T> {
    const refinedUrl = this.helperLink(url);

    return this.wrapRequest(
      this.httpClient.post<T>(refinedUrl + '/update', JSON.stringify(body), { headers: this.headers })
    );
  }

  post<T>(url: string,
          body?: object): Observable<T> {
    const refinedUrl = this.helperLink(url);
    return this.wrapRequest(
      this.httpClient.post<T>(refinedUrl, JSON.stringify(body), { headers: this.headers })
    );
  }

  put<T>(url: string,
         body?: object): Observable<T> {
    const refinedUrl = this.helperLink(url);
    return this.wrapRequest(
      this.httpClient.put<T>(refinedUrl, JSON.stringify(body), { headers: this.headers })
    );
  }

  helperLink(url: string, full = false): string {
    return (full && this.apiUrl ? ('//' + this.apiUrl) : '')
      + this.apiUrl + url;
  }

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  private wrapRequest<T>(result: Observable<T>): Observable<T> {
    return result.pipe(
      tap(null, error => {
        //this.notice.error(error);
      })
    );
  }

  private paramsToQuery(params: any): HttpParams | {
    [param: string]: string | string[];
  } {
    const res = {};
    for (const key in params) {
      if (params[key]) {
        res[key] = typeof params[key] === 'object' ? JSON.stringify(params[key]) : params[key];
      }
    }
    return res;
  }
}
