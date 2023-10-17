import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/contratos/contratos.service';
import { format } from 'date-fns';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contrato-transportadora-form-dialog',
  templateUrl: './contrato-transportadora-form-dialog.component.html',
  styleUrls: ['./contrato-transportadora-form-dialog.component.css']
})
export class ContratoTransportadoraFormDialogComponent {

  base: number = 3;
  ID: number = Date.now();
  local: string = "";
  contato: string = "";
  exponent: number = 22;
  dataSource: any;
  urlAtualiza: string = 'https://uj88w4ga9i.execute-api.sa-east-1.amazonaws.com/dev12';
  urlConsulta: string = 'https://4i6nb2mb07.execute-api.sa-east-1.amazonaws.com/dev13';
  queryOrigin: string = 'Locais_Origem_Inbound';
  queryDestiny: string = 'Locais_Destino_Inbound';
  queryCarrier: string = 'Carriers';
  queryTransport:string = 'Transportadoras_Inbound';
  formGroup!: FormGroup;
  formattedDate: string = '';
  items: any[] | undefined;
  places: any[] | undefined;
  selectedOption: string = '';
  itemsOrigin: any[] | undefined;
  placesOrigin: any[] | undefined;
  itemsCarriers: any[] | undefined;
  placesCarriers: any[] | undefined;




  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    public dialogRef: MatDialogRef<ContratoTransportadoraFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any

  ) { }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      placeCarrier: [this.data.itemsData.placeCarrier, Validators.required],
      Flow: [this.data.itemsData.Flow, Validators.required],
      Type: [this.data.itemsData.Type, Validators.required],
      placeOrigin: [this.data.itemsData.placeOrigin, Validators.required],
      placeDestiny: [this.data.itemsData.placeDestiny, Validators.required],
      Size: [this.data.itemsData.Size, Validators.required],
      price: [this.data.itemsData.price, Validators.required],
      jan: [this.data.itemsData.jan, Validators.required],
      feb: [this.data.itemsData.feb, Validators.required],
      mar: [this.data.itemsData.mar, Validators.required],
      apr: [this.data.itemsData.apr, Validators.required],
      may: [this.data.itemsData.may, Validators.required],
      jun: [this.data.itemsData.jun, Validators.required],
      jul: [this.data.itemsData.jul, Validators.required],
      aug: [this.data.itemsData.aug, Validators.required],
      sep: [this.data.itemsData.sep, Validators.required],
      oct: [this.data.itemsData.oct, Validators.required],
      nov: [this.data.itemsData.nov, Validators.required],
      dec: [this.data.itemsData.dec, Validators.required],
      validity: [this.data.itemsData.validity, Validators.required],
    });
    this.getItemsFromDestiny();
    this.getItemsFromOrigin();
    this.getItemsCarriers();
  }

  getItemsFromDestiny(): void {
    const filtro = '';
    this.apiService.getItems(this.queryDestiny, this.urlConsulta, filtro).subscribe(
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

  getItemsFromOrigin(): void {
    const filtro = '';
    this.apiService.getItems(this.queryOrigin, this.urlConsulta, filtro).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          try {
            const items = JSON.parse(response.body);
            if (Array.isArray(items)) {
              this.itemsOrigin = items.map(item => ({ ...item, checked: false }));
              // Adiciona a chave 'checked' a cada item, com valor inicial como false
              this.placesOrigin = this.itemsOrigin.map(item => item.local);

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

  getItemsCarriers(): void {
    const filtro = '';
    this.apiService.getItems(this.queryCarrier, this.urlConsulta, filtro).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          try {
            const items = JSON.parse(response.body);
            if (Array.isArray(items)) {
              this.itemsCarriers = items.map(item => ({ ...item, checked: false }));
              // Adiciona a chave 'checked' a cada item, com valor inicial como false
              this.placesCarriers = this.itemsCarriers.map(item => item.name);

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


  salvar() {

    if (this.formGroup && this.formGroup.valid) {
      const placeCarrierControl = this.formGroup.get('placeCarrier');
      if (placeCarrierControl && placeCarrierControl.value.trim() !== '') {
        if (!this.data.itemsData.hasOwnProperty("ID")) {
          const currentDate = new Date();
          this.formattedDate = format(currentDate, 'ddMMyyyyHHmmss');
          this.data.itemsData = {
            "ID": this.formattedDate.toString(),
            "placeCarrier": this.formGroup.get('placeCarrier')?.value,
            "Flow": this.formGroup.get('Flow')?.value,
            "Type": this.formGroup.get('Type')?.value,
            "placeOrigin": this.formGroup.get('placeOrigin')?.value,
            "placeDestiny": this.formGroup.get('placeDestiny')?.value,
            "Size": this.formGroup.get('Size')?.value,
            "price": this.formGroup.get('price')?.value,
            "jan": this.formGroup.get('jan')?.value,
            "feb": this.formGroup.get('feb')?.value,
            "mar": this.formGroup.get('mar')?.value,
            "apr": this.formGroup.get('apr')?.value,
            "may": this.formGroup.get('may')?.value,
            "jun": this.formGroup.get('jun')?.value,
            "jul": this.formGroup.get('jul')?.value,
            "aug": this.formGroup.get('aug')?.value,
            "sep": this.formGroup.get('sep')?.value,
            "oct": this.formGroup.get('oct')?.value,
            "nov": this.formGroup.get('nov')?.value,
            "dec": this.formGroup.get('dec')?.value,
          }
        }else{

          this.data.itemsData = {
            "ID": this.data.itemsData.ID,
            "placeCarrier": this.formGroup.get('placeCarrier')?.value,
            "Flow": this.formGroup.get('Flow')?.value,
            "Type": this.formGroup.get('Type')?.value,
            "placeOrigin": this.formGroup.get('placeOrigin')?.value,
            "placeDestiny": this.formGroup.get('placeDestiny')?.value,
            "Size": this.formGroup.get('Size')?.value,
            "price": this.formGroup.get('price')?.value,
            "jan": this.formGroup.get('jan')?.value,
            "feb": this.formGroup.get('feb')?.value,
            "mar": this.formGroup.get('mar')?.value,
            "apr": this.formGroup.get('apr')?.value,
            "may": this.formGroup.get('may')?.value,
            "jun": this.formGroup.get('jun')?.value,
            "jul": this.formGroup.get('jul')?.value,
            "aug": this.formGroup.get('aug')?.value,
            "sep": this.formGroup.get('sep')?.value,
            "oct": this.formGroup.get('oct')?.value,
            "nov": this.formGroup.get('nov')?.value,
            "dec": this.formGroup.get('dec')?.value,
            "validity": this.formGroup.get('validity')?.value,

        }

        }
          this.data.itemsData.tableName = this.queryTransport
          const itemsDataString = JSON.stringify(this.data.itemsData); // Acessa a string desejada
          const modifiedString = itemsDataString.replace(/\\"/g, '"'); // Realiza a substituição na string
          const jsonObject = JSON.parse(modifiedString) as { [key: string]: string };
          const modifiedJsonString = JSON.stringify(jsonObject);
          const jsonObject2 = JSON.parse(modifiedJsonString) as { tableName: string, ID: string, acao: string };
          const jsonArray = [jsonObject2];
          this.apiService.salvar(jsonArray, this.queryTransport, this.urlAtualiza).subscribe(response => {
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



