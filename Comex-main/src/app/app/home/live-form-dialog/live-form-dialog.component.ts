import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/contratos/contratos.service';
import { format } from 'date-fns';

@Component({
  selector: 'app-live-form-dialog',
  templateUrl: './live-form-dialog.component.html',
  styleUrls: ['./live-form-dialog.component.css']
})
export class LiveFormDialogComponent {

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
  query: string = 'PowerMathDatabase2';


  constructor(
    private apiService: ApiService,
    public dialogRef: MatDialogRef<LiveFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any

  ) { }

  salvar() {

    if (!this.data.itemsData.hasOwnProperty("ID")) {
      const currentDate = new Date();
      const formattedDate = format(currentDate, 'ddMMyyyyHHmmss');
      console.log(formattedDate);

      this.data.itemsData = {"ID" : formattedDate.toString(),"comentario":this.data.itemsData.comentario,"freetime":this.data.itemsData.freetime,"fsperiod":this.data.itemsData.fsperiod,"liner":this.data.itemsData.liner, "scperiod":this.data.itemsData.scperiod,"tdperiod":this.data.itemsData.tdperiod,"tripcost":this.data.itemsData.tripcost }


    }

    this.data.itemsData.tableName = this.query


    // Remover as barras invertidas escapadas
    const itemsDataString = JSON.stringify(this.data.itemsData); // Acessa a string desejada
    const modifiedString = itemsDataString.replace(/\\"/g, '"'); // Realiza a substituição na string


    // Converter a string JSON para um objeto JavaScript
    const jsonObject = JSON.parse(modifiedString) as { [key: string]: string };

    // Converter o objeto JavaScript de volta para uma string JSON
    const modifiedJsonString = JSON.stringify(jsonObject);

    console.log(modifiedJsonString);

    // Converter a string JSON para um objeto JavaScript
    const jsonObject2 = JSON.parse(modifiedJsonString) as { tableName: string, ID: string, acao: string };

    // Criar um array contendo o objeto
    const jsonArray = [jsonObject2];

    this.apiService.salvar(jsonArray, this.query, this.urlAtualiza).subscribe(response => {

    }, error => {
      console.log(error);
    });
    this.dialogRef.close('resultado do diálogo');
  }

  cancel(): void {
    this.dialogRef.close();
  }


}

