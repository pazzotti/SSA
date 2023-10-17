import { AbstractControl, AsyncValidatorFn, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { confirmacaoSenha } from '../shared/validadores/confirmacaoSenha.validator';
import { CadastroService } from './cadastro.service';
import { AutenticacaoService } from '../autenticacao/autenticacao.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChangeDetectorRef, Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/contratos/contratos.service';
import { format } from 'date-fns';
import { Cadastro } from './cadastro.type';
import { Observable } from 'rxjs';
import { UsuarioLogado } from '../autenticacao/usuario-logado.type';
import { Router } from '@angular/router';
import { UsuarioPortal } from '../shared/tipos/usuario-devagram.type';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent {

  urlAtualiza: string = 'https://uj88w4ga9i.execute-api.sa-east-1.amazonaws.com/dev12';
  urlConsulta: string = 'https://4i6nb2mb07.execute-api.sa-east-1.amazonaws.com/dev13';
  queryOrigin: string = 'Locais_Origem_Inbound';
  queryDestiny: string = 'Locais_Destino_Inbound';
  tableName: string = 'usersPortal';
  form!: FormGroup;
  formattedDate: string = '';
  items!: Cadastro;
  itemsOrigin: any[] | undefined;
  dadosForm!: Cadastro;
  roles = [
    { value: 0, name: "Admin", selected: false },
    { value: 1, name: "User", selected: true },
    { value: 2, name: "Transport Coordinator", selected: false },
    { value: 3, name: "Carrier User", selected: false },
    { value: 4, name: "Supplier User", selected: false },
  ]
  selectedRole = 1;
  usuarios: any[] = [];
  usuarioLogado!: UsuarioLogado;

  constructor(
    private router: Router,
    private servicoCadastro: CadastroService,
    private autenticacaoService: AutenticacaoService,
    private formBuilder: FormBuilder,
    private dynamodbService: ApiService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.upDate();
  }

  upDate() {
    this.createForm(new Cadastro())
    this.getItemsFromExtraReq();
    this.getUserLogado();
    this.enableFields();
  }

  createForm(cadastro: Cadastro) {
    this.form = this.formBuilder.group({
      nome: [cadastro.nome, Validators.required],
      ID: [{ value: cadastro.ID, disabled: true }, [Validators.required, Validators.email]],
      senha: [cadastro.senha, [Validators.required, Validators.minLength(4)]],
      confirmacaoSenha: [cadastro.confirmacaoSenha, [Validators.required, confirmacaoSenha()]],
      role: [cadastro.role],
      flowsAccess: [cadastro.flowsAccess],
      company: [cadastro.company],
    })
  }

  checkValid(): boolean {
    return this.form.valid
  }

  async salvar() {
    const isNewIDIncluded = this.usuarios.some(user => user.ID === this.form.get('ID')?.value);
    console.log(isNewIDIncluded)
    if (isNewIDIncluded) {
      console.log("ja cadastrado !!!")
      if (this.form && !this.form?.get('ID')?.hasError('required')) {
        // console.log("passou a segunda condicao")
        // const currentDate = new Date();
        // this.formattedDate = format(currentDate, 'ddMMyyyyHHmmss');
        this.dadosForm = {
          nome: this.form.get('nome')?.value ? this.form.get('nome')?.value : this.usuarios.find(user => user.ID === this.form.get('ID')?.value).nome,
          ID: this.form.get('ID')?.value,
          senha: this.form.get('senha')?.value ? this.form.get('senha')?.value : this.usuarios.find(user => user.ID === this.form.get('ID')?.value).senha,
          confirmacaoSenha: this.form.get('confirmacaoSenha')?.value ? this.form.get('confirmacaoSenha')?.value : this.usuarios.find(user => user.ID === this.form.get('ID')?.value).confirmacaoSenha,
          role: this.form.get('role')?.value ? this.form.get('role')?.value : this.usuarios.find(user => user.ID === this.form.get('ID')?.value).role,
          flowsAccess: this.form.get('flowsAccess')?.value ? this.form.get('flowsAccess')?.value : this.usuarios.find(user => user.ID === this.form.get('ID')?.value).flowsAccess,
          company: this.form.get('company')?.value ? this.form.get('company')?.value : this.usuarios.find(user => user.ID === this.form.get('ID')?.value).company,
          tableName: this.tableName
        }
      }
    } else {
      console.log("NAO cadastrado !!!")
      if (this.form && this.form.valid) {
        console.log("NAO cadastrado !!!")
        this.dadosForm = {
          nome: this.form.get('nome')?.value,
          ID: this.form.get('ID')?.value,
          senha: this.form.get('senha')?.value,
          confirmacaoSenha: this.form.get('confirmacaoSenha')?.value,
          role: this.form.get('role')?.value ? this.form.get('role')?.value : '1',
          flowsAccess: this.form.get('flowsAccess')?.value,
          company: this.form.get('company')?.value,
          tableName: this.tableName
        }
      }
    }
    console.log("passou as condicos para salvar")
    console.log(this.dadosForm)

    // console.log(this.tableName)
    if (this.dadosForm) {
      const itemsDataString = JSON.stringify(this.dadosForm); // Acessa a string desejada
      const modifiedString = itemsDataString.replace(/\\"/g, '"'); // Realiza a substituição na string
      const jsonObject = JSON.parse(modifiedString) as { [key: string]: string };
      const modifiedJsonString = JSON.stringify(jsonObject);
      const jsonObject2 = JSON.parse(modifiedJsonString) as { tableName: string, ID: string, acao: string };
      const jsonArray = [jsonObject2];
      this.dynamodbService.salvar(jsonArray, this.tableName, this.urlAtualiza).subscribe({
        next: response => {
          console.log("success")
          // console.log(response)
          this.dadosForm = new Cadastro();
          this.form.reset()
          // this.getItemsFromExtraReq(); // Atualiza os dados após o salvamento
        }, error: error => {
          console.log("error")
          console.log(error);
        }
      });
      // if (isNewIDIncluded) {
      this.router.navigateByUrl('/login');
      // }
    } else {
      alert("Verifique o preenchimento do formulario.")
    }

  }

  cancel(): void {
    this.form.reset()
    this.router.navigateByUrl('/');
  }

  getUserLogado() {
    console.log("logado")
    // console.log(this.autenticacaoService?.obterUsuarioLogado())
    this.usuarioLogado = this.autenticacaoService.obterUsuarioLogado()
    console.log(this.usuarioLogado)
  }

  enableFields() {
    if (this.usuarioLogado.role === '3' || this.usuarioLogado.role === '0') {
      this.form.get('ID')?.enable();
      // this.form.get('vehicleType')?.enable();
    } else if (this.usuarioLogado.role == null) {
      this.form.get('ID')?.enable();
    } else {
      this.form.get('ID')?.setValue(this.usuarioLogado.id)
      // this.form.get('ID')?.enable();
    }
  }


  async getItemsFromExtraReq(): Promise<void> {
    const filtro = 'all';
    (await this.dynamodbService.getItems(this.tableName, this.urlConsulta, filtro)).subscribe(
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
}