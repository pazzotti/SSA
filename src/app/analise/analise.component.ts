import { CarregaService } from '../services/carrega_file/carrega.service';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild,ChangeDetectorRef } from '@angular/core';
import { format, parse, differenceInDays, getWeek } from 'date-fns';
import { ApiService } from '../services/contratos/contratos.service';
import { map, take } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { Observable } from 'rxjs';
import { DynamoService } from '../dynamo.service';



@Component({
  selector: 'app-analise',
  templateUrl: './analise.component.html',
  styleUrls: ['./analise.component.css'],
  template: `
    <progressbar [value]="progressValue" [max]="100">{{ progressValue }}%</progressbar>
  `
})
export class AnaliseComponent {

  progressValue = 0; // Valor atual da barra de progresso
  maxValue = 0; // Valor máximo da barra de progresso
  showProgressBar = false;
  @ViewChild('downloadLink') downloadLink!: ElementRef<HTMLAnchorElement>;
  urlAtualiza: string = 'https://wo31r57k9d.execute-api.sa-east-1.amazonaws.com/Dev1';
  urlConsulta: string = 'https://4i6nb2mb07.execute-api.sa-east-1.amazonaws.com/dev13';
  query: string = 'SAEP_Database';
  items$: Observable<any> | undefined;
  dataLoaded = false;
  jsonData: any;
  sortColumn: string = '';
  sortDirection: number = 1;
  dias_terminal: Date = new Date();
  Freetime: number = 0;
  dados: any[] = [];
  contratos: string[] = [];
  freetime: string[] = [];
  tripcost: string[] = [];
  custoViagem: string = "";
  handling: string[] = [];
  manuseio: string = "";
  demurrage: string[] = [];
  estadia: string = "";
  valorFree: string = '';
  liner: string = "";
  vessel: string = "";
  custoestadia: number = 0;
  dataArray: any;
  progressCounter: any;
  jsonDataParametros!: any[];
  jsonDataPecas!: any[];
  jsonDataNeca!: any[];
  filteredData!: any[];
  jsonDataPipe!: any[];
  jsonDataBat!: any[];
  result: any[] = []; // Definir explicitamente o tipo como any[]
  pecas: any[]=[];
  mergedData: any[] = []; // Definir explicitamente o tipo como any[]


  constructor(
    private carregaService: CarregaService,
    private http: HttpClient,
    private dynamodbService: ApiService,
    private servicoCerto: DynamoService,
    private cd: ChangeDetectorRef


  ) { }

