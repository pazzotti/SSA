import { Inject, Injectable } from '@angular/core';
import { DevagramApiService } from '../shared/servicos-login/devagram-api.service';
import { CredenciaisPortal } from './credenciaisPortal.type';
import { RespostaLoginPortal } from './resposta-login-devagram.type';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DevagramUsuarioApiService } from '../shared/servicos-login/devagram-usuario-api.service';
import { UsuarioLogado } from './usuario-logado.type';

@Injectable({
  providedIn: 'root'
})
export class AutenticacaoService extends DevagramApiService{

  constructor(
    protected _http: HttpClient,
    @Inject('LOGIN_URL_API') private _loginUrlApi:string,
    private router: Router,
    private usuarioApiService: DevagramUsuarioApiService
  ) {
    super(_http, _loginUrlApi)
  }

  async login(credenciais: CredenciaisPortal): Promise<void> {
    const respostaLogin: RespostaLoginPortal = await this.post('', credenciais)
    console.log(respostaLogin)
    if (!respostaLogin.auth_token) {
      throw new Error('Login invalido!')
    }
    console.log(respostaLogin)
    localStorage.setItem("token", respostaLogin.auth_token)
    localStorage.setItem("nome", respostaLogin.nome)
    localStorage.setItem("email", respostaLogin.Id)
    localStorage.setItem("role", respostaLogin.role)
    localStorage.setItem("flows", respostaLogin.flowsAccess)
    localStorage.setItem("company", respostaLogin.company)

    // //pegar dados complementares do usuario logado
    // const dadosUsuario = await this.usuarioApiService.buscarDadosUsuarios();
    // localStorage.setItem("id", dadosUsuario._id);

    this.router.navigateByUrl('/');
  }

  estaLogado(): boolean {
    return localStorage.getItem('token') !== null;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('nome');
    localStorage.removeItem('email');
    localStorage.removeItem('id');
    localStorage.removeItem('role');
    localStorage.removeItem('flows');
    localStorage.removeItem('company');
    //redirecionar login
    this.router.navigateByUrl('/login');
  }


  //devolver detalhes do usuario logado
  obterUsuarioLogado(): UsuarioLogado {
    if(!this.estaLogado){
      console.log("sem user logado")
    }

    return {
      id: localStorage.getItem('email'),
      nome: localStorage.getItem('nome'),
      role: localStorage.getItem('role'),
      flows: localStorage.getItem('flows'),
      company: localStorage.getItem('company'),
    } as UsuarioLogado

  }
}
