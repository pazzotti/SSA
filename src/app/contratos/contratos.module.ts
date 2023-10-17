import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContratosRoutingModule } from './contratos-routing.module';
import { ContratosComponent } from './contratos.component';


@NgModule({
  declarations: [
    ContratosComponent
  ],
  imports: [
    CommonModule,
    ContratosRoutingModule
  ]
})
export class ContratosModule { }
