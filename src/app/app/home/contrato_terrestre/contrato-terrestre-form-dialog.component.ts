import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/contratos/contratos.service';
import { format } from 'date-fns';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contrato-terrestre-form-dialog',
  templateUrl: './contrato-terrestre-form-dialog.component.html',
  styleUrls: ['./contrato-terrestre-form-dialog.component.css']
})
export class ContratoTerrestreFormDialogComponent {

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
  tableName: string = 'contratos_terrestre';
  formGroup!: FormGroup;
  formattedDate: string = '';
  items: any[] | undefined;
  places: any[] | undefined;
  selectedOption: string = '';
  itemsOrigin: any[] | undefined;
  placesOrigin: any[] | undefined;
  itemsCarriers: any[] | undefined;
  placesCarriers: any[] | undefined;
  
  
  typesVehicles: string[] = [
    'Picape(fiorino) Aberta 500Kg - C1,60 x L1,00 x A1,20',
    'Picape(fiorino) Fechada - C1,60 x L1,00 x A1,20',
    'Picape(fiorino) Refrigerada - C1,60 x L1,00 x A1,20',
    'Kombi 800kg - C1,60 x L1,00 x A1,20',
    'VAN Furgão 1,5t - C3,20 x L1,80 x A1,80',
    'HR Bongo 1,5t - C2,80 x L1,80 x A1,80',
    'HR Bongo Sider 1,5t - C2,80 x L1,80 x A1,80',
    'HR Bongo Aberto 1,5t - C2,80 x L1,80 x A1,80',
    'HR Bongo Refrigerado 1,5t - C2,80 x L1,80 x A1,80',
    'VUC - 3/4 3t - C4,80 x L2,20 x A2,20',
    'VUC - 3/4 Aberto 3t - C4,80 x L2,20 x A2,20',
    'VUC - 3/4 Sider 3t - C4,80 x L2,20 x A2,20',
    'VUC - 3/4 Refrigerado 3t - C4,80 x L2,20 x A2,20',
    'Toco Aberto 6ton - C6,50 x L2,40 x A2,60',
    'Toco Sider 6ton - C6,50 x L2,40 x A2,60',
    'Toco 6ton Refrigerado - C6,50 x L2,40 x A2,60',
    'Truck Aberto 12ton - C8,50 x L2,40 x A2,70',
    'Truck Sider 12ton - C8,50 x L2,40 x A2,70',
    //'Truck Refrigerado 12ton - C8,50 x L2,40 x A2,70',
    'Carreta 25ton Aberta - C14,80 x L2,50 x A2,70',
    'Carreta 25ton Sider - C14,80 x L2,50 x A2,70',
    //'Carreta 25ton Baú - C14,80 x L2,50 x A2,70',
    'Carreta 27ton Aberta - C14,80 x L2,50 x A2,70',
    'Carreta 27ton Sider - C14,80 x L2,50 x A2,70',
    //'Carreta 27ton Baú - C14,80 x L2,50 x A2,70',
    'Truck Munk',
    'Guincho Prancha'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    public dialogRef: MatDialogRef<ContratoTerrestreFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any

  ) { }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      code: [this.data.itemsData.code],
      carrier: [this.data.itemsData.carrier, Validators.required],
      vehicleType: [this.data.itemsData.vehicleType, Validators.required],
      region: [this.data.itemsData.region, Validators.required],
      modality: [this.data.itemsData.modality, Validators.required],
      fixedCost: [this.data.itemsData.fixedCost, Validators.required],
      variableCost: [this.data.itemsData.variableCost, Validators.required],
      flow: [this.data.itemsData.flow, Validators.required],
      // type: [this.data.itemsData.type, Validators.required],
      validity: [this.data.itemsData.validity, Validators.required],
    });
    this.getItemsFromContratos();
    this.getItemsFromOrigin();
    this.getItemsCarriers();
  }

  async getItemsFromContratos(): Promise<void> {
    const filtro = '';
    (await this.apiService.getItems(this.tableName, this.urlConsulta, filtro)).subscribe(
      (response: any) => {
        console.log(response)

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
  


  async getItemsFromOrigin(): Promise<void> {
    const filtro = '';
    (await this.apiService.getItems(this.queryOrigin, this.urlConsulta, filtro)).subscribe(
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

  async getItemsCarriers(): Promise<void> {
    const filtro = '';
    (await this.apiService.getItems(this.queryCarrier, this.urlConsulta, filtro)).subscribe(
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
    console.log("entrou em salvar")
    if (this.formGroup && this.formGroup.valid) {
      // const placeCarrierControl = this.formGroup.get('placeCarrier');
      // if (placeCarrierControl && placeCarrierControl.value.trim() !== '') {
        if (!this.data.itemsData.hasOwnProperty("ID")) {
          const currentDate = new Date();
          this.formattedDate = format(currentDate, 'ddMMyyyyHHmmss');
          this.data.itemsData = {
            "ID": this.formattedDate.toString(),
            "code": this.formGroup.get('code')?.value,
            "carrier": this.formGroup.get('carrier')?.value,
            "vehicleType": this.formGroup.get('vehicleType')?.value,
            "region": this.formGroup.get('region')?.value,
            "modality": this.formGroup.get('modality')?.value,
            "fixedCost": this.formGroup.get('fixedCost')?.value,
            "variableCost": this.formGroup.get('variableCost')?.value,
            "flow": this.formGroup.get('flow')?.value,
            // "type": this.formGroup.get('type')?.value,
            "validity": this.formGroup.get('validity')?.value,
          }
        }else{

          this.data.itemsData = {
            "ID": this.data.itemsData.ID,
            "code": this.formGroup.get('code')?.value,
            "carrier": this.formGroup.get('carrier')?.value,
            "vehicleType": this.formGroup.get('vehicleType')?.value,
            "region": this.formGroup.get('region')?.value,
            "modality": this.formGroup.get('modality')?.value,
            "fixedCost": this.formGroup.get('fixedCost')?.value,
            "variableCost": this.formGroup.get('variableCost')?.value,
            "flow": this.formGroup.get('flow')?.value,
            // "type": this.formGroup.get('type')?.value,
            "validity": this.formGroup.get('validity')?.value,
          }

        // }
          this.data.itemsData.tableName = this.tableName
          const itemsDataString = JSON.stringify(this.data.itemsData); // Acessa a string desejada
          const modifiedString = itemsDataString.replace(/\\"/g, '"'); // Realiza a substituição na string
          const jsonObject = JSON.parse(modifiedString) as { [key: string]: string };
          const modifiedJsonString = JSON.stringify(jsonObject);
          const jsonObject2 = JSON.parse(modifiedJsonString) as { tableName: string, ID: string, acao: string };
        const jsonArray = [jsonObject2];
        // console.log(jsonArray)
          this.apiService.salvar(jsonArray, this.tableName, this.urlAtualiza).subscribe(response => {
            console.log("success")
            console.log(response)
          }, error => {
            console.log("error")
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



