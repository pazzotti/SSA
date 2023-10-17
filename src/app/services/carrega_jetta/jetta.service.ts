import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarregaJetta {
  private lambdaEndpoint = 'https://du0btsv8a3.execute-api.sa-east-1.amazonaws.com/dev22';

  constructor(private http: HttpClient) { }


  postCredentials(user: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Adicione o parâmetro 'tableName' ao objeto 'itemsData'

    const payload = {
      user,
      password
    };

    return this.http.post<any>(this.lambdaEndpoint, payload, { headers: headers });
  }
}
