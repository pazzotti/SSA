import { ChangeDetectorRef, Component } from '@angular/core';
import { ApiService } from '../services/contratos/contratos.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { format } from 'date-fns';
import { ExtraRequestComponent } from '../app/home/extra-request/extra-request.component';
import { UsuarioLogado } from '../autenticacao/usuario-logado.type';
import { AutenticacaoService } from '../autenticacao/autenticacao.service';


@Component({
  selector: 'app-cadastro-contratos',
  templateUrl: './cadastro-contratos.component.html',
  styleUrls: ['./cadastro-contratos.component.css']
})
  
export class CadastroContratosComponent {

  item: any = {};
  items: any[] = [];
  usuarios: any[] = [];
  carriers: any[] = [];
  contracts: any[] = [];
  urlAtualiza: string = 'https://uj88w4ga9i.execute-api.sa-east-1.amazonaws.com/dev12';
  urlConsulta: string = 'https://4i6nb2mb07.execute-api.sa-east-1.amazonaws.com/dev13';
  urlNotify: string = 'https://29o5gcw81i.execute-api.sa-east-1.amazonaws.com/v1';
  query: string = 'extraFreight';
  queryUsers: string = 'usersPortal';
  queryCarriers: string = 'Carriers';
  querylocation: string = 'Fornecedores_Karrara_Transport';
  queryContracts: string = 'contratos_terrestre';
  comentario: string = "";
  $even: any;
  $odd: any;
  dataSource: any;
  itemsCarrier: any[] = [];
  itemsCompletos: any[] = [];
  searchString: string = '';
  itemsOrigin: any[] | undefined;
  placesOrigin: any[] | undefined;
  usuarioLogado!: UsuarioLogado;
  currentDate = new Date();
  formattedDate = format(this.currentDate, 'ddMMyyyyHHmmss');
  dialogOpen!: boolean;
  formBuilder: any;
  formGroup: any;
  selectedValue = 0;
  contactCarrier: string = '';
  contactTrasport: string = '+5511985507468';
  status: string = 'Requested';
  dataNotify: any;
  isCarrierEnabled: boolean = false;
  campoTocado: boolean = false;
  typesVehicles: string[] = [
    'Picape(fiorino) Aberta 500Kg - C1,60 x L1,00 x A1,20',
    'Picape(fiorino) Fechada - C1,60 x L1,00 x A1,20',
    'Picape(fiorino) Refrigerada - C1,60 x L1,00 x A1,20',
    'Kombi 800kg - C1,60 x L1,00 x A1,20',
    'VAN Furgão 1,5t - C3,20 x L1,80 x A1,80',
    'HR Bongo 1,5t - C2,80 x L1,80 x A1,80',
    'HR Bongo Sider 1,5t - C2,80 x L1,80 x A1,80',
    'HR Bongo Aberto 1,5t - C2,80 x L1,80 x A1,80',
    'HR Bongo Refrigerado 1,5t - C2,80 x L1,80 x A1,80',
    'VUC - 3/4 3t - C4,80 x L2,20 x A2,20',
    'VUC - 3/4 Aberto 3t - C4,80 x L2,20 x A2,20',
    'VUC - 3/4 Sider 3t - C4,80 x L2,20 x A2,20',
    'VUC - 3/4 Refrigerado 3t - C4,80 x L2,20 x A2,20',
    'Toco Aberto 6ton - C6,50 x L2,40 x A2,60',
    'Toco Sider 6ton - C6,50 x L2,40 x A2,60',
    'Toco 6ton Refrigerado - C6,50 x L2,40 x A2,60',
    'Truck Aberto 12ton - C8,50 x L2,40 x A2,70',
    'Truck Sider 12ton - C8,50 x L2,40 x A2,70',
    //'Truck Refrigerado 12ton - C8,50 x L2,40 x A2,70',
    'Carreta 25ton Aberta - C14,80 x L2,50 x A2,70',
    'Carreta 25ton Sider - C14,80 x L2,50 x A2,70',
    //'Carreta 25ton Baú - C14,80 x L2,50 x A2,70',
    'Carreta 27ton Aberta - C14,80 x L2,50 x A2,70',
    'Carreta 27ton Sider - C14,80 x L2,50 x A2,70',
    //'Carreta 27ton Baú - C14,80 x L2,50 x A2,70',
    'Truck Munk',
    'Guincho Prancha'
  ];

  constructor(
    public dialog: MatDialog,
    private dynamodbService: ApiService,
    private autenticacaoService: AutenticacaoService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.upDate()
    this.getUserLogado()
    this.getUsers()
  }

