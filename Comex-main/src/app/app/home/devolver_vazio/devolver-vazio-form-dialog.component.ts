import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/contratos/contratos.service';
import { format } from 'date-fns';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-devolver-vazio-form-dialog',
  templateUrl: './devolver-vazio-form-dialog.component.html',
  styleUrls: ['./devolver-vazio-form-dialog.component.css']
})
export class DevolverVazioFormDialogComponent {

  base: number = 3;
  ID: number = Date.now();
  local: string = "";
  contato: string = "";
  exponent: number = 22;
  dataSource: any;
  urlAtualiza: string = 'https://uj88w4ga9i.execute-api.sa-east-1.amazonaws.com/dev12';
  urlConsulta: string = 'https://4i6nb2mb07.execute-api.sa-east-1.amazonaws.com/dev13';
  query: string = 'Locais_Destino_Inbound';
  queryCarrier: string = 'Carriers';
  query2: string = 'Pipeline_Inbound';
  formGroup!: FormGroup;
  formattedDate: string = '';
  isChecked: boolean = false;
  items: any[] | undefined;
  places: any[] | undefined;
  carriers: any[] | undefined;
  selectedOption: string = '';
  selectedPlace: FormControl = new FormControl('', Validators.required);







  constructor(
    private formBuilder: FormBuilder,
    private dynamoDBService: ApiService,
    public dialogRef: MatDialogRef<DevolverVazioFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any

  ) { }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      Carrier: [this.data.itemsData.Carrier, Validators.required],
      Container: [this.data.itemsData.Container, Validators.required],
      Checkbox: [false], // Valor inicial do checkbox
      SelectedPlace: [this.selectedPlace, Validators.required]
    });
    this.getItemsFromDynamoDB();
    this.getItemsFromDynamoDBCarrier();
  }

  get fieldNameValue() {
    return this.formGroup.get('Container')?.value;
  }


  getItemsFromDynamoDB(): void {
    const filtro = '';
    this.dynamoDBService.getItems(this.query, this.urlConsulta, filtro).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          try {
            const items = JSON.parse(response.body);
            if (Array.isArray(items)) {
              this.items = items.map(item => ({ ...item, checked: false }));
              // Adiciona a chave 'checked' a cada item, com valor inicial como false
              this.places = this.items.map(item => item.local);

            } else {
              console.error('Invalid items data:', items);
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        } else {
          console.error('Invalid response:', response);
        }
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  getItemsFromDynamoDBCarrier(): void {
    const filtro = '';
    this.dynamoDBService.getItems(this.queryCarrier, this.urlConsulta, filtro).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          try {
            const items = JSON.parse(response.body);
            if (Array.isArray(items)) {
              this.items = items.map(item => ({ ...item, checked: false }));
              // Adiciona a chave 'checked' a cada item, com valor inicial como false
              this.carriers = this.items.map(item => item.name);

            } else {
              console.error('Invalid items data:', items);
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        } else {
          console.error('Invalid response:', response);
        }
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  formatarData(data: Date): string {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  salvar() {

    const finalDate = this.formatarData(new Date());

    this.data.itemsData = {
      ...this.data.itemsData, // Mantém os valores existentes
      "avariado": this.formGroup.get('Checkbox')?.value,
      "localDevolvido": this.formGroup.get('SelectedPlace')?.value,
      "Carrier":this.formGroup.get('Carrier')?.value,
      "finalDate": finalDate,
      "Step": 'Empty Return'
    };

    this.data.itemsData.tableName = this.query2
    const itemsDataString = JSON.stringify(this.data.itemsData); // Acessa a string desejada
    const modifiedString = itemsDataString.replace(/\\"/g, '"'); // Realiza a substituição na string
    const jsonObject = JSON.parse(modifiedString) as { [key: string]: string };
    const modifiedJsonString = JSON.stringify(jsonObject);
    const jsonObject2 = JSON.parse(modifiedJsonString) as { tableName: string, ID: string, acao: string };
    const jsonArray = [jsonObject2];
    this.dynamoDBService.salvar(jsonArray, this.query2, this.urlAtualiza).subscribe(response => {
    }, error => {
      console.log(error);
    });
    this.dialogRef.close('resultado do diálogo');



  }

  cancel(): void {
    this.dialogRef.close();
  }

}



