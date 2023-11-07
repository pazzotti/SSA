import { CarregaService } from '../services/carrega_file/carrega.service';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { format, parse, differenceInDays, getWeek } from 'date-fns';
import { ApiService } from '../services/contratos/contratos.service';
import { map, take } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { Observable } from 'rxjs';
import { DynamoService } from '../dynamo.service';
import { ChevronUp, ChevronDown } from 'angular-feather/icons';
import { FeatherModule } from 'angular-feather';



@Component({
  selector: 'app-aprovacao',
  templateUrl: './aprovacao.component.html',
  styleUrls: ['./aprovacao.component.css'],
  template: `
    <progressbar [value]="progressValue" [max]="100">{{ progressValue }}%</progressbar>
  `
})
export class AprovacaoComponent {



  progressValue = 0; // Valor atual da barra de progresso
  maxValue = 0; // Valor máximo da barra de progresso
  showProgressBar = false;
  @ViewChild('downloadLink') downloadLink!: ElementRef<HTMLAnchorElement>;
  urlAtualiza: string = 'https://wo31r57k9d.execute-api.sa-east-1.amazonaws.com/Dev1';
  urlConsulta: string = 'https://4i6nb2mb07.execute-api.sa-east-1.amazonaws.com/dev13';
  query: string = 'SAEP';
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
  pecas: any[] = [];
  mergedData: any[] = []; // Definir explicitamente o tipo como any[]
  showPecaColumn: boolean = true;
  showPecaColumn2: boolean = false;
  showMPCodeColumn: boolean = true;
  showMPNameColumn: boolean = true;
  showSupplierColumn: boolean = false;
  showSupNameColumn: boolean = false;
  showSupShareColumn: boolean = false;
  showCountryColumn: boolean = false;
  showCustoColumn: boolean = false;
  showTranspotTimeColumn: boolean = false;
  showSafetyStockTimeColumn: boolean = false;
  showSafetyStockQtdeColumn: boolean = false;
  showUnitySizeCentralColumn: boolean = false;
  showUnityQtyCentralColumn: boolean = false;
  showMCMColumn: boolean = false;
  showTypeBalanceColumn: boolean = false;
  showUsedForColumn: boolean = false;
  showRateColumn: boolean = false;
  showRMColumn: boolean = false;
  showQtdeAmoxColumn: boolean = false;
  showQtdeRecebColumn: boolean = false;
  showQtde3Column: boolean = false;
  showQtdeLmColumn: boolean = false;
  showSaldoColumn: boolean = false;
  itens!: any[];
  expandedItems: Set<string> = new Set();
  expandedItem: string | null = null;
  expandedValue: string | null = null;
  expandedData: any[] = [];


  constructor(

    private carregaService: CarregaService,
    private http: HttpClient,
    private dynamodbService: ApiService,
    private servicoCerto: DynamoService,
    private cd: ChangeDetectorRef


  ) {

  }

