import { CarregaService } from '../services/carrega_file/carrega.service';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { format, parse, differenceInDays } from 'date-fns';
import { ApiService } from '../services/contratos/contratos.service';
import { map, take } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';



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
  query: string = 'items_Excel_Karrara';
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
    const fileBlob = await fetch(fileUrl).then(response => response.blob());
    const rawData = await this.carregaService.loadFile(fileBlob);
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

  async ngOnInit() {

    const key = 'liner'; // Substitua 'propriedade' pelo nome da propriedade que você deseja obter
    const query = 'PowerMathDatabase2'
    const filtro = '';
    this.items$ = (await this.dynamodbService.getItems(query, this.urlConsulta, filtro)).pipe(
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
    let i = 0;
    return rawData.map((item: any) => {

      const janelas: string[] = item['5'].split('|'); // Divide o valor da chave '5' usando o caractere '|'
      const janelaData: Date[] = [];
      const fornecedor: string[] = item['6'].split('|'); // Divide o valor da chave '6' usando o caractere '|'
      const destino: string[] = item['15'].split('|'); // Divide o valor da chave '6' usando o caractere '|'
      const janelaDestinoData: Date[] = [];
      const janeladestino: string[] = item['17'].split('|'); // Divide o valor da chave '6' usando o caractere '|'
      const currentDate = new Date();
      const formattedDate = format(currentDate, 'ddMMyyyyHHmmss') + i;
      i = i + 1;
      console.log(formattedDate);
      const serialNumber = item['4'];



      const dataFormatada = this.carregaService.formatDate(serialNumber);
      const dataDestinoFormatada = this.carregaService.formatDate(item['16']);
      let passos = 0;

      for (let i = 0; i < janelas.length; i++) {
        const horasMinutos = janelas[i];

        const dataFinal = new Date(dataFormatada);
        if (horasMinutos !== null && horasMinutos !== undefined && horasMinutos !== '') {
          const [horas, minutos] = horasMinutos.split(':');
          dataFinal.setHours(dataFinal.getHours() + parseInt(horas, 10));
          dataFinal.setMinutes(dataFinal.getMinutes() + parseInt(minutos, 10));
          janelaData[i] = dataFinal;
          passos = passos +1;
        }

      }

      for (let i = 0; i < janeladestino.length; i++) {
        const horasMinutos = janeladestino[i];

        const dataFinal = new Date(dataDestinoFormatada);
        if (horasMinutos !== null && horasMinutos !== undefined && horasMinutos !== '') {
          const [horas, minutos] = horasMinutos.split(':');
          dataFinal.setHours(dataFinal.getHours() + parseInt(horas, 10));
          dataFinal.setMinutes(dataFinal.getMinutes() + parseInt(minutos, 10));
          janelaDestinoData[i] = dataFinal;
          passos = passos +1;
        }

      }

      const inflatedItem: any = {
        'tableName': this.query,
        'ID': formattedDate.toString(),
        'description': item[3],
        'Passos':passos,
        'Plate': item[14],
        'date': dataFormatada,
        'Janela 1': janelaData[0], // Atribui o primeiro valor do array resultante a 'Janela 1'
        'Janela 2': janelaData[1], // Atribui o segundo valor do array resultante a 'Janela 2'
        'Janela 3': janelaData[2], // Atribui o terceiro valor do array resultante a 'Janela 3'
        'Janela 4': janelaData[3], // Atribui o terceiro valor do array resultante a 'Janela 3'
        'Fornecedor 1': fornecedor[0], // Atribui o primeiro valor do array resultante a 'Janela 1'
        'Fornecedor 2': fornecedor[1], // Atribui o primeiro valor do array resultante a 'Janela 1'
        'Fornecedor 3': fornecedor[2], // Atribui o primeiro valor do array resultante a 'Janela 1'
        'Fornecedor 4': fornecedor[3], // Atribui o primeiro valor do array resultante a 'Janela 1'
        'Destino 1': destino[0], // Atribui o primeiro valor do array resultante a 'Janela 1'
        'Destino 2': destino[1], // Atribui o primeiro valor do array resultante a 'Janela 1'
        'Destino 3': destino[2], // Atribui o primeiro valor do array resultante a 'Janela 1'
        'Destino 4': destino[3], // Atribui o primeiro valor do array resultante a 'Janela 1'
        'dataDestino': item['16'],
        'JanelaDestino 1': janelaDestinoData[0], // Atribui o primeiro valor do array resultante a 'Janela 1'
        'JanelaDestino 2': janelaDestinoData[1], // Atribui o primeiro valor do array resultante a 'Janela 1'
        'JanelaDestino 3': janelaDestinoData[2], // Atribui o primeiro valor do array resultante a 'Janela 1'
        'JanelaDestino 4': janelaDestinoData[3], // Atribui o primeiro valor do array resultante a 'Janela 1'
        'Weight Loaded': item[10],
        'Cubage': item[12],
        'Volume': item[11],
        'Transport Type': item[13],
        'Total Distance': item[8],
        'Total Cost': item[24]


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
