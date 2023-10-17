import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AtualizarComponent } from './atualizar/atualizar.component';
import { TelaUserComponent } from './tela-user/tela-user.component';
import { ContratoTransportadoraComponent } from './contrato-transportadora/contrato-transportadora.component';
import { FornecedoresComponent } from './fornecedores/fornecedores.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CarregaJettaComponent } from './carrega-jetta/carrega-jetta.component';
import { InterplantasComponent } from './interplantas/interplantas.component';
import { TimeTableComponent } from './timetable/timetable.component';
import { LocaisComponent } from './locais/locais.component';
import { ExtraFreightComponent } from './extra-freight/extra-freight.component';
import { AutenticacaoGuard } from './autenticacao/autenticacao.guard';
import { LoginComponent } from './login/login.component';
import { RelatorioComponent } from './relatorio/relatorio.component';
import { CadastroCarriersComponent } from './cadastro-carriers/cadastro-carriers.component';
import { CadastroContratosComponent } from './cadastro-contratos/cadastro-contratos.component';
import { CadastroUsersComponent } from './cadastro-users/cadastro-users.component';
import { FollowComponent } from './follow/follow.component';
import { FilesUpdateComponent } from './files-update/files-update.component';
import { AnaliseComponent } from './analise/analise.component';


const routes: Routes = [
  {path: '', canActivate: [AutenticacaoGuard], component: AnaliseComponent },
  {path:'login', component: LoginComponent },
  {path:'atualiza',component:AtualizarComponent},
  {path:'userScreen',component:TelaUserComponent},
  {path:'contrato_Transportadora',component:ContratoTransportadoraComponent},
  {path:'fornecedores',component:FornecedoresComponent},
  {path:'carriers', component: CadastroCarriersComponent},
  {path:'dashboard',component:DashboardComponent},
  {path:'jetta',component:CarregaJettaComponent},
  {path:'interplantas',component:InterplantasComponent},
  {path:'time',component:TimeTableComponent},
  {path:'locais',component:LocaisComponent},
  { path: 'relatorio', canActivate: [AutenticacaoGuard], component: RelatorioComponent },
  {path: 'extra', canActivate: [AutenticacaoGuard], component: ExtraFreightComponent },
  {path: 'cadastro', component: CadastroUsersComponent },
  { path: 'contratos', component: CadastroContratosComponent },
  { path: 'filesupdate', canActivate: [AutenticacaoGuard], component: FilesUpdateComponent },
  { path: 'follow', canActivate: [AutenticacaoGuard], component: FollowComponent },
  { path: 'analise', canActivate: [AutenticacaoGuard], component: AnaliseComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),

  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }


//teste merge
