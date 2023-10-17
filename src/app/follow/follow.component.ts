import { Component, OnInit, ViewChild } from '@angular/core';
import { format, isToday } from 'date-fns';
import { debounceTime } from 'rxjs/operators';
import { Subject, Subscription, interval } from 'rxjs';
import { ApiService } from '../services/contratos/contratos.service';
import { AppModule } from '../app.module';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { CarregaService } from '../services/carrega_file/carrega.service';
import { InterfaceService } from '../services/awsInterface/awsInterface.service';


@Component({
  selector: 'app-follow',
  templateUrl: './follow.component.html',
  styleUrls: ['./follow.component.css']
})

export class FollowComponent implements OnInit {


  filteredData!: any[];
  subscription: Subscription | undefined;
  items: any[] = [];
  itemsAntigo: any[] = [];
  fornecedores: any[] = [];
  posicao: any[] = [];
  sortColumn: string = '';
  sortNumber: number = 0;
  sortDirection: number = 1;
  dataLoaded = true;
  filtroDataInicio: Date = new Date();
  filtroDataTermino: Date = new Date();
  itemsFiltrados: any[] = [];
  searchText: string = '';
  items2: any[] = [ /* Seus itens aqui */];
  private searchTextSubject = new Subject<string>();
  private searchTextSubscription!: Subscription;
  urlConsulta: string = 'https://nf6eoyi088.execute-api.sa-east-1.amazonaws.com/dev123';
  urlSalva: string = 'https://uj88w4ga9i.execute-api.sa-east-1.amazonaws.com/dev12';
  query: string = 'SAEP_Database';
  data: any;
  editMode!: boolean[];
  informationMode!: boolean[];
  address!: string;
  DataAtual: Date = new Date();
  dialogOpen!: boolean;
  dialogAddViagem!: boolean;
  janela1!: string;
  janela2!: string;
  janela3!: string;
  janela4!: string;
  janelaDestino1!: string;
  janelaDestino2!: string;
  janelaDestino3!: string;
  janelaDestino4!: string;
  carriers!: any[];
  places!: any[];
  transportadora!: string[];
  locais!: string[];
  datePipe: any;
  selectedDescription!: string;
  Transportadoras!: string;
  listaTransportadoras!: any[];
  dataInvertida: string = '';
  tipoVeiculo!: any[];
  listaVeiculo1!: any[];
  datadescarga!: string | null;
  tipoVeiculos: any;
  ecos!: any[];
  maiorDataSOP: Date = new Date(0); // Inicializa com uma data muito antiga
  maiorDataSOCOP: Date = new Date(0);
  maiorDataSOPDev: Date = new Date(0);
  maiorDataSOCOPDev: Date = new Date(0);
  selectedItem: any;
  selectedStatus!: string;
  statusOptions: string[] = ['Analyzing', 'Denied', 'Accepted'];
  showTooltip: boolean = false;
  itemToShowTooltipFor: any = null;
  tooltipPosition: { x: number, y: number } = { x: 300, y: 0 };
  itens: any[] = []; // Seus itens
  anoAtual: number = new Date().getFullYear();
  semanaAtual: number = 1;
  semanasPorAno: number = 52; // Pode ser 53 em alguns anos
  mostrarItensFinalizados = false;
  itensFiltrados: any[] = [];



  constructor(private dynamoDBService: InterfaceService, public dialog: MatDialog, private http: HttpClient, private carregaService: CarregaService,) {
    this.editMode = [];
    this.informationMode = [];

  }


  async ngOnInit() {
    await this.getItemsFromDynamoDB();



  }

  InsereComent(item: any, fieldName: string) {

    const newValue = prompt(`Insert a value for ${fieldName}:`);
    if (newValue !== null) {
      item[fieldName] = newValue;
      this.salvarField(item); // Call salvar function after editing the field
    }

  }

  InsereLine(item: any, fieldName: string) {
    const newValue = prompt(`Insert a value for ${fieldName}:`);

    if (newValue !== null) {
      const numericValue = parseFloat(newValue);

      if (!isNaN(numericValue)) { // Verifica se a conversão foi bem-sucedida
        item[fieldName] = numericValue;
        this.salvarField(item); // Call salvar function after editing the field
      } else {
        alert('Invalid input. Please enter a valid number.');
      }
    }
  }

