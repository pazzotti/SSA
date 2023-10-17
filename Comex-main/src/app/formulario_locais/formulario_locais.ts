import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/contratos/contratos.service';

@Component({
  selector: 'app-formulario_locais',
  templateUrl: './formulario_locais.component.html',
  styleUrls: ['./formulario_locais.component.css']
})
export class FormularioLocaisComponent {
  base: number = 3;
  ID: number = Date.now();
  liner: string = "";
  tripcost: number = 0;
  freetime: number = 0;
  fsperiod: number = 0;
  scperiod: number = 0;
  tdperiod: number = 0;
  comentario: string = "";
  exponent: number = 22;
  dataSource: any;
  urlAtualiza: string = 'https://uj88w4ga9i.execute-api.sa-east-1.amazonaws.com/dev12';


  constructor(
    private apiService: ApiService,
    public dialogRef: MatDialogRef<FormularioLocaisComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any

  ) {

  }

  salvar() {
    this.ID = Date.now()
    if (this.data.ID == ""){
      this.dataSource.ID = this.ID;
    }
    this.dataSource.local = this.data.item.local;
    this.dataSource.endereco = this.data.item.endereco;
    this.dataSource.contato = this.data.item.contato;

    this.apiService.salvar(this.dataSource, this.data.local, this.urlAtualiza ).subscribe(response => {

    }, error => {
      console.log(error);
    });
    this.dialogRef.close();
  }

  cancel(): void {
    this.dialogRef.close();
  }

}

