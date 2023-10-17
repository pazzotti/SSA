import { Injectable } from '@angular/core';
import { DevagramApiService } from './devagram-api.service';
import { UsuarioPortal } from '../tipos/usuario-devagram.type';

@Injectable({
  providedIn: 'root'
})
export class DevagramUsuarioApiService extends DevagramApiService {
    public buscarDadosUsuarios(): Promise<UsuarioPortal> {
        return this.get('');
    }

    public pesquisarUsuarios(filtro: string): Promise<Array<UsuarioPortal>> {
      return this.get('pesquisa?filtro=' + filtro);
  }
}

