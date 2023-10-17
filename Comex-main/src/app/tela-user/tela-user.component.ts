import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/contratos/contratos.service';
import { TelaUserModule } from './tela-user.module';
import { CommonModule } from '@angular/common'
import { isToday } from 'date-fns';
import { debounceTime } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { AppModule } from '../app.module';



@Component({
  selector: 'app-tela-user',
  templateUrl: './tela-user.component.html',
  styleUrls: ['./tela-user.component.css']
})
export class TelaUserComponent implements OnInit {
  items: any[] = [];
  sortColumn: string = '';
  sortNumber: number = 0;
  sortDirection: number = 1;
  dataLoaded = true;
  filtroDataInicio: Date = new Date();
  filtroDataTermino: Date = new Date();
  searchText: string = '';
  items2: any[] = [ /* Seus itens aqui */];
  private searchTextSubject = new Subject<string>();
  private searchTextSubscription!: Subscription;
  somaDemurrage: number = 0;
  SomaTrip: number = 0;
  SomaHandling: number = 0;
  hideCheckColumn: boolean = true;
  itemsFiltrados: any[] = [];
  todosSelecionados: boolean = false;
  urlAtualiza: string = 'https://uj88w4ga9i.execute-api.sa-east-1.amazonaws.com/dev12';
  urlConsulta: string = 'https://4i6nb2mb07.execute-api.sa-east-1.amazonaws.com/dev13';
  query: string = 'Pipeline_Inbound';


  constructor(private dynamoDBService: ApiService) { }

  ngOnInit() {

    this.searchTextSubscription = this.searchTextSubject.pipe(debounceTime(300)).subscribe(() => {
      this.filterItems();
    });
    this.getItemsFromDynamoDB();

  }

  selecionarTodos() {
    this.todosSelecionados = !this.todosSelecionados;
    for (let item of this.itemsFiltrados) {
      item.checked = this.todosSelecionados;
    }

  }

  selecionarItem(item: any): void {
    // Define o estado de checked apenas para o item selecionado
    item.checked = true;
  }

  ngOnDestroy() {
    this.searchTextSubscription.unsubscribe();
  }

  converterData(stringData: string): string {
    const partes = stringData.split('/');
    const dia = partes[0];
    const mes = partes[1];
    const ano = partes[2];

    return `${ano}-${mes}-${dia}`;
  }

  toggleColumn() {
    this.hideCheckColumn = !this.hideCheckColumn;
  }



  calculateTotalDemurrage(): number {
    let totalDemurrage = 0;
    this.somaDemurrage = 0;
    this.SomaHandling = 0;
    this.SomaTrip = 0;

    for (const item of this.items) {
      if (item.checked) {
        this.somaDemurrage += Number(item.Demurrage);
        this.SomaTrip += Number(item.TripCost);
        this.SomaHandling += Number(item.Handling);
      }
    }

    return totalDemurrage;
  }

  toggleCheckedStatus(index: number, item: any): void {
    item.checked = true;
  }

  isItemChecked(index: number): boolean {
    return this.items[index].checked;
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

  getItemsFromDynamoDB(): void {
    const filtro = 'all';
    this.dynamoDBService.getItems(this.query, this.urlConsulta, filtro).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          try {
            const items = JSON.parse(response.body);
            if (Array.isArray(items)) {
              this.items = items.map(item => ({ ...item, checked: false }));
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
    this.itemsFiltrados.sort((a: { [x: string]: any; }, b: { [x: string]: any; }) => {
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
    this.itemsFiltrados.sort((a: { [x: string]: any; }, b: { [x: string]: any; }) => {
      const valueA = parseFloat(a[this.sortColumn]);
      const valueB = parseFloat(b[this.sortColumn]);

      if (valueA < valueB) {
        return -1 * this.sortDirection;
      } else if (valueA > valueB) {
        return 1 * this.sortDirection;
      } else {
        return 0;
      }
    });
  }
  sortByDate(column: string) {
    if (this.sortColumn === column) {
      // Inverte a direção da ordenação
      this.sortDirection *= -1;
    } else {
      // Define a nova coluna de ordenação e redefine a direção da ordenação
      this.sortColumn = column;
      this.sortDirection = 1;
    }

    // Sort the data array based on the selected column and direction
    this.itemsFiltrados.sort((a: { [x: string]: any; }, b: { [x: string]: any; }) => {
      const dateA = this.parseDate(a[this.sortColumn]);
      const dateB = this.parseDate(b[this.sortColumn]);

      if (dateA < dateB) {
        return -1 * this.sortDirection;
      } else if (dateA > dateB) {
        return 1 * this.sortDirection;
      } else {
        return 0;
      }
    });
  }

  parseDate(dateString: string): Date {
    const parts = dateString.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }


  filterItems() {
    const searchText = this.searchText.toLowerCase();
    this.calculateTotalDemurrage();
    this.itemsFiltrados = this.items.filter(item => {
      const process = item.Process ? item.Process.toLowerCase() : '';
      const invoice = item.Invoice ? item.Invoice.toLowerCase() : '';
      const container = item.Container ? item.Container.toLowerCase() : '';
      const step = item.Step ? item.Step.toLowerCase() : '';
      const vessel = item.Vessel ? item.Vessel.toLowerCase() : '';
      const liner = item.Liner ? item.Liner.toLowerCase() : '';
      const channel = item.Channel ? item.Channel.toLowerCase() : '';

      // Implemente a lógica de filtragem com base no seu HTML
      // Por exemplo, se seus itens tiverem uma propriedade 'Process':
      return process.includes(searchText)
        || invoice.includes(searchText)
        || container.includes(searchText)
        || step.includes(searchText)
        || vessel.includes(searchText)
        || liner.includes(searchText)
        || channel.includes(searchText);
    });
  }

  onSearchTextChanged() {
    this.searchTextSubject.next(this.searchText);
  }


}









