import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class InterfaceService {
    constructor(private http: HttpClient) { }

    private baseUrl = 'https://nf6eoyi088.execute-api.sa-east-1.amazonaws.com/dev123';

    public getItems2(tableName: string, urlConsulta: string, searchText: string, exclusiveStartKey?: any): Observable<any> {
      const body = JSON.stringify({ tableName, searchText, exclusiveStartKey });
      const headers = new HttpHeaders().set('Content-Type', 'application/json');

      return this.http.post<any>(urlConsulta, body);
    }


    getItems(tableName: string, page: number, pageSize: number): Observable<any> {
      // Configurar os parâmetros da consulta
      const params = new HttpParams()
        .set('tableName', tableName)
        .set('page', page.toString())
        .set('pageSize', pageSize.toString());

      const headers = new HttpHeaders().set('Content-Type', 'application/json');

      return this.http.get(`${this.baseUrl}/seu-endpoint`, {
        headers,
        params,
      });
    }




    salvar(itemsData: any, tabela: string, apiUrl: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        // Adicione o parâmetro 'tableName' ao objeto 'itemsData'

        const body = JSON.stringify(itemsData);

        return this.http.post<any>(apiUrl, body, { headers: headers });
    }

    enviaNotificacao(itemsData: any, tabela: string, apiUrl: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        // Adicione o parâmetro 'tableName' ao objeto 'itemsData'

        const body = JSON.stringify(itemsData);

        return this.http.post<any>(apiUrl, body, { headers: headers });
    }

    deleteItem(ID: string, urlDeleta: string, query: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const body = JSON.stringify({ tableName: query, ID: ID, acao: 'deletar' });

        // Remover as barras invertidas escapadas
        const unescapedString = body.replace(/\\"/g, '"');

        // Converter a string JSON para um objeto JavaScript
        const jsonObject = JSON.parse(unescapedString) as { [key: string]: string };

        // Converter o objeto JavaScript de volta para uma string JSON
        const modifiedJsonString = JSON.stringify(jsonObject);

        console.log(modifiedJsonString);

        // Converter a string JSON para um objeto JavaScript
        const jsonObject2 = JSON.parse(modifiedJsonString) as { tableName: string, ID: string, acao: string };

        // Criar um array contendo o objeto
        const jsonArray = [jsonObject2];

        // Converter o array para uma string JSON formatada
        const formattedJsonString = JSON.stringify(jsonArray, null, 2);

        console.log(formattedJsonString);
        return this.http.post<any>(urlDeleta, formattedJsonString, { headers: headers });
    }
}
