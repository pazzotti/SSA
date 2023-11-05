import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderModule } from './header/header.module';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AtualizarComponent } from './atualizar/atualizar.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HighchartsChartModule } from 'highcharts-angular';
import { CommonModule, DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FeatherModule } from 'angular-feather';
import { Camera, ZapOff, Zap, Edit, Delete, PlusCircle, Settings, MessageCircle, AlertTriangle, Meh, ArrowDown, ArrowUp, Anchor, ChevronUp, ChevronDown } from 'angular-feather/icons';
import { LocaisComponent } from './locais/locais.component';
import { MatInputModule } from '@angular/material/input';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { MatIconModule } from '@angular/material/icon';
import { ClarityModule } from '@clr/angular';
import { LoginComponent } from './login/login.component';
import { SharedModule } from './shared/shared.module';
import { CadastroComponent } from './cadastro/cadastro.component';
import { CadastroUsersComponent } from './cadastro-users/cadastro-users.component';
import { CustomDatePipe } from './relatorio/custom-data-pipe';
import { RelatorioComponent } from './relatorio/relatorio.component';
import { FilesUpdateComponent } from './files-update/files-update.component';
import { FollowComponent } from './follow/follow.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { CurrencyFormatPipe } from './follow/CurrencyPipe';
import { AnaliseComponent } from './analise/analise.component';
import { SaepComponent } from './saep/saep.component';
import { AprovacaoComponent } from './aprovacao/aprovacao.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


const icons = {
  Camera,
  ZapOff,
  Zap,
  Edit,
  Delete,
  PlusCircle,
  Settings,
  MessageCircle,
  AlertTriangle,
  ArrowUp,
  Anchor,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  Meh
};


@NgModule({
  declarations: [
    CurrencyFormatPipe,
    AppComponent,
    AtualizarComponent,
    LoginComponent,
    CadastroComponent,
    LocaisComponent,
    RelatorioComponent,
    CadastroUsersComponent,
    CustomDatePipe,
    FilesUpdateComponent,
    FollowComponent,
    AnaliseComponent,
    SaepComponent,
    AprovacaoComponent


  ],
  imports: [
    MatTableModule,
    MatSortModule,
    AppRoutingModule,
    MatIconModule,
    CommonModule,
    MatProgressSpinnerModule,
    SharedModule,
    ReactiveFormsModule,
    ClarityModule,
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    FeatherModule.pick(icons),
    FormsModule,
    MatFormFieldModule,
    HeaderModule,
    HttpClientModule,
    HighchartsChartModule,
    MatDialogModule,
    MatInputModule,
    BrowserModule,
    ProgressbarModule.forRoot(),
    FormsModule


  ],
  providers: [DatePipe, { provide: MatDialogRef, useValue: {} }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
