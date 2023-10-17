import { HeaderModule } from './header.module';

import { AppModule } from '../app.module';

import { Component, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { AutenticacaoService } from '../autenticacao/autenticacao.service';




@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponentes {
  @ViewChild('interplantasButton', { static: true }) interplantasButton!: ElementRef;
  @ViewChild('interplantasMenu', { static: true }) interplantasMenu!: ElementRef;



  opcoes: string[] = ['Opção 1', 'Opção 2', 'Opção 3'];
  opcaoSelecionada!: string;
  selectedOption: string = "";
  alinharDireita = true;
  showDropdown = false;

  isConfigMenuOpen: boolean = false;

  isInterplantasMenuOpen = false;
  dropdownMenuStyle: any;



  constructor(
    private servicoAutenticacao: AutenticacaoService,
    private renderer: Renderer2

  ) {}

  public async logout(): Promise<void> {
    try {
      await this.servicoAutenticacao.logout()
    } catch (excecao: any) {
      const mensagemErro = excecao?.error?.erro || 'Erro ao realizar o logout!'
      alert(mensagemErro)
    }
  }


  toggleInterplantasMenu() {
    this.isInterplantasMenuOpen = !this.isInterplantasMenuOpen;
    if (this.isInterplantasMenuOpen) {
      this.positionDropdownMenu();
    }
  }

  positionDropdownMenu() {
    const buttonElement = this.interplantasButton.nativeElement;
    const menuElement = this.interplantasMenu.nativeElement;
    this.dropdownMenuStyle = {
      position: 'absolute',
      top: `${buttonElement.offsetTop + buttonElement.offsetHeight}px`,
      left: `${buttonElement.offsetLeft}px`,
    };

  }


  toggleConfigMenu() {
    this.isConfigMenuOpen = !this.isConfigMenuOpen;
  }




  ngOnInit() {
    this.changeCursorStyle(false);
  }

  changeCursorStyle(isMenuOpen: boolean) {
    const dropdownButton = document.getElementById('dropdownMenuButton');
    if (dropdownButton) {
      this.renderer.setStyle(dropdownButton, 'cursor', isMenuOpen ? 'default' : 'pointer');
    }
  }


}
