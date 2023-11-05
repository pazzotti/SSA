import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AtualizarComponent } from './atualizar/atualizar.component';
import { TelaUserComponent } from './tela-user/tela-user.component';
import { LocaisComponent } from './locais/locais.component';
import { AutenticacaoGuard } from './autenticacao/autenticacao.guard';
import { LoginComponent } from './login/login.component';
import { RelatorioComponent } from './relatorio/relatorio.component';
import { CadastroUsersComponent } from './cadastro-users/cadastro-users.component';
import { FollowComponent } from './follow/follow.component';
import { FilesUpdateComponent } from './files-update/files-update.component';
import { AnaliseComponent } from './analise/analise.component';
import { SaepComponent } from './saep/saep.component';
import { AprovacaoComponent } from './aprovacao/aprovacao.component';


const routes: Routes = [
  {path: '', canActivate: [AutenticacaoGuard], component: AnaliseComponent },
  {path:'login', component: LoginComponent },
  {path:'atualiza',component:AtualizarComponent},
  {path:'userScreen',component:TelaUserComponent},
  {path:'locais',component:LocaisComponent},
  { path: 'relatorio', canActivate: [AutenticacaoGuard], component: RelatorioComponent },
  {path: 'cadastro', component: CadastroUsersComponent },
  { path: 'filesupdate', canActivate: [AutenticacaoGuard], component: FilesUpdateComponent },
  { path: 'follow', canActivate: [AutenticacaoGuard], component: FollowComponent },
  { path: 'analise', canActivate: [AutenticacaoGuard], component: AnaliseComponent },
  { path: 'saep', canActivate: [AutenticacaoGuard], component: SaepComponent },
  { path: 'aprovacao', canActivate: [AutenticacaoGuard], component: AprovacaoComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),

  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }


//teste merge