  async getSaep(): Promise<void> {
    const filtroUser = 'all';
    (await this.dynamodbService.getItems(this.query, this.urlConsulta, filtroUser)).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          try {
            const items = JSON.parse(response.body);
            if (Array.isArray(items)) {
              // Filtrar apenas os itens com "Aprovacao" igual a false
              this.itens = items.filter(item => item.Aprovado === false);
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


  toggleExpand(value: string) {

    this.expandedValue = value;
    if (this.showPecaColumn2 == true) {
      this.showPecaColumn2 = false;
    } else {
      this.updateExpandedData();
      this.showPecaColumn2 = true;
    }
  }

  getExpandedItems(): any[] {
    if (this.expandedValue) {
      const expandedValueString = this.expandedValue.toString();
      return this.itens.filter(item => item.ID.toString().slice(0, 5) === expandedValueString.slice(0, 5));
    }
    return [];
  }
  updateExpandedData() {
    this.expandedData = this.getExpandedItems();
  }




  isExpanded(value: string): boolean {
    return this.expandedItems.has(value);
  }

  filtrarItensRepetidos(valor: string | null) {
    if (valor === null) {
      return [];
    }

    const filteredItems = this.itens.filter(item => item.ID.toString().slice(0, 5) === valor);

    // Verifique se há pelo menos um item correspondente em this.itens com "Aprovado" igual a false
    const algumAprovadoFalse = this.itens
      .filter(item => item.ID.toString().slice(0, 5) === valor)
      .some(item => item.Aprovado === false);

    // Defina a chave "Aprovado" em filteredItems com base na verificação
    if (algumAprovadoFalse) {
      filteredItems.forEach(item => {
        item.Aprovado = false;
      });
    } else {
      filteredItems.forEach(item => {
        item.Aprovado = true;
      });
    }

    return filteredItems;
  }




  filtrarItensUnicos() {
    const itensUnicos = [];
    const valoresVistos = new Set();

    for (const item of this.itens) {
      const chave = item.ID.toString().slice(0, 5); // Obter os 5 primeiros caracteres

      if (!valoresVistos.has(chave)) {
        valoresVistos.add(chave);
        itensUnicos.push(item);
      }
    }

    // Verifique se todos os itens com a mesma chave "ID" têm "Aprovado" igual a true
    itensUnicos.forEach(itemUnico => {
      const chave = itemUnico.ID.toString().slice(0, 5);
      const todosAprovados = this.itens
        .filter(item => item.ID.toString().slice(0, 5) === chave)
        .every(item => item.Aprovado === true);
      itemUnico.Aprovado = todosAprovados;
    });

    return itensUnicos;
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
      QtdeAmox: number;
      QtdeReceb: number;
      Qtde3: number;
      QtdeLm: number;
      DailyRate: number;
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
          Saldo: data.Saldo,
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
          QtdeAmox: peca.QtdeAmox,
          QtdeReceb: peca.QtdeReceb,
          Qtde3: peca.Qtde3,
          QtdeLm: peca.QtdeLm,





          // ...outras chaves de 'peca' que deseja incluir
        };
        this.mergedData.push(mergedObject);
      }
    });
    console.log(this.mergedData);
    return this.mergedData;
  }

  async analisar() {
    this.calcularDR();
    this.calcularSaldo();
    this.aprovacao();
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

  async calcularSaldo() {
    for (let i = 0; i < this.mergedData.length; i++) {
      const item = this.mergedData[i];
      const qtde3 = parseInt(item.Qtde3, 10);
      const rm = parseFloat(item.RM);
      const saldo = parseFloat(item.Saldo);
      const QtdeAmox = parseFloat(item.QtdeAmox);
      if (((QtdeAmox + qtde3) - (rm + saldo)) >= 0) {
        item.saldoTotal = true;
      } else {
        item.saldoTotal = false;
      }

    }
    this.mergedData.forEach(item => {
      item.saldoTotal = item.saldoTotal; // Adicione a propriedade 'DailyRate' a cada objeto no array
    });
  }
  async calcularDR() {

    for (let i = 0; i < this.mergedData.length; i++) {
      const item = this.mergedData[i];
      const DR = item.Rate;
      const saldo = item.Saldo;
      if (saldo < DR * 0.1) {
        item.DailyRate = true;
      } else {
        item.DailyRate = false;
      }
    }

    // Agora, você pode adicionar a propriedade 'DailyRate' à variável mergedData
    this.mergedData.forEach(item => {
      item.DailyRate = item.DailyRate; // Adicione a propriedade 'DailyRate' a cada objeto no array
    });

    console.log(this.mergedData);

  }

  async aprovacao() {

    for (let i = 0; i < this.mergedData.length; i++) {
      const item = this.mergedData[i];
      let saldoTotal = item.saldoTotal;
      let DailyRate = item.DailyRate;
      const saldo = item.Saldo;
      let pneu = false;
      let seq = false;

      if (item.MPCode.startsWith("R81") || item.MPCode.startsWith("R91")) {
        pneu = true;
      }

      if (!item.MPCode.startsWith("R81") && !item.MPCode.startsWith("R91") && item.MCM == "S") {
        seq = true;
      }


      if (saldoTotal == true || DailyRate == true || saldo < 0 || pneu == true) {
        item.Aprovado = true;
      } else {
        item.Aprovado = false;
      }
    }

    // Agora, você pode adicionar a propriedade 'DailyRate' à variável mergedData
    this.mergedData.forEach(item => {
      item.DailyRate = item.DailyRate; // Adicione a propriedade 'DailyRate' a cada objeto no array
    });

    console.log(this.mergedData);

  }

  getCssClass(item: any): string {
    if (item.MPCode.startsWith("R81") || item.MPCode.startsWith("R91")) {
      return 'green-background';
    }
    return '';
  }

  getCssClass2(item: any): string {
    if (!item.MPCode.startsWith("R81") && !item.MPCode.startsWith("R91") && item.MCM == "S") {
      return 'green-background';
    }
    return '';
  }

  async salvarNoBanco(status: boolean, linha: string) {

    const comentario = prompt('Informe o comentário da análise:');

    if (comentario === null || comentario.trim() === '') {
      alert('Você precisa fornecer um comentário válido.');
      return;
    }

    this.itens.forEach(item => {
      if (item.ID === linha) {
        if (status) {
          item.Aprovado = true;
          item.AprovadoManual = true;
        } else {
          item.Aprovado = false;
          item.AprovadoManual = false;
        }
        item.Comentario = comentario
      }
    });

    const itemParaSalvar = [this.itens.filter(item => item.ID === linha)];
    try {
      // Certifique-se de que 'this.dynamodbService.salvar' retorne promessas
      const responses = await Promise.all(itemParaSalvar.map(batch =>
        this.dynamodbService.salvar(batch, this.query, this.urlAtualiza).toPromise()
      ));
      console.log('Respostas do salvamento:', responses);
    } catch (error) {
      console.error('Erro ao salvar em lote:', error);
    }
  }





  getProgressWidth(): string {
    const totalItems = this.filteredData.length;
    const processedItems = this.progressCounter;
    const progressPercentage = (processedItems / totalItems) * 100;
    return `${progressPercentage}%`;
  }

  chunkArray(array: any[], size: number): any[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  async ngOnInit() {
    await this.getSaep();

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
    this.itens.sort((a: { [x: string]: any; }, b: { [x: string]: any; }) => {
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
    this.expandedData.sort((a: { [x: string]: any; }, b: { [x: string]: any; }) => {
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





}