  upDate() {
    // this.getItemsFromDynamoDB();
    // this.getItemsFromOrigin();
    this.getContracts();
    this.getCarriers();
  }

  onFieldTouched() {
    this.campoTocado = true;
  }

  enableFields() {
    if (this.usuarioLogado.role === '3' || this.usuarioLogado.role === '0') {
      this.isCarrierEnabled = true;
    }
  }

  editDialog(item: any): void {
    this.campoTocado = false;
    this.enableFields();
    //editDialog2(item: any): void {
    this.item.ID = item.ID ? item.ID : this.formattedDate
    this.item.carrier = item.carrier;
    this.item.fixedCost = item.fixedCost;
    this.item.flow = item.flow;
    this.item.modality = item.modality;
    this.item.region = item.region;
    this.item.validity = item.validity;
    this.item.variableCost = item.variableCost;
    this.item.vehicleType = item.vehicleType;

    this.dialogOpen = true;
  }

  salvar() {
    if (
      this.item.carrier &&
      this.item.fixedCost &&
      this.item.variableCost &&
      this.item.validity &&
      this.item.vehicleType &&
      this.item.flow
    ) {
      this.item = {
        "ID": this.item.ID,
        "carrier": this.item.carrier,
        "fixedCost": this.item.fixedCost,
        "flow": this.item.flow,
        "modality": this.item.modality,
        "region": this.item.region,
        "validity": this.item.validity,
        "variableCost": this.item.variableCost,
        "vehicleType": this.item.vehicleType,

      }
      console.log(this.item)
      
      this.item.tableName = this.queryContracts
      // Remover as barras invertidas escapadas
      const itemsDataString = JSON.stringify(this.item); // Acessa a string desejada
      const modifiedString = itemsDataString.replace(/\\"/g, '"'); // Realiza a substituição na string
      // Converter a string JSON para um objeto JavaScript
      const jsonObject = JSON.parse(modifiedString) as { [key: string]: string };
      // Converter o objeto JavaScript de volta para uma string JSON
      const modifiedJsonString = JSON.stringify(jsonObject);
      // console.log(modifiedJsonString);
      // Converter a string JSON para um objeto JavaScript
      const jsonObject2 = JSON.parse(modifiedJsonString) as { tableName: string, ID: string, acao: string };
      // Criar um array contendo o objeto
      const jsonArray = [jsonObject2];
      this.dynamodbService.salvar(jsonArray, this.queryContracts, this.urlAtualiza).subscribe(response => {
      }, error => {
        console.log(error);
      });
      this.dialogOpen = false;
      setTimeout(() => {
        // this.getItemsFromDynamoDB();
        this.upDate();
      }, 200);
    } else {
      this.campoTocado = true;
      alert("Formulario incompleto!")
    }
  }

  async getCarriers(): Promise<void> {
    const filtroUser = 'all';
    (await this.dynamodbService.getItems(this.queryCarriers, this.urlConsulta, filtroUser)).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          try {
            const items = JSON.parse(response.body);
            if (Array.isArray(items)) {
              this.carriers = items.map(item => ({ ...item, checked: false }));
            } else {
              console.error('Invalid items data:', items);
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
          // console.log('this.carriers')
          // console.log((this.carriers))
        } else {
          console.error('Invalid response:', response);
        }
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  async getUsers(): Promise<void> {
    const filtroUser = 'all';
    (await this.dynamodbService.getItems(this.queryUsers, this.urlConsulta, filtroUser)).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          try {
            const items = JSON.parse(response.body);
            if (Array.isArray(items)) {
              this.usuarios = items.map(item => ({ ...item, checked: false }));
            } else {
              console.error('Invalid items data:', items);
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
          // console.log('this.usuarios')
          // console.log((this.usuarios))
        } else {
          console.error('Invalid response:', response);
        }
      },
      (error: any) => {
        console.error(error);
      }
    );
  }
  
  async getContracts(): Promise<void> {
    const filtroUser = 'all';
    (await this.dynamodbService.getItems(this.queryContracts, this.urlConsulta, filtroUser)).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          try {
            const items = JSON.parse(response.body);
            if (Array.isArray(items)) {
              this.itemsCompletos = items.map(item => ({ ...item, checked: false }));
              this.contracts = items.map(item => ({ ...item, checked: false }));
            } else {
              console.error('Invalid items data:', items);
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
          console.log('this.contracts')
          console.log((this.contracts))
        } else {
          console.error('Invalid response:', response);
        }
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  cancel(): void {
    this.campoTocado = false;
    this.dialogOpen = false;
  }

  aplicarFiltro() {
    this.items = this.itemsCompletos;
    this.contracts = this.items.filter(item => this.filtrarItem(item));
  }

  //adicionado filtro para todos os campos
  filtrarItem(item: any): boolean {
    if (!this.searchString) {
      // Se o filtro estiver vazio, retorne verdadeiro para exibir todos os itens
      return true;
    }
    const lowerCaseFilter = this.searchString.toLowerCase();
    for (const prop in item) {
      if (item.hasOwnProperty(prop) && typeof item[prop] === 'string') {
        const lowerCaseProp = item[prop].toLowerCase();
        if (lowerCaseProp.includes(lowerCaseFilter)) {
          return true;
        }
      }
    }
    // Se nenhuma propriedade corresponder ao filtro, retornar falso para não exibir o item
    return false;
  }

  getUserLogado() {
    // console.log("logado")
    // console.log(this.autenticacaoService?.obterUsuarioLogado())
    this.usuarioLogado = this.autenticacaoService.obterUsuarioLogado()
    // console.log(this.usuarioLogado)
  }

  // openDialog(item: Array<any>, url: string, table: string): void {
  //   const dialogRef: MatDialogRef<ExtraRequestComponent> = this.dialog.open(ExtraRequestComponent, {
  //     data: {
  //       itemsData: [],
  //       url: url,
  //       query: table
  //     },
  //     height: '730px',
  //     minWidth: '750px',
  //     position: {
  //       top: '10vh',
  //       left: '30vw'
  //     },
  //   });
  //   dialogRef.afterClosed().subscribe(() => {
  //     // if (result) {
  //     setTimeout(() => {
  //       this.getItemsFromDynamoDB();
  //     }, 800); // Ajuste o tempo de atraso conforme necessário
  //   }
  //     // console.log('The dialog was closed');
  //     // }
  //   );
  // }

  // getItemsFromOrigin(): void {
  //   const filtro = '';
  //   this.dynamodbService.getItems(this.querylocation, this.urlConsulta, filtro).subscribe(
  //     (response: any) => {
  //       if (response.statusCode === 200) {
  //         try {
  //           const items = JSON.parse(response.body);
  //           if (Array.isArray(items)) {
  //             this.itemsOrigin = items.map(item => ({ ...item, checked: false }));
  //             // Adiciona a chave 'checked' a cada item, com valor inicial como false
  //             this.placesOrigin = this.itemsOrigin.map(item => item.local);
  //             // console.log(this.itemsOrigin)
  //           } else {
  //             console.error('Invalid items data:', items);
  //           }
  //         } catch (error) {
  //           console.error('Error parsing JSON:', error);
  //         }
  //       } else {
  //         console.error('Invalid response:', response);
  //       }
  //     },
  //     (error: any) => {
  //       console.error(error);
  //     }
  //   );
  // }

  // getItemsFromDynamoDB(): void {
  //   const filtro = 'all';
  //   this.dynamodbService.getItems(this.query, this.urlConsulta, filtro).subscribe(
  //     (response: any) => {
  //       // console.log(response)
  //       if (response.statusCode === 200) {
  //         try {
  //           const items = JSON.parse(response.body);
  //           if (Array.isArray(items)) {
  //             this.items = items.map(item => ({ ...item, checked: false }));
  //             this.itemsCompletos = items.map(item => ({ ...item, checked: false }));
  //             this.itemsCarrier = items.filter(item => item.carrier == this.usuarioLogado.company)
  //             if (this.usuarioLogado.role == '3') {
  //               this.items = items.filter(item => item.carrier == this.usuarioLogado.company)
  //             }
  //             // console.log(this.items)
  //             // console.log(this.itemsCarrier)
  //             // Adiciona a chave 'checked' a cada item, com valor inicial como false
  //             // Forçar detecção de alterações após atualizar os dados
  //             this.cdr.detectChanges();
  //           } else {
  //             console.error('Invalid items data:', items);
  //           }
  //         } catch (error) {
  //           console.error('Error parsing JSON:', error);
  //         }
  //       } else {
  //         console.error('Invalid response:', response);
  //       }
  //     },
  //     (error: any) => {
  //       console.error(error);
  //     }
  //   );
  // }

  deleteItem(ID: string, urlDeleta: string, query: string): void {
    this.dynamodbService.deleteItem(ID, this.urlAtualiza, this.query).subscribe(
      response => {
        setTimeout(() => {
          // this.getItemsFromDynamoDB();
          this.upDate();
        }, 400); // Ajuste o tempo de atraso conforme necessário
      },
      error => {
        // Lógica para lidar com erros durante a deleção do item
      }
    );
  }

}