  calculateTotalCostAvoid(): number {
    return this.itensFiltrados.reduce((total, item) => {
      if (item.StatusWork === 'Accepted') {
        const totalItemCost = this.calculateTotal(item);
        if (totalItemCost > 0) {
          return total + totalItemCost;
        }
      }
      return total;
    }, 0);
  }

  calculateTotalCostScrap(): number {
    return this.itensFiltrados.reduce((total, item) => {
      if (item.StatusWork === 'Denied') {
        const totalItemCost = this.calculateTotal(item);
        if (totalItemCost > 0) {
          return total + totalItemCost;
        }
      }
      return total;
    }, 0);
  }

  calculateTotalCostAvoidReal(): number {
    return this.itensFiltrados.reduce((total, item) => {

      const totalItemCost = this.calculateTotalReal(item);
      if (totalItemCost > 0) {
        return total + totalItemCost;
      }

      return total;
    }, 0);
  }


  InsereStatus(item: any, fieldName: string) {
    const options: Record<number, string> = {
      1: 'Analyzing',
      2: 'Denied',
      3: 'Accepted'
    };

    const choiceInput = prompt(`Escolha uma opção para ${fieldName}:\n1 - Analyzing\n2 - Denied\n3 - Accepted`);

    if (choiceInput !== null) {
      const choice = parseInt(choiceInput);

      if (options[choice]) {
        item[fieldName] = options[choice];
        this.salvarField(item); // Chame a função salvar após editar o campo
      } else {
        alert('Opção inválida.');
      }
    }
  }

  Finished(item: any) {
    const confirmMessage = 'Deseja finalizar o item?';

    if (confirm(confirmMessage)) {
      item.Finished = true;
      this.salvarField(item); // Chame a função salvar após editar o campo
    }
  }


  getStatusCount(status: string): number {
    return this.itensFiltrados.filter(item => item.StatusWork === status).length;
  }

  getOtherStatusCount(): number {
    return this.itensFiltrados.filter(item => !['Accepted', 'Denied', 'Analyzing'].includes(item.StatusWork)).length;
  }