  async onGetItems(): Promise<void> {
    const tableName = 'SAEP_Database';

    if (!this.result || this.result.length === 0) {
      console.error('Result is empty or undefined');
      return;
    }

    const searchIds = this.result.map(item => String(item.Peca)); // Converte as chaves para string
    const batchSize = 5;

    if (!searchIds || searchIds.length === 0) {
      console.error('Pecas is empty or undefined');
      return;
    }

    const searchIdBatches = [];

    for (let i = 0; i < searchIds.length; i += batchSize) {
      searchIdBatches.push(searchIds.slice(i, i + batchSize));
    }

    const requests = searchIdBatches.map(async (batch) => {
      const response = await this.carregaService.getItems3(tableName, batch).toPromise();
      return response;
    });

    try {
      const responses = await Promise.all(requests);

      for (const response of responses) {
        if (response && response.statusCode === 200) {
          try {
            const data = JSON.parse(response.body);
            if (Array.isArray(data)) {
              // Vamos mapear os valores das chaves "S" ou "N"
              const items = data.map(item => ({


                Descricao: item.Descricao.S || item.Descricao,
                Embalagem: item.Embalagem.S || item.Embalagem,
                ID: item.ID.S || item.ID,
                Line: parseInt(item.Line.N || item.Line),
                MPCode: item.MPCode.S || item.MPCode,
                MPName: item.MPName.S || item.MPName,
                Supplier: item.Supplier.S || item.Supplier,
                SupName: item.SupName.S || item.SupName,
                SupShare: item.SupShare.S || item.SupShare,
                Country: item.Country.S || item.Country,
                Custo: parseFloat(item.Custo.N || item.Custo),
                TranspotTime: item.TranspotTime.S || item.TranspotTime,
                SafetyStockTime: item.SafetyStockTime.S || item.SafetyStockTime,
                SafetyStockQtde: item.SafetyStockQtde.S || item.SafetyStockQtde,
                UnitySizeCentral: item.UnitySizeCentral.S || item.UnitySizeCentral,
                UnityQtyCentral: item.UnityQtyCentral.S || item.UnityQtyCentral,
                MCM: item.MCM.S || item.MCM,
                TypeBalance: item.TypeBalance.S || item.TypeBalance,
                UsedFor: item.UsedFor.S || item.UsedFor,
                Rate: item.Rate.N || item.Rate,
                RM: item.RM.N || item.RM,
                QtdeAmox:item.QtdeAmox.N || item.QtdeAmox,
                QtdeReceb:item.QtdeReceb.N || item.QtdeReceb,
                Qtde3:item.Qtde3.N || item.Qtde3,
                QtdeLm:item.QtdeLm.N || item.QtdeLm,

              }));

              this.pecas = (this.pecas || []).concat(items.map(item => ({ ...item, checked: false })));
              console.log(this.pecas);
            } else {
              console.error('Invalid items data:', data);
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        } else {
          console.error('Invalid response:', response);
        }
      }
    } catch (error) {
      console.error(error);
    }
    this.mergeDataBasedOnPeca()
  }




  async onGetItems2(): Promise<void> {
    const tableName = 'SAEP_Database'; // Substitua pelo nome correto da tabela
    const searchId = ['2779482', '2579168', '1879996']; // Substitua pelos IDs desejados

    (await this.carregaService.getItems3(tableName, searchId)).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          try {
            const items = JSON.parse(response.body);
            if (Array.isArray(items)) {
              // Processa os itens e converte os valores "S" e "N" de volta
              this.pecas = items.map(item => {
                const convertedItem: any = {};
                for (const key in item) {
                  if (item.hasOwnProperty(key)) {
                    // Verifica se o valor é do tipo "S" (string)
                    if (item[key].hasOwnProperty('S')) {
                      convertedItem[key] = item[key].S;
                    }
                    // Verifica se o valor é do tipo "N" (número)
                    else if (item[key].hasOwnProperty('N')) {
                      convertedItem[key] = parseFloat(item[key].N);
                    }
                  }
                }
                // Adiciona a chave 'checked' a cada item, com valor inicial como false
                convertedItem.checked = false;
                return convertedItem;
              });
              console.log(this.pecas);
            } else {
              console.error('Invalid items data:', items);
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        } else {
          console.error('Invalid response:', response);
        }
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

   mergeDataBasedOnPeca() {
    // Crie um objeto para armazenar os dados mesclados
    this.mergedData = [];
    interface Peca {
      MPCode: string;
      MPName: string;
      Supplier: string;
      SupName: string;
      SupShare: string;
      Country: string;
      Custo: number;
      TranspotTime: string;
      SafetyStockTime: string;
      SafetyStockQtde: string;
      UnitySizeCentral: string;
      UnityQtyCentral: string;
      MCM: string;
      TypeBalance: string;
      UsedFor: string;
      Rate: number;
      RM: number;
      QtdeAmox:number;
      QtdeReceb:number;
      Qtde3:number;
      QtdeLm:number;
      // Adicione outras propriedades necessárias aqui
    }

    // Crie um mapa (dictionary) com base na chave "ID" dos objetos em 'pecas'
    const pecasMap: { [key: string]: Peca } = {};

    this.pecas.forEach((peca) => {
      pecasMap[peca.ID] = peca;
    });

    // Compare a chave "Peca" dos objetos em 'result' com o mapa 'pecasMap'
    this.result.forEach((data) => {
      const peca = pecasMap[data.Peca];
      if (peca) {
        // Se uma correspondência for encontrada, crie um novo objeto mesclado
        const mergedObject = {
          Peca: data.Peca, // A chave "Peca" dos objetos em 'result'
          Saldo:data.Saldo,
          // Adicione outras chaves de 'peca' que deseja incluir


          MPCode: peca.MPCode,
          MPName: peca.MPName,
          Supplier: peca.Supplier,
          SupName: peca.SupName,
          SupShare: peca.SupShare,
          Country: peca.Country,
          Custo: peca.Custo,
          TranspotTime: peca.TranspotTime,
          SafetyStockTime: peca.SafetyStockTime,
          SafetyStockQtde: peca.SafetyStockQtde,
          UnitySizeCentral: peca.UnitySizeCentral,
          UnityQtyCentral: peca.UnityQtyCentral,
          MCM: peca.MCM,
          TypeBalance: peca.TypeBalance,
          UsedFor: peca.UsedFor,
          Rate: peca.Rate,
          RM: peca.RM,
          QtdeAmox:peca.QtdeAmox,
          QtdeReceb:peca.QtdeReceb,
          Qtde3:peca.Qtde3,
          QtdeLm:peca.QtdeLm,





          // ...outras chaves de 'peca' que deseja incluir
        };
        this.mergedData.push(mergedObject);
      }
    });
    console.log(this.mergedData);
    return this.mergedData;
  }




  async onFileSelected(event: any) {
    const file = event.target.files[0];

    try {
      const processResult = await this.servicoCerto.processFile(file);
      if (Array.isArray(processResult)) {
        this.result = processResult;
        console.log('Resultado da leitura do arquivo:', this.result);
      } else {
        console.error('O resultado da leitura não é uma matriz válida.');
      }
    } catch (error) {
      console.error('Erro ao processar o arquivo:', error);
    }
    this.onGetItems()
  }

  calculateTotal(item: any): number {
    const pipeline = item.Pipeline !== undefined ? item.Pipeline : 0;
    const stock = item.Stock !== undefined ? item.Stock : 0;
    const call = item.Call !== undefined ? item.Call : 0;
    const db12 = item.DB12 !== undefined ? item.DB12 : 0;
    const custo = item.Custo !== undefined ? item.Custo : 0;

    return (pipeline + stock + call - db12) * custo;
  }




  async onFileTXTSelected(event: any) {
    const file: File = event.target.files[0];

    try {
      const jsonData = await this.carregaService.loadTextFile(file);
      this.jsonDataParametros = jsonData;
      console.log('Dados carregados:', jsonData);
      // Resto do seu código para processar os dados carregados
    } catch (error) {
      console.error('Erro ao carregar o arquivo:', error);
    }
  }



  async onFileNECASelected(event: any) {
    const file: File = event.target.files[0];

    try {
      const jsonData = await this.carregaService.loadTextNeca(file);
      this.jsonDataNeca = jsonData;
      console.log('Dados carregados:', jsonData);
    } catch (error) {
      console.error('Erro ao carregar o arquivo:', error);
    }
  }

  async onFilePipeSelected(event: any) {
    const file: File = event.target.files[0];

    try {
      const jsonData = await this.carregaService.loadTextPipe(file);
      this.jsonDataPipe = jsonData;
      console.log('Dados carregados:', this.jsonDataPipe);
    } catch (error) {
      console.error('Erro ao carregar o arquivo:', error);
    }
  }
  async salvarNoBanco() {
    this.progressCounter = 0;
    this.showProgressBar = true;
    console.log('Itens a serem salvos:', this.filteredData);
    this.progressValue = 0;
    const batchSize = 25; // Tamanho máximo para cada lote

    const currentDate = new Date();
    const formattedDate = currentDate.getDate().toString().padStart(2, '0') +
      (currentDate.getMonth() + 1).toString().padStart(2, '0') +
      currentDate.getFullYear().toString();

    // Certifique-se de que 'getWeek' está definida em algum lugar
    const semana = getWeek(currentDate);
    const year = currentDate.getFullYear().toString();

    // Certifique-se de que 'this.query' esteja definida
    this.filteredData.forEach(item => {
      item.tableName = this.query;
    });

    const batches = this.chunkArray(this.filteredData, batchSize);

    try {
      // Certifique-se de que 'this.dynamodbService.salvar' retorne promessas
      const responses = await Promise.all(batches.map(batch =>
        this.dynamodbService.salvar(batch, this.query, this.urlAtualiza).toPromise()
      ));
      this.progressValue = this.filteredData.length;
      console.log('Respostas do salvamento:', responses);
      this.progressCounter = this.progressCounter + this.filteredData.length;
    } catch (error) {
      console.error('Erro ao salvar em lote:', error);
    }

    // Ocultar a barra de progresso após o término das operações
    this.showProgressBar = false;
  }




  chunkArray(array: any[], size: number): any[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  async ngOnInit() {

  }



  testarArquivo(arquivo: File): void {
    this.carregaService.testarArquivoCSV(arquivo).then((estaCorreto) => {
      if (estaCorreto) {
        console.log('O arquivo CSV está correto.');
      } else {
        console.log('O arquivo CSV está incorreto.');
      }
    }).catch((erro) => {
      console.error('Erro ao testar o arquivo CSV:', erro);
    });
  }



  inflateData(rawData: any[]): any[] {
    let i = 0;


    return rawData.map((item: any) => {


      const universalDate = this.carregaService.convertExcelDate(item[0]);


      const inflatedItem: any = {
        'tableName': this.query,
        'ID': (item[19] + item[9]).toString(),
        'UpdateDate': universalDate,
        'EcoN': item[9],
        'Creation': item[14],
        'Status': item[16],
        'Peca': item[19],
        'Replaced': item[29],
        'Replaces': item[30],
        'Packaging': item[59],
        'ECOAfter': item[94],
        'ECOBefore': item[95],
        'GeneralTime': item[216],
        'SOP': item[219],
        'SOCOP': item[220],
        'SOPDev': item[223],
        'SOCOPDev': item[224],

        // Adicione mais campos conforme necessário
      };


      return inflatedItem;

    });

  }

  sortBy(column: string) {
    if (this.sortColumn === column) {
      // Reverse the sort direction
      this.sortDirection *= -1;
    } else {
      // Set the new sort column and reset the sort direction
      this.sortColumn = column;
      this.sortDirection = 1;
    }

    // Sort the data array based on the selected column and direction
    this.mergedData.sort((a: { [x: string]: any; }, b: { [x: string]: any; }) => {
      const valueA = a[this.sortColumn];
      const valueB = b[this.sortColumn];

      if (valueA < valueB) {
        return -1 * this.sortDirection;
      } else if (valueA > valueB) {
        return 1 * this.sortDirection;
      } else {
        return 0;
      }
    });
  }

  sortBy2(column: string) {
    if (this.sortColumn === column) {
      // Reverse the sort direction
      this.sortDirection *= -1;
    } else {
      // Set the new sort column and reset the sort direction
      this.sortColumn = column;
      this.sortDirection = 1;
    }

    // Sort the data array based on the selected column and direction
    this.filteredData.sort((a: { [x: string]: any; }, b: { [x: string]: any; }) => {
      const valueA = column === 'TotalCost' ? this.calculateTotal(a) : a[column];
      const valueB = column === 'TotalCost' ? this.calculateTotal(b) : b[column];

      if (valueA < valueB) {
        return -1 * this.sortDirection;
      } else if (valueA > valueB) {
        return 1 * this.sortDirection;
      } else {
        return 0;
      }
    });
  }




}

