import { CarregaService } from '../services/carrega_file/carrega.service';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { format, parse, differenceInDays } from 'date-fns';
import { ApiService } from '../services/contratos/contratos.service';
import { map, take } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { Observable } from 'rxjs';



@Component({
  selector: 'atualizar-root',
  templateUrl: './atualizar.component.html',
  styleUrls: ['./atualizar.component.css'],
  template: `
    <progressbar [value]="progressValue" [max]="100">{{ progressValue }}%</progressbar>
  `
})
export class AtualizarComponent {
  progressValue = 0; // Valor atual da barra de progresso
  maxValue = 0; // Valor máximo da barra de progresso
  showProgressBar = false;
  @ViewChild('downloadLink') downloadLink!: ElementRef<HTMLAnchorElement>;
  urlAtualiza: string = 'https://uj88w4ga9i.execute-api.sa-east-1.amazonaws.com/dev12';
  urlConsulta: string = 'https://4i6nb2mb07.execute-api.sa-east-1.amazonaws.com/dev13';
  query: string = 'Pipeline_Inbound';
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





  constructor(
    private carregaService: CarregaService,
    private http: HttpClient,
    private dynamodbService: ApiService,


  ) { }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    const fileUrl = URL.createObjectURL(file);
    const rawData = await this.carregaService.loadFile(fileUrl);
    const inflatedData = this.inflateData(rawData); // Inflar os campos desejados



    this.jsonData = inflatedData;
    this.dataLoaded = true;
    // Chama a função para salvar os dados no API Gateway


  }


  salvarNoBanco() {
    this.showProgressBar = true;
    console.log('Item a ser salvo:', this.jsonData);
    this.progressValue = 0;
    this.maxValue = this.jsonData.length;

    const batchSize = 10; // Defina o tamanho máximo para cada lote

    const batches = this.chunkArray(this.jsonData, batchSize); // Fraciona o jsonData em lotes menores

    for (const batch of batches) {
      // Acrescentar o campo "lastupdate" com o valor da data de hoje
      const currentDate = new Date();
      const formattedDate = currentDate.getDate().toString().padStart(2, '0') +
                            (currentDate.getMonth() + 1).toString().padStart(2, '0') +
                            currentDate.getFullYear().toString();

      for (const item of batch) {
        item.lastupdate = formattedDate;
      }

      this.dynamodbService.salvar(batch, this.query, this.urlAtualiza).subscribe(
        response => {
          this.progressValue = this.progressValue + batch.length;
          console.log('Resposta do salvamento:', response);
        },
        error => {
          console.error('Erro ao salvar:', error);
        }
      );
    }

    setTimeout(() => {
      this.showProgressBar = false;
    }, 7000); // Defina o tempo adequado conforme necessário
  }


  chunkArray(array: any[], size: number): any[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  ngOnInit() {

    const key = 'liner'; // Substitua 'propriedade' pelo nome da propriedade que você deseja obter
    const query = 'PowerMathDatabase2'
    const filtro = '';
    this.items$ = this.dynamodbService.getItems(query, this.urlConsulta, filtro).pipe(
      map(data => {
        const parsedData = JSON.parse(data.body); // Parse a string JSON contida em data.body
        return parsedData; // Retorna o objeto JSON parseado
      })
    );

    this.items$.subscribe(
      items => {
        this.contratos = items.map((item: { liner: any; }) => item.liner);
        this.freetime = items.map((item: { freetime: any; }) => item.freetime);
        this.tripcost = items.map((item: { tripcost: any; }) => item.tripcost);
        this.handling = items.map((item: { fsperiod: any; }) => item.fsperiod);
        this.demurrage = items.map((item: { scperiod: any; }) => item.scperiod);

      },
      error => {
        console.error(error);
      }
    );

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
  return rawData.map((item: any) => {
    const today = new Date(); // Obter a data atual
    const ataDate = parse(item['ATA'], 'dd/MM/yyyy', new Date()); // Converter a data de string para objeto Date

    const diffInDays = differenceInDays(today, ataDate); // Calcular a diferença em dias
    let i = 0;
    while (i < this.freetime.length) {

      if (item['Liner'] === this.contratos[i]) {
        this.valorFree = this.freetime[i];
        this.custoViagem = this.tripcost[i];
        this.manuseio = this.handling[i];
        this.estadia = this.demurrage[i];
      }
      i = i + 1;

    }
    this.Freetime = +this.valorFree - diffInDays; //calculo o numero de dias de freetime

    if (this.Freetime < 0) {
      this.custoestadia = +this.estadia * this.Freetime
    } else {
      this.custoestadia = 0;
    }
    if (this.custoestadia < 0) {
      this.custoestadia = this.custoestadia * (-1);
    }
    const inflatedItem: any = {
      'tableName': this.query,
      'ID': item['Invoice'],
      'Process': item['Process'],
      'Container': item['Container'],
      'Channel': item['Channel'],
      'Step': item['Step'],
      'ClearancePlace': item['ClearancePlace'],
      'Transport': item['Transport'],
      'Invoice': item['Invoice'],
      'Liner': item['Liner'],
      'ATA': item['ATA'],
      'Dias': diffInDays,
      'FreeTime': this.Freetime,
      'TripCost': this.custoViagem,
      'Handling': this.manuseio,
      'Demurrage': this.custoestadia,
      'Vessel': item['Vessel']

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
  this.jsonData.sort((a: { [x: string]: any; }, b: { [x: string]: any; }) => {
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
