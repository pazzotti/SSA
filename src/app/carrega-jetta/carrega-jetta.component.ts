import { Component, OnInit } from '@angular/core';
import { isToday } from 'date-fns';
import { debounceTime } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { CarregaJetta } from '../services/carrega_jetta/jetta.service';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { ApiService } from 'src/app/services/contratos/contratos.service';



@Component({
  selector: 'app-carrega-jetta',
  templateUrl: './carrega-jetta.component.html',
  styleUrls: ['./carrega-jetta.component.css']
})
export class CarregaJettaComponent implements OnInit {
  items: any[] = [];
  sortColumn: string = '';
  user: string = 'fernando.pazzotti@scania.com';
  senha: string = 'mt139a23';
  sortNumber: number = 0;
  sortDirection: number = 1;
  dataLoaded = true;
  filtroDataInicio: Date = new Date();
  filtroDataTermino: Date = new Date();
  itemsFiltrados: any[] = [];
  routes: any[] = [];
  searchText: string = '';
  items2: any[] = [ /* Seus itens aqui */];
  private searchTextSubject = new Subject<string>();
  private searchTextSubscription!: Subscription;
  urlConsulta: string = 'https://du0btsv8a3.execute-api.sa-east-1.amazonaws.com/dev22';
  urlAtualiza: string = 'https://uj88w4ga9i.execute-api.sa-east-1.amazonaws.com/dev12';
  query: string = 'Pipeline_Inbound';
  data: any;
  dataArray: { [key: string]: string; }[] = [];
  query2: string = 'Itens_Jetta';
  IDJetta: string = '';
  progressCounter: number = 0;


  constructor(private carregaJetta: CarregaJetta, public dialog: MatDialog, private datePipe: DatePipe, private dynamoDBService: ApiService,) {

  }

  ngOnInit() {
    this.getItemsFromJetta();
    this.geraJson();
  }

  ngOnDestroy() {
    this.searchTextSubscription.unsubscribe();
  }

  geraJson() {
    const trip_Json: {
      vehicle: {
        TransportType: string;
        Plate: string;
        cubage: string;
        weightLoaded: string;
        totalCost: string;
        TripSuppliers: { fornecedor: string; janela?: string }[];
        Destination: { destino: string; janelaDestino?: string ;passos:number}[];
        TotalDistance: string;
        Passos:number;
        Volumes:number;

      }[];
    } = {
      vehicle: [],
    };
    let destination = '';
    let janelaDestino = ""; // Variável para armazenar a janela
    let passos = 0; // Variável para armazenar a janela

    for (let i = 0; i < this.items.length; i++) {
      const currentItem = this.items[i];
      this.IDJetta = currentItem._id;
      for (let j = 0; j < currentItem.routes.length; j++) {
        const currentRoute = currentItem.routes[j];
        const volumes = currentRoute.result.itemsLoaded;
        passos = 0;
        for (let k = 0; k < currentRoute.result.transports.length; k++) {
          const currentTransport = currentRoute.result.transports[k];
          const totalDistance = currentRoute.result.route.distanceKm;
          const fornecedores: { fornecedor: string; janela?: string }[] = [];
          const destinos: { destino: string;  passos: number; janelaDestino?: string}[] = [];
          for (let o = 0; o < currentTransport.destinations.length; o++) {
            destination = currentTransport.destinations[o].name;
            for (let n = 0; n < currentRoute.result.route.schedule.length; n++) {
              if (currentRoute.result.route.schedule[n].name === destination) {
                janelaDestino = currentRoute.result.route.schedule[n].arrivalTime;
                break; // Interrompe o loop assim que encontrar a janela
              }

            }

            passos = passos + 1;

            destinos.push({ destino: destination, janelaDestino: janelaDestino, passos: passos });

          }
          for (let l = 0; l < currentTransport.waypoints.length; l++) {
            const waypoint = currentTransport.waypoints[l];
            let janela = ""; // Variável para armazenar a janela
            for (let m = 0; m < currentRoute.result.route.schedule.length; m++) {
              if (currentRoute.result.route.schedule[m].name === waypoint.name) {
                janela = currentRoute.result.route.schedule[m].arrivalTime;
                break; // Interrompe o loop assim que encontrar a janela
              }
            }
            passos = passos + 1;
            fornecedores.push({ fornecedor: waypoint.name, janela: janela });

          }
          trip_Json.vehicle.push({
            TransportType: currentTransport.descricao,
            Plate: currentTransport.plate,
            cubage: currentRoute.result.cubageLoaded,
            weightLoaded: currentRoute.result.weightLoaded,
            totalCost: currentTransport.totalCost,
            TripSuppliers: fornecedores,
            Destination: destinos,
            Passos:passos,
            TotalDistance: totalDistance,
            Volumes:volumes,
          });
        }
      }
    }

    const dataArray: { [key: string]: string; }[] = [];

    // Preenche a tabela com os dados
    trip_Json.vehicle.forEach((vehicle) => {
      const dataRow: { [key: string]: string } = {
        'Transport Type': vehicle.TransportType,
        'Plate': vehicle.Plate,
        'Cubage': vehicle.cubage,
        'Weight Loaded': vehicle.weightLoaded,
        'Total Cost': vehicle.totalCost,
        'Total Distance': vehicle.TotalDistance,
        'Passos':vehicle.Passos.toString(),
        'Volumes':vehicle.Volumes.toString(),
      };

      // Adiciona as informações dos fornecedores e janelas ao objeto da linha de dados
      vehicle.TripSuppliers.forEach((supplier, index) => {
        const fornecedorKey = `Fornecedor ${index + 1}`;
        const janelaKey = `Janela ${index + 1}`;

        dataRow[fornecedorKey] = supplier.fornecedor;
        dataRow[janelaKey] = supplier.janela ?? '';
      });
      vehicle.Destination.forEach((destinos, index) => {
        const destinoKey = `Destino ${index + 1}`;
        const janelaDestinoKey = `JanelaDestino ${index + 1}`;


        dataRow[destinoKey] = destinos.destino;
        dataRow[janelaDestinoKey] = destinos.janelaDestino ?? '';


      });

      dataArray.push(dataRow);
    });

    this.dataArray = dataArray;
  }

