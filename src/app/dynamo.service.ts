import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import * as XLSX from 'xlsx';

@Injectable({
    providedIn: 'root'
})
export class DynamoService {
    constructor(private http: HttpClient) { }

    private baseUrl = 'https://ocydwq9qc9.execute-api.sa-east-1.amazonaws.com/Dev123/';

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

    getItems4(tableName: string, searchIds: string[]): Observable<any> {
      // Crie o objeto JSON com os parâmetros
      const requestObject = {
        tableName: tableName,
        searchId: searchIds
      };

      const headers = new HttpHeaders().set('Content-Type', 'application/json');

      return this.http.post(`${this.baseUrl}`, requestObject, {
        headers,
      });
    }

    public getItems3(tableName: string, searchIds: string[]): Observable<any> {
      const body = JSON.stringify({ tableName, searchIds });
      const headers = new HttpHeaders().set('Content-Type', 'application/json');

      return this.http.post<any>(this.baseUrl, body);
    }


    processFile(file: File) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target) {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'array' });

            // Processa a primeira planilha (EvRulePos_131)
            const result1 = this.processWorksheet(workbook, 'EvRulePos_131');

            // Processa a segunda planilha (EvRuleNeg_1314)
            const result2 = this.processWorksheet(workbook, 'EvRuleNeg_1314');

            // Combinar os resultados das duas planilhas (somando saldos para valores de "Peca" iguais)
            const combinedResult = this.combineResults(result1, result2);

            // Retorna os resultados ao resolver a promise
            resolve(combinedResult);
          } else {
            reject('Erro na leitura do arquivo.');
          }
        };

        reader.readAsArrayBuffer(file);
      });
    }

    private processWorksheet(workbook: XLSX.WorkBook, sheetName: string) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 6 });

      const processedData: { Peca: string, Saldo: number }[] = [];

      jsonData.forEach((row: any) => {
        // Verifica se o valor da coluna "G" começa com a letra "r" (ignorando maiúsculas/minúsculas)
        if (row[6] && row[6].toString().trim().toLowerCase().startsWith('r')) {
          const existingItem = processedData.find((item) => item.Peca === row[3]);

          if (existingItem) {
            // Se "Peca" já existe, some o saldo
            existingItem.Saldo += row[7] - row[8];
          } else {
            // Se "Peca" não existe, adicione um novo item ao array
            processedData.push({
              Peca: row[3], // Coluna "D" com nome "Peca"
              Saldo: row[7] - row[8] // Cálculo de "H" - "I"
            });
          }
        }
      });

      return processedData;
    }


    private combineResults(result1: any[], result2: any[]) {
      const combinedResult = result1.slice();

      for (const item2 of result2) {
        const matchingItem = combinedResult.find((item1) => item1.Peca === item2.Peca);

        if (matchingItem) {
          matchingItem.Saldo += item2.Saldo;
        } else {
          combinedResult.push(item2);
        }
      }

      return combinedResult;
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
