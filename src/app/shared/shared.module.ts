import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { environment } from 'src/environments/environment';
import { DevagramApiInterceptador } from './servicos-login/devagram-api-interceptador.service';


@NgModule({
  providers:[
    {
      provide: "LOGIN_URL_API",
      useValue: environment.loginUrlApi
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: DevagramApiInterceptador,
      multi: true
    }
  ],
  declarations: [
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HttpClientModule
  ],
  exports: [

  ]
})
export class SharedModule { }
