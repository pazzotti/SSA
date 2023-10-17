import { Injectable } from '@angular/core';
import { Cadastro } from './cadastro.type';
import { DevagramApiService } from '../shared/servicos-login/devagram-api.service';
import { RespostaApiDevagram } from '../shared/tipos/resposta-api-devagram.type';

@Injectable({
  providedIn: 'root'
})
export class CadastroService extends DevagramApiService {
  cadastrar(dadosCadastro: Cadastro): Promise<RespostaApiDevagram> {
    console.log(dadosCadastro)
    return this.post('cadastro', dadosCadastro)
  }
}