  calculateTotalCost(): number {
    return this.itensFiltrados.reduce((total, item) => {
      const totalItemCost = this.calculateTotal(item);
      if (totalItemCost > 0) {
        return total + totalItemCost;
      }
      return total;
    }, 0);
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  toggleStatusDropdown(item: any) {
    item.visible = true;
    this.selectedStatus = item.Status;
    // Criar um array contendo o objeto
    const jsonArray = [item];

  }

  updateTooltipPosition(event: MouseEvent) {
    this.tooltipPosition = { x: event.clientX, y: event.clientY + 10 }; // Adicione um valor positivo para deslocar o tooltip para baixo
  }


  showTooltipForItem(item: any) {
    if (item.Coment !== '' && item.Coment !== undefined) {
      this.showTooltip = true;
      this.itemToShowTooltipFor = item;
    }
  }

  hideTooltip() {
    this.showTooltip = false;
    this.itemToShowTooltipFor = null;
  }

  async saveStatus(item: any) {
    item.StatusWork = this.selectedStatus;
    item.visible = false;

    // Criar um array contendo o objeto
    const jsonArray = [item];

    this.dynamoDBService.salvar(jsonArray, this.query, this.urlSalva).subscribe(response => {
      // Successfully saved to the database
    }, error => {
      console.log(error);
    });

    this.dialogOpen = false;

    await this.resetStatusDropdown(item);


    await this.salvarField(item); // Call salvar function after editing the field
    await this.ngOnInit();

  }

  async cancelStatus(item: any) {
    await this.resetStatusDropdown(item);

    await this.ngOnInit();


  }


  async resetStatusDropdown(item: any) {
    console.log('Before resetting visible:', item.visible);
    item.visible = false;
    console.log('After resetting visible:', item.visible);

    const jsonArray = [item];
    this.dynamoDBService.salvar(jsonArray, this.query, this.urlSalva).subscribe(response => {
      console.log('Response:', response);
    }, error => {
      console.log('Error:', error);
    });

    this.selectedStatus = '';

  }


  salvarField(item: any) {

    // Criar um array contendo o objeto
    const jsonArray = [item];

    this.dynamoDBService.salvar(jsonArray, this.query, this.urlSalva).subscribe(response => {
      // Successfully saved to the database
    }, error => {
      console.log(error);
    });

    this.dialogOpen = false;
    setTimeout(() => {
      this.getItemsFromDynamoDB();
    }, 200);
  }


  deleteItem(ID: string): void {
    this.dynamoDBService.deleteItem(ID, this.urlSalva, this.query).subscribe(
      response => {
        setTimeout(() => {
          this.ngOnInit();

        }, 400); // Ajuste o tempo de atraso conforme necessário
      },
      error => {
        // Lógica para lidar com erros durante a deleção do item
      }
    );

  }

  cancel(): void {
    this.dialogOpen = false;
    this.dialogAddViagem = false;
  }
  converterData(stringData: string): string {
    const partes = stringData.split('/');
    const dia = partes[0];
    const mes = partes[1];
    const ano = partes[2];

    return `${ano}-${mes}-${dia}`;
  }

  aplicarFiltroPorData(): void {
    if (this.filtroDataInicio && this.filtroDataTermino) {
      const filtroInicio = new Date(this.filtroDataInicio);
      const filtroTermino = new Date(this.filtroDataTermino);

      this.itemsFiltrados = this.items.filter(item => {
        const dataFormatada = this.converterData(item.ATA);
        const dataItem = new Date(dataFormatada);

        return dataItem >= filtroInicio && dataItem <= filtroTermino;
      });
    } else {
      this.itemsFiltrados = this.items;
    }
  }





  async getItemsFromDynamoDB(): Promise<void> {
    const tableName = 'SAEP_Database'; // Substitua pelo nome correto da tabela
    const page = 1; // Agora, page é uma string
    const pageSize = 3000; // page e pageSize devem ser strings
    (await this.carregaService.getItems(tableName, page, pageSize)).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          try {
            const items = JSON.parse(response.body);
            if (Array.isArray(items)) {
              this.ecos = items.map(item => ({ ...item, checked: false }));
              // Adiciona a chave 'checked' a cada item, com valor inicial como false
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


  calculateTotal(item: any): number {

    const pipeline = item.Pipeline !== undefined ? item.Pipeline : 0;
    const stock = item.Stock !== undefined ? item.Stock : 0;
    const call = item.Call !== undefined ? item.Call : 0;
    const db12 = item.DB12 !== undefined ? item.DB12 : 0;
    const custo = item.Custo !== undefined ? item.Custo : 0;
    const line = item.Line !== undefined ? item.Line : 0;

    return (stock + call + line - db12) * custo;
  }

  calculateTotalReal(item: any): number {

    const resultado = item.resultado !== undefined ? item.resultado : 0;


    return resultado;
  }

  iterarSemanas() {
    this.anoAtual = 2023;

    for (let semana = 1; semana <= this.semanasPorAno; semana++) {
      this.semanaAtual = semana;

      for (let i = 0; i < this.ecos.length; i++) {
        const eco = this.ecos[i];
        for (this.semanaAtual = 1; this.semanaAtual <= 52; this.semanaAtual++) {
          const chave1: string = 'Call' + this.semanaAtual + this.anoAtual;
          const chave2: string = 'Stock' + this.semanaAtual + this.anoAtual;
          const chave3: string = 'DB12' + this.semanaAtual + this.anoAtual;
          const chave4: string = 'Line' + this.semanaAtual + this.anoAtual;
          const chave5: string = 'Pipeline' + this.semanaAtual + this.anoAtual;
          const chave: string = 'Saldo';

          if (eco[chave1] !== undefined || eco[chave2] !== undefined || eco[chave3] !== undefined || eco[chave4] !== undefined || eco[chave5] !== undefined) {
            const valor1 = eco[chave1] || 0;
            this.ecos[i].Call = eco[chave1] || 0;

            const valor2 = eco[chave2] || 0;
            this.ecos[i].Stock = eco[chave2] || 0;
            const valor3 = eco[chave3] || 0;
            this.ecos[i].DB12 = eco[chave3] || 0;
            const valor4 = eco[chave4] || 0;
            this.ecos[i].Line = eco[chave4] || 0;


            eco[chave] = valor2 + valor1 + valor4 - valor3;
            this.ecos[i].Saldo = eco[chave];

            if (eco.primeiro === undefined) {
              eco.primeiro = eco[chave];
            }
            eco.ultimo = eco[chave];
            eco.valor1 = valor1
            eco.valor2 = valor2
            eco.valor3 = valor3
            eco.valor4 = valor4

          }
          if (eco.ultimo < 0) {
            eco.ultimo = 0;
          }
          eco.resultado = eco.primeiro - eco.ultimo;
          if (eco.resultado < 0) {
            eco.resultado = 0;
          }
          eco.resultado = eco.resultado * eco.Custo
          this.ecos[i] = eco; // Atualize o objeto no array
        }
      }

      if (this.semanaAtual === this.semanasPorAno) {
        this.semanaAtual = 1;
        this.anoAtual++;
      }
    }
    console.log("Resultado:", this.ecos);
  }



  isDateBeforeToday(date: Date): boolean {
    const today = new Date();
    return date < today;
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
    this.itensFiltrados.sort((a: { [x: string]: any; }, b: { [x: string]: any; }) => {
      const valueA = column === 'TotalCost' ? this.calculateTotal(a) : a[column];
      const valueB = column === 'TotalCost' ? this.calculateTotal(b) : b[column];

      // Handling undefined values
      if (valueA === undefined) {
        return 1 * this.sortDirection;
      }
      if (valueB === undefined) {
        return -1 * this.sortDirection;
      }

      if (valueA < valueB) {
        return -1 * this.sortDirection;
      } else if (valueA > valueB) {
        return 1 * this.sortDirection;
      } else {
        return 0;
      }
    });
  }

  sortBy3(column: string) {
    if (this.sortColumn === column) {
      // Reverse the sort direction
      this.sortDirection *= -1;
    } else {
      // Set the new sort column and reset the sort direction
      this.sortColumn = column;
      this.sortDirection = 1;
    }

    // Define uma função para atribuir valores numéricos aos ícones
    const iconValue = (item: any) => {
      if (item.primeiro > item.ultimo && (item.primeiro >= 0 || item.ultimo >= 0)) {
        return -1; // Valor para 'arrow-down'
      } else if (item.primeiro < item.ultimo && (item.primeiro >= 0 || item.ultimo >= 0)) {
        return 1; // Valor para 'arrow-up'
      } else if (item.primeiro === item.ultimo && (item.primeiro >= 0 || item.ultimo >= 0)) {
        return 0; // Valor para 'anchor'
      } else {
        return 2; // Valor padrão para outros casos
      }
    };

    // Sort the data array based on the selected column and direction
    this.itensFiltrados.sort((a: { [x: string]: any; }, b: { [x: string]: any; }) => {
      // Get the icon values for items a and b
      const valueA = iconValue(a);
      const valueB = iconValue(b);

      // Compare based on the icon values
      if (valueA > valueB) {
        return this.sortDirection;
      } else if (valueA < valueB) {
        return -this.sortDirection;
      } else {
        return 0;
      }
    });
  }


  convertPartPeriodToDate(partPeriod: string): Date {
    const year = parseInt(partPeriod.substring(0, 4));
    const month = parseInt(partPeriod.substring(4, 6));
    const period = parseInt(partPeriod.substring(6));

    // Calcula o último dia do mês baseado no mês e no ano
    const lastDayOfMonth = new Date(year, month, 0).getDate();

    // Calcula o dia baseado no período (1 ou 2) e no último dia do mês
    const day = period === 1 ? 15 : lastDayOfMonth;

    const calculatedDate = new Date(year, month - 1, day); // Mês - 1 porque os meses em JavaScript são baseados em 0
    return calculatedDate;
  }




}









