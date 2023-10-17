import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ControlCenter } from '../control-center-ori/control-center.type';


@Injectable({
  providedIn: 'root'
})
export class ControlCenterService {
  
  url = "https://4loim5jtph.execute-api.sa-east-1.amazonaws.com/getcc/"

  constructor(private httpClient: HttpClient) { }
  
  public list(tableName: string): Observable<ControlCenter[]> {
    const body = JSON.stringify({ tableName });
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.httpClient.get<ControlCenter[]>(this.url)
  }
}
