import { ChangeDetectorRef, Component } from '@angular/core';
import { ApiService } from '../services/contratos/contratos.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { format } from 'date-fns';
import { ExtraRequestComponent } from '../app/home/extra-request/extra-request.component';
import { UsuarioLogado } from '../autenticacao/usuario-logado.type';
import { AutenticacaoService } from '../autenticacao/autenticacao.service';
import { NgPluralCase } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cadastro-users',
  templateUrl: './cadastro-users.component.html',
  styleUrls: ['./cadastro-users.component.css']
})
export class CadastroUsersComponent {

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
  queryFlows: string = '';
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
  isCarrierEnabledCadastro: boolean = false;
  isCarrierEnabled: boolean = false;
  campoTocado: boolean = false;

  constructor(
    public dialog: MatDialog,
    private dynamodbService: ApiService,
    private autenticacaoService: AutenticacaoService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.upDate();
    this.getUserLogado();
    this.enableFieldscadastro();
    this.enableFields();
  }

  upDate() {
    this.getUsers();
    this.getCarriers();
  }

  onFieldTouched() {
    this.campoTocado = true;
  }

  enableFieldscadastro() {
    if (this.usuarioLogado.role === '0' || this.usuarioLogado.id == null) {
      this.isCarrierEnabledCadastro = true;
    }
  }
  
  enableFields() {
    if (this.usuarioLogado.role === '0') {
      this.isCarrierEnabled = true;
    }
  }

  editDialog(item: any): void {
    this.campoTocado = false;
    this.enableFields();
    this.enableFieldscadastro();
    //editDialog2(item: any): void {
    this.item.ID = item.ID;
    this.item.company = item.company;
    this.item.confirmacaoSenha = ""//item.confirmacaoSenha;
    this.item.flowsAccess = item.flowsAccess;
    this.item.nome = item.nome;
    this.item.role = item.role ? item.role : "1";
    this.item.senha = ""//item.senha;

    this.dialogOpen = true;
  }

  salvar() {
    if (
      this.item.ID &&
      this.item.senha &&
      this.item.confirmacaoSenha
    ) {
      if (this.item.senha != this.item.confirmacaoSenha) {
        alert("Senhas diferentes")
      } else {
        this.item = {
          "ID": this.item.ID,
          "company": this.item.company,
          "confirmacaoSenha": this.item.confirmacaoSenha,
          "flowsAccess": this.item.flowsAccess,
          "nome": this.item.nome,
          "role": this.item.role,
          "senha": this.item.senha
        }
        console.log("item para salvar")
        console.log(this.item)

        this.item.tableName = this.queryUsers
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
        this.dynamodbService.salvar(jsonArray, this.queryUsers, this.urlAtualiza).subscribe(response => {
        }, error => {
          console.log(error);
        });
        this.dialogOpen = false;
        setTimeout(() => {
          // this.getItemsFromDynamoDB();
          this.upDate();
        }, 200);
      }
    } else {
      this.campoTocado = true;
      alert("Formulario incompleto!")
    }
    this.upDate();
    this.router.navigateByUrl('/login');
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
              this.itemsCompletos = items.map(item => ({ ...item, checked: false }));
              this.usuarios = items.map(item => ({ ...item, checked: false }));
              if (this.usuarioLogado.role != '0') {
                this.usuarios = items.filter(item => item.ID == this.usuarioLogado.id)
              }
            } else {
              console.error('Invalid items data:', items);
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
          console.log('this.usuarios')
          console.log((this.usuarios))
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
    this.usuarios = this.items.filter(item => this.filtrarItem(item));
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
    console.log("user logado")
    console.log(this.usuarioLogado)
  }

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