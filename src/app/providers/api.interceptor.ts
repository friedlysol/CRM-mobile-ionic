import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse,} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {AuthService} from '@app/services/auth.service';
import {ActivatedRoute} from '@angular/router';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  private ignoreRoutes: string[] = [
    '/sign-in'
  ];

  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${this.authService.getToken()}`),
    });

    if (!request.headers.has('Content-Type')) {
      request = request.clone({headers: request.headers.set('Content-Type', 'application/json')});
    }

    if (request.headers.get('Content-Type') === 'none') {
      request.headers.delete('Content-Type');

      request = request.clone({headers: request.headers.delete('Content-Type')});
    }

    request = request.clone({headers: request.headers.set('Accept', 'application/json')});

    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          //ToDo
        }

        return event;
      }),
      catchError((err: HttpErrorResponse) => {
        console.error('API error--->>>', err);

        return this.handleAuthError(err);
      })
    );
  }

  private handleAuthError(err: HttpErrorResponse): Observable<any> {
    const currentRoute = this.activatedRoute.snapshot['_routerState'].url;

    if ((err.status === 401 || err.status === 403 || err.status === 498) && !this.ignoreRoutes.includes(currentRoute)) {
      this.authService.logout();

      return of(err.message);
    }

    return throwError(err);
  }
}
