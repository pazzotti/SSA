import { Papa } from 'ngx-papaparse';
import * as XLSX from 'xlsx';
import { addDays, addHours, format, parse } from 'date-fns';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CarregaService {

  private baseUrl = 'https://ocydwq9qc9.execute-api.sa-east-1.amazonaws.com/Dev123';

  constructor(private http: HttpClient, private papa: Papa) { }

  getFileContent(fileUrl: string): Promise<string> {
    return this.http.get(fileUrl, { responseType: 'text' })
      .toPromise()
      .then(response => response || '');
  }

  public getItems(tableName: string, page: number, pageSize: number): Observable<any> {
    const body = JSON.stringify({ tableName, page, pageSize });
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this.http.post<any>(this.baseUrl, body);
  }

  public getItems3(tableName: string, searchId: string[]): Observable<any> {
      const body = JSON.stringify({ tableName, searchId });
      const headers = new HttpHeaders().set('Content-Type', 'application/json');

      return this.http.post<any>(this.baseUrl, body);
    }


  convertExcelDate(excelDate: number) {
    const excelEpoch = new Date(1899, 11, 31);
    const excelDateValue = excelDate - 1; // Subtrair 1 porque o Excel começa a contagem a partir de 1 de janeiro de 1900

    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const offset = excelDateValue * millisecondsPerDay;

    const universalDate = new Date(excelEpoch.getTime() + offset);

    return universalDate;
  }

  loadFile(fileBlob: Blob): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const fileData = event.target?.result;
        if (typeof fileData === 'string') {
          const workbook: XLSX.WorkBook = XLSX.read(fileData, { type: 'binary' });
          const sheetName: string = workbook.SheetNames[0]; // Assume que o arquivo possui apenas uma planilha
          const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];
          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          const filteredData = this.filterRows(jsonData); // Filtra as linhas de acordo com os critérios
          resolve(filteredData);
        } else {
          reject(new Error('Erro ao ler o arquivo.'));
        }
      };

      reader.onerror = (event) => {
        reject(event.target?.error || new Error('Erro ao ler o arquivo.'));
      };

      reader.readAsBinaryString(fileBlob);
    });
  }

  loadTextFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData = event.target?.result;
        if (typeof fileData === 'string') {
          const lines = fileData.trim().split('\n');
          const jsonData: any[] = lines.map(line => {
            const columns = line.split('\t');
            return {
              'ID': columns[0],
              'MPCode': columns[2],
              'MPName': columns[45],
              'Supplier': columns[7] + "-" + columns[8],
              'SupName': columns[9],
              'SupShare': columns[31],
              'Country': columns[6],
              'TranspotTime': columns[12],
              'SafetyStockTime': columns[13],
              'SafetyStockQtde': columns[14],
              'UnitySizeCentral': columns[17],
              'UnityQtyCentral': columns[18],
              'MCM': columns[11],
              'TypeBalance': columns[37],
              'UsedFor': columns[43],

              // Aqui você pode adicionar mais campos conforme necessário
            };
          });
          resolve(jsonData);
        } else {
          reject(new Error('Erro ao ler o arquivo.'));
        }
      };

      reader.onerror = (event) => {
        reject(event.target?.error || new Error('Erro ao ler o arquivo.'));
      };

      reader.readAsText(file);
    });
  }

  loadTextNeca(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const fileData = event.target?.result;
        if (typeof fileData === 'string') {
          const today = new Date();
          const lines = fileData.trim().split('\n');

          const groupedData: { [key: string]: any } = {};
          lines.forEach(line => {
            const columns = line.split('\t');

            const peca = columns[1];
            let qtde = parseInt(columns[3]);

            if (qtde === undefined || qtde === null) {
              qtde = 0;
            }

            if (groupedData[peca]) {
              groupedData[peca]['DB12'] += qtde; // Somando a quantidade DB12 para a mesma peça
            } else {
              groupedData[peca] = {
                'Peca': peca,
                'DB12': qtde,
              };
            }
          });

          const jsonData: any[] = Object.values(groupedData);

          resolve(jsonData);
        } else {
          reject(new Error('Erro ao ler o arquivo.'));
        }
      };

      reader.onerror = (event) => {
        reject(event.target?.error || new Error('Erro ao ler o arquivo.'));
      };

      reader.readAsText(file);
    });
  }

  loadTextPipe(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const fileData = event.target?.result;
        if (typeof fileData === 'string') {
          const today = new Date();
          const lines = fileData.trim().split('\n');

          const groupedData: { [key: string]: any } = {};
          lines.forEach(line => {
            const columns = line.split('|');
            const peca = columns[0];
            let qty = parseInt(columns[7]);
            if (qty === null || qty === undefined || isNaN(qty)) {
              qty = 0;
            }

            if (groupedData[peca]) {
              groupedData[peca]['Pipeline'] += qty; // Somando a quantidade Pipeline para a mesma peça
            } else {
              groupedData[peca] = {
                'Peca': peca,
                'Pipeline': qty,
              };
            }
          });

          const jsonData: any[] = Object.values(groupedData);

          resolve(jsonData);
        } else {
          reject(new Error('Erro ao ler o arquivo.'));
        }
      };

      reader.onerror = (event) => {
        reject(event.target?.error || new Error('Erro ao ler o arquivo.'));
      };

      reader.readAsText(file);
    });
  }


  loadTextBat(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const fileData = event.target?.result;
        if (typeof fileData === 'string') {
          const today = new Date();
          const lines = fileData.trim().split('\n');

          const groupedData: { [key: string]: any } = {};
          lines.forEach(line => {
            const columns = line.split('\t');
            const peca = columns[3];
            const frozen = parseInt(columns[10]);
            const advice = parseInt(columns[11]);
            const adviceStatus = columns[12];
            let Qtde = 0;
            if (adviceStatus !== 'F') {
              Qtde = frozen - advice;
            } else {
              Qtde = frozen;
            }

            if (Qtde === null || Qtde === undefined || isNaN(Qtde)) {
              Qtde = 0;
            }

            if (groupedData[peca]) {
              groupedData[peca]['Call'] += Qtde; // Somando a quantidade Call para a mesma peça
            } else {
              groupedData[peca] = {
                'Peca': peca,
                'Call': Qtde,
              };
            }
          });

          const jsonData: any[] = Object.values(groupedData);

          resolve(jsonData);
        } else {
          reject(new Error('Erro ao ler o arquivo.'));
        }
      };

      reader.onerror = (event) => {
        reject(event.target?.error || new Error('Erro ao ler o arquivo.'));
      };

      reader.readAsText(file);
    });
  }

  loadTextPECAS(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const fileData = event.target?.result;

        if (fileData && typeof fileData === 'string') {
          const lines = fileData.trim().split('\n');
          const jsonData: any[] = lines.map(line => {
            const peca = parseInt(line.substr(0, 7).trim());
            const descricao = line.substr(7, 40).trim();

            const custoMatch = line.match(/(\d{1,5}(?:\.\d{3})*,\d{2})/);
            const custoStr = custoMatch ? custoMatch[0] : '0.00'; // Defina um valor padrão caso não haja correspondência
            const custo = parseFloat(custoStr.replace('.', '').replace(',', '.'));

            const embalagem = line.substr(1139, 2); // Ajuste a posição conforme necessário
            let quantidade = parseInt(line.substr(914, 8)); // Ajuste a posição conforme necessário
            let quantidadeLinha = parseInt(line.substr(938, 8)); // Ajuste a posição conforme necessário

            let rate = line.substr(897, 9); // Pega os nove caracteres a partir da posição 897
            rate = rate.replace(',', '.'); // Substitui ',' por '.' para formatar o número corretamente
            const rateAsFloat = parseFloat(rate); // Converte a string em um número de ponto flutuante (float)

            let rm = parseInt(line.substr(955, 8)); // Ajuste a posição conforme necessário

            let almox = parseInt(line.substr(915, 8)); // Ajuste a posição conforme necessário

            let receb = parseInt(line.substr(907, 8)); // Ajuste a posição conforme necessário

            let pend3 = parseInt(line.substr(923, 8)); // Ajuste a posição conforme necessário

            let lm = parseInt(line.substr(939, 8)); // Ajuste a posição conforme necessário




            if (quantidade === null || quantidade === undefined || isNaN(quantidade)) {
              quantidade = 0;
            }

            if (quantidadeLinha === null || quantidadeLinha === undefined || isNaN(quantidadeLinha)) {
              quantidadeLinha = 0;
            }

            return {
              'ID': peca,
              'Descricao': descricao,
              'Custo': custo,
              'Embalagem': embalagem,
              'Quantidade': quantidade,
              'Line': quantidadeLinha,
              'Rate': rateAsFloat,
              'RM':rm,
              'QtdeAmox':almox,
              'QtdeReceb':receb,
              'Qtde3':pend3,
              'QtdeLm':lm

              // Adicione mais campos aqui, se necessário
            };
          });
          resolve(jsonData);
        } else {
          reject(new Error('Erro ao ler o arquivo.'));
        }
      };

      reader.onerror = (event) => {
        reject(event.target?.error || new Error('Erro ao ler o arquivo.'));
      };

      reader.readAsText(file);
    });
  }



  filterRows(data: any[]): any[] {
    const filteredData: any[] = [];
    let skipFirstRow = true;

    for (const row of data) {
      if (skipFirstRow) {
        skipFirstRow = false;
        continue;
      }

      const cellValue = row[19]; // Coluna 7 (índice 6) baseada em 0

      if (cellValue === undefined || cellValue === null || cellValue === '') {
        break; // Para de carregar linhas ao encontrar uma célula vazia na coluna 7
      }

      filteredData.push(row);
    }

    return filteredData;
  }



  formatDate(serialNumber: number): Date {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const excelDate = new Date(excelEpoch.getTime() + (serialNumber - 1) * millisecondsPerDay);
    const formattedDate = addDays(excelDate, 1);

    const formattedDate2 = addHours(formattedDate, 3);
    return formattedDate2;
  }

  formatHora(serialNumber: number, dataBase: Date): string {
    const dataConverte = new Date(dataBase);
    const millisecondsPerDay = serialNumber * 24 * 60 * 60 * 1000;
    const excelHora = new Date(millisecondsPerDay);
    const HoraJanela = new Date(dataConverte.getTime() + excelHora.getTime());
    HoraJanela.setHours(HoraJanela.getHours() + 3);

    return HoraJanela.toISOString();
  }

  adicionarHora(hora: string, data: Date): Date {
    // Divide a hora em horas e minutos
    if (hora === null) {
      hora = '00:00'
    }
    const [horas, minutos] = hora.split(':').map(Number);

    // Cria uma nova data com os valores da data original
    const novaData = new Date(data);

    // Adiciona as horas e minutos à nova data
    novaData.setHours(novaData.getHours() + horas + 3);
    novaData.setMinutes(novaData.getMinutes() + minutos);

    return novaData;
  }

  naoadicionarHora(hora: string, data: Date): Date {
    // Divide a hora em horas e minutos
    if (hora === null) {
      hora = '00:00'
    }
    const [horas, minutos] = hora.split(':').map(Number);

    // Cria uma nova data com os valores da data original
    const novaData = new Date(data);

    // Adiciona as horas e minutos à nova data
    novaData.setHours(novaData.getHours() + horas);
    novaData.setMinutes(novaData.getMinutes() + minutos);

    return novaData;
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
    const cabecalhoEsperado = ['Process', 'Container Id', 'Channel', 'Clearance Place', 'Step', 'Transp. Type', 'Invoice Number', 'SLine', 'ATA', 'Vessel Name/Flight (SLine)'];
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
