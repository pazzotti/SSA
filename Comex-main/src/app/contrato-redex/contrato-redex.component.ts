import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/contratos/contratos.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LiveFormDialogComponent } from '../app/home/live-form-dialog/live-form-dialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './contrato-redex.component.html',
  styleUrls: ['./contrato-redex.component.css']
})

export class Contrato_RedexComponent {
  urlAtualiza: string = 'https://uj88w4ga9i.execute-api.sa-east-1.amazonaws.com/dev12';
  urlConsulta: string = 'https://4i6nb2mb07.execute-api.sa-east-1.amazonaws.com/dev13';
  query: string = 'Contratos_Redex_Inbound';
  data:any;
  dataSource: any;
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
  $even: any;
  $odd: any;
  dialogRef: any;
  items$: any;

  constructor(private apiService: ApiService, public dialog: MatDialog, private dynamodbService: ApiService) {

  }

  editDialog(item: Array<any>, url: string, table: string): void {
    const dialogRef = this.dialog.open(LiveFormDialogComponent, {
      data: {
        itemsData: item,
        url: url,
        query: table
      },
      height: '550px',
      minWidth: '850px',
      position: {
        top: '10vh',
        left: '30vw'
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(LiveFormDialogComponent, {
      data: this.dataSource,
      height: '550px',
      minWidth: '850px',
      position: {
        top: '10vh',
        left: '30vw'
      },


    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');

    });
  }


  ngOnInit(): void {
    this.search();
  }
  search() {
    const filtro = '';
    this.items$ = this.dynamodbService.getItems(this.query,this.urlConsulta, filtro);
  }
  deleteItem(Data: string) {
    this.ID = Date.now()
    this.data.ID = Data;
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
}