  formatarData(data: Date): string {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  salvar() {
    this.geraJson();

    const totalItems = this.dataArray.length;
    this.progressCounter = 0;

    // Função recursiva para salvar cada item de forma assíncrona
    const salvarItem = (index: number) => {
      if (index >= totalItems) {
        // Todos os itens foram salvos, pode encerrar o processo
        return;
      }

      const data = this.dataArray[index];
      data['tableName'] = this.query2;
      const finalDate = this.formatarData(new Date());
      data['ID'] = this.IDJetta + index;
      data['description'] = this.items[0].description;
      data['date'] = this.items[0].date;

      const itemsDataString = JSON.stringify(data);
      const modifiedString = itemsDataString.replace(/\\"/g, '"');
      const jsonObject = JSON.parse(modifiedString) as { [key: string]: string };
      const modifiedJsonString = JSON.stringify(jsonObject);
      const jsonObject2 = JSON.parse(modifiedJsonString) as { tableName: string, ID: string, acao: string };
      const jsonArray = [jsonObject2];

      this.dynamoDBService.salvar(jsonArray, this.query2, this.urlAtualiza).subscribe(
        response => {
          this.progressCounter++;
          // Chamar a função recursiva para salvar o próximo item
          salvarItem(index + 1);
        },
        error => {
          console.log(error);
          this.progressCounter++;
          // Chamar a função recursiva para salvar o próximo item
          salvarItem(index + 1);
        }
      );
    };

    // Iniciar o processo chamando a função para salvar o primeiro item
    salvarItem(0);
  }
  getProgressWidth(): string {
    const totalItems = this.dataArray.length;
    const processedItems = this.progressCounter;
    const progressPercentage = (processedItems / totalItems) * 100;
    return `${progressPercentage}%`;
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

  getItemsFromJetta(): void {
    const filtro = 'Scheduled';
    this.carregaJetta.postCredentials(this.user, this.senha).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          try {
            const items = response.body.data;
            if (Array.isArray(items)) {
              this.items = items.map(item => ({ ...item, checked: false }));
              this.routes = items.map(item => item.routes); // Obtém os valores da chave 'routes' e atribui a 'routes'
              console.log(this.routes);
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



}









