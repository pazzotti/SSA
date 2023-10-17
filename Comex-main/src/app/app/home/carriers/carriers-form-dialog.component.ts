import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/contratos/contratos.service';
import { format } from 'date-fns';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-carriers-form-dialog',
  templateUrl: './carriers-form-dialog.component.html',
  styleUrls: ['./carriers-form-dialog.component.css']
})
export class CarrierFormDialogComponent {

  base: number = 3;
  ID: number = Date.now();
  local: string = "";
  contato: string = "";
  exponent: number = 22;
  dataSource: any;
  urlAtualiza: string = 'https://uj88w4ga9i.execute-api.sa-east-1.amazonaws.com/dev12';
  query: string = 'Carriers';
  formGroup!: FormGroup;
  formattedDate!: string;



  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    public dialogRef: MatDialogRef<CarrierFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any

  ) { }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      name: [this.data.itemsData.name, Validators.required],
      contato: [this.data.itemsData.contato, [Validators.required, Validators.email]],
      endereco: [this.data.itemsData.endereco, Validators.required]
    });
  }

  salvar() {

    if (this.formGroup && this.formGroup.valid) {
      const nameControl = this.formGroup.get('name');
      if (nameControl && nameControl.value.trim() !== '') {
        if (!this.data.itemsData.hasOwnProperty("ID")) {
          const currentDate = new Date();
          this.formattedDate = format(currentDate, 'ddMMyyyyHHmmss');
          this.data.itemsData = {
            "ID": this.formattedDate.toString(),
            "name": this.formGroup.get('name')?.value,
            "contato": this.formGroup.get('contato')?.value,
            "endereco": this.formGroup.get('endereco')?.value,

          }
        }else{

          this.data.itemsData = {
            "ID": this.data.itemsData.ID,
            "name": this.formGroup.get('name')?.value,
            "contato": this.formGroup.get('contato')?.value,
            "endereco": this.formGroup.get('endereco')?.value,

        }

        }

          this.data.itemsData.tableName = this.query
          const itemsDataString = JSON.stringify(this.data.itemsData); // Acessa a string desejada
          const modifiedString = itemsDataString.replace(/\\"/g, '"'); // Realiza a substituição na string
          const jsonObject = JSON.parse(modifiedString) as { [key: string]: string };
          const modifiedJsonString = JSON.stringify(jsonObject);
          const jsonObject2 = JSON.parse(modifiedJsonString) as { tableName: string, ID: string, acao: string };
          const jsonArray = [jsonObject2];
          this.apiService.salvar(jsonArray, this.query, this.urlAtualiza).subscribe(response => {
          }, error => {
            console.log(error);
          });
          this.dialogRef.close('resultado do diálogo');
        }

      }
    }
  cancel(): void {
    this.dialogRef.close();
  }


}

