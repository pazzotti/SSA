import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Papa } from 'ngx-papaparse';

@Injectable({
  providedIn: 'root'
})
export class CarregaService {

  constructor(private http: HttpClient, private papa: Papa) { }

  getFileContent(fileUrl: string): Promise<string> {
    return this.http.get(fileUrl, { responseType: 'text' })
      .toPromise()
      .then(response => response || '');
  }


  processData(fileContent: string): any[] {
    const parsedData = this.papa.parse(fileContent, {
      header: true,
      delimiter: ';'
    }).data;
    const result = [];
    const seen = new Set();
    for (const row of parsedData) {
      const {
        'Process': Process,
        'Container Id': Container,
        ' Channel': Channel,
        'Clearance Place': ClearancePlace,
        'Step': Step,
        'Transp. Type': Transport,
        'Invoice Number': Invoice,
        'SLine': Liner,
        'ATA': ATA,
        'Vessel Name/Flight (SLine)': Vessel
        // Continuar com os ajustes para as demais propriedades
      } = row;

      if (!Container || Container.trim().length === 0 || Transport != 10 || ATA === '') {
        continue; // pula linhas vazias e com Supplier Number vazio
      }

      const key = `${Container},${Process}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({
          Process,
          Container,
          Channel,
          ClearancePlace,
          Step,
          Transport,
          Invoice,
          Liner,
          ATA,
          Vessel
          // Continuar com as demais propriedades que deseja extrair
        });
      }
    }

    return result;
  }

  async loadFile(fileUrl: string): Promise<any[]> {
    const fileContent = await this.getFileContent(fileUrl);
    const data = this.processData(fileContent);
    return data;
  }

  testarArquivoCSV(arquivo: File): Promise<TesteArquivoResultado> {
    return new Promise<TesteArquivoResultado>((resolve, reject) => {
      this.papa.parse(arquivo, {
        complete: (result: any) => {
          const dados = result.data;
          const cabecalho = result.meta.fields;
          const erros = result.errors;
          const estaCorreto = this.validarArquivoCSV(dados, cabecalho, erros);
          const resultado: TesteArquivoResultado = {
            estaCorreto,
            dados,
            cabecalho,
            erros
          };
          resolve(resultado);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  validarArquivoCSV(dados: any[], cabecalho: string[], erros: any[]): boolean {
    // Verificar se existem erros de parsing no arquivo
    if (erros && erros.length > 0) {
      return false;
    }

    // Verificar se o cabeçalho está correto
    const cabecalhoEsperado = ['Process', 'Container Id', 'Channel', 'Clearance Place', 'Step', 'Transp. Type', 'Invoice Number', 'SLine', 'ATA','Vessel Name/Flight (SLine)'];
    if (!cabecalho || !this.arrayEquals(cabecalho, cabecalhoEsperado)) {
      return false;
    }

    // Verificar se os dados estão corretos
    if (!dados || dados.length === 0) {
      return false;
    }

    // Verificar se todos os dados estão preenchidos corretamente
    for (const row of dados) {
      if (!row || Object.values(row).some(value => value === null || value === undefined || value === '')) {
        return false;
      }
    }

    // Se chegou até aqui, o arquivo está correto
    return true;
  }

  // Função auxiliar para verificar se dois arrays são iguais
  arrayEquals(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) {
      return false;
    }
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
    return true;
  }


}

interface TesteArquivoResultado {
  estaCorreto: boolean;
  dados: any[];
  cabecalho: string[];
  erros: any[];

}
