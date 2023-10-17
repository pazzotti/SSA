import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AutenticacaoService } from '../autenticacao/autenticacao.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {


  item: any = {};
  dialogOpen: boolean = true;
  isCarrierEnabled: boolean = false;
  campoTocado: boolean = false;
  formGroup!: FormGroup;


  constructor(
    private servicoAutenticacao: AutenticacaoService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.dialogOpen = true;
  }

  public async submit(): Promise<void> {
    try {
      await this.servicoAutenticacao.login(
        this.item
      )
    } catch (excecao: any) {
      const mensagemErro = excecao?.error?.erro || 'Erro ao realizar o login!'
      alert(mensagemErro)
    }
  }

  cadastrar() {
    this.router.navigate(['/cadastro']);
  }

}