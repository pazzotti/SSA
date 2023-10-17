import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChangeDetectorRef, Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/contratos/contratos.service';
import { format } from 'date-fns';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioLogado } from 'src/app/autenticacao/usuario-logado.type';
import { AutenticacaoService } from 'src/app/autenticacao/autenticacao.service';

@Component({
  selector: 'app-extra-request',
  templateUrl: './extra-request.component.html',
  styleUrls: ['./extra-request.component.css']
})
  
export class ExtraRequestComponent {

  base: number = 3;
  ID: number = Date.now();
  local: string = "";
  contato: string = "";
  exponent: number = 22;
  dataSource: any;
  urlAtualiza: string = 'https://uj88w4ga9i.execute-api.sa-east-1.amazonaws.com/dev12';
  urlConsulta: string = 'https://4i6nb2mb07.execute-api.sa-east-1.amazonaws.com/dev13';
  urlNotify: string = 'https://29o5gcw81i.execute-api.sa-east-1.amazonaws.com/v1';
  queryOrigin: string = 'Locais_Origem_Inbound';
  queryDestiny: string = 'Locais_Destino_Inbound';
  queryCarrier: string = 'Carriers';
  tableName: string = 'extraFreight';
  tableUser: string = 'usersPortal';
  tableNameLocation: string = 'Fornecedores_Karrara_Transport';
  formGroup!: FormGroup;
  formattedDate: string = '';
  items: any[] | undefined;
  places: any[] | undefined;
  selectedOption: string = '';
  itemsOrigin: any[] | undefined;
  placesOrigin: any[] | undefined;
  itemsCarriers: any[] | undefined;
  placesCarriers: any[] | undefined;
  edit: boolean = false;
  statuses = [
    { value: "Requested", name: "Requested", selected: true },
    { value: "Planned", name: "Planned", selected: false},
    { value: "Executing", name: "Executing", selected: false },
    { value: "Completed", name: "Completed", selected: false },
    { value: "Canceled", name: "Canceled", selected: false },
  ]  
  selectedValue = 0;
  contactCarrier: string = '';
  contactTrasport: string = '+5511985507468';
  status: string = 'Requested';
  dataNotify: any;
  

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
  
  isDisabled: boolean = true;
  usuarioLogado!: UsuarioLogado;
  dateRequest = new Date();
  dataCompleta = this.dateRequest.toLocaleString();

  constructor(
    private formBuilder: FormBuilder,
    private dynamodbService: ApiService,
    private autenticacaoService: AutenticacaoService,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<ExtraRequestComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      motive: [this.data?.itemsData.motive, Validators.required],
      nf: [this.data?.itemsData.nf],
      vehicleType: ({ value: this.data?.itemsData.vehicleType, disabled: true }),
      region: [this.data?.itemsData.region],
      nfTotal: [this.data?.itemsData.nfTotal],
      weight: [this.data?.itemsData.weight],
      carrier: ({ value: this.data?.itemsData.carrier, disabled: true }),
      quantity: [this.data?.itemsData.quantity],
      reqVehicle: [this.data?.itemsData.reqVehicle, Validators.required],
      description: [this.data?.itemsData.description],
      reqName: [this.data?.itemsData.reqName, Validators.required],
      reqId: [this.data?.itemsData.reqId, Validators.required],
      reqEmail: [this.data?.itemsData.reqEmail, Validators.required],
      reqPhone: [this.data?.itemsData.reqPhone, Validators.required],
      supEmail: [this.data?.itemsData.supEmail, Validators.required],
      costCenter: [this.data?.itemsData.costCenter, Validators.required],
      projectNumber: [this.data?.itemsData.projectNumber],
      orderNumber: [this.data?.itemsData.orderNumber],
      locationPickup: [this.data?.itemsData.locationPickup, Validators.required],
      areaPickup: [this.data?.itemsData.areaPickup],
      addressPickup: [this.data?.itemsData.addressPickup],
      cityPickup: [this.data?.itemsData.cityPickup],
      statePickup: [this.data?.itemsData.statePickup],
      cepPickup: [this.data?.itemsData.cepPickup],
      datePickup: [this.data?.itemsData.datePickup, Validators.required],
      timePickup: [this.data?.itemsData.timePickup],
      locationDelivery: [this.data?.itemsData.locationDelivery, Validators.required],
      areaDelivery: [this.data?.itemsData.areaDelivery],
      dateDelivery: [this.data?.itemsData.dateDelivery],
      addressDelivery: [this.data?.itemsData.addressDelivery],
      cityDelivery: [this.data?.itemsData.cityDelivery],
      stateDelivery: [this.data?.itemsData.stateDelivery],
      cepDelivery: [this.data?.itemsData.cepDelivery],
      timeDelivery: [this.data?.itemsData.timeDelivery],
      notes: [this.data?.itemsData.notes],
      critical: [this.data?.itemsData.critical],
      dangerousProduct: [this.data?.itemsData.dangerousProduct],
      status: [this.data?.itemsData.status],
      dateRequest: new Date()
    });
    this.getItemsFromExtraReq();
    this.getItemsFromOrigin();
    // this.getItemsFromUser();
    this.getUserLogado();
    this.enableFields()
  }
  
  enableFields() {
    if (this.usuarioLogado.role === '3' || this.usuarioLogado.role === '0') {
      this.formGroup.get('carrier')?.enable();
      this.formGroup.get('vehicleType')?.enable();
    }
  }
  
  disableFields() {
    this.formGroup.get('carrier')?.disable();
    this.formGroup.get('vehicleType')?.disable();
  }
      
  getUserLogado() {
    console.log("logado")
    // console.log(this.autenticacaoService?.obterUsuarioLogado())
    this.usuarioLogado = this.autenticacaoService.obterUsuarioLogado()
    console.log(this.usuarioLogado)
  }

  async getItemsFromExtraReq(): Promise<void> {
    const filtro = 'all';
    (await this.dynamodbService.getItems(this.tableName, this.urlConsulta, filtro)).subscribe(
      (response: any) => {
        console.log(response)

        if (response.statusCode === 200) {
          try {
            const items = JSON.parse(response.body);
            if (Array.isArray(items)) {
              this.items = items.map(item => ({ ...item, checked: false }));
              // Adiciona a chave 'checked' a cada item, com valor inicial como false
              this.places = this.items.map(item => item.local);
              this.cdr.detectChanges();

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

  // getItemsFromUser(): void {
  //   const filtro = 'all';
  //   this.dynamodbService.getItems(this.tableUser, this.urlConsulta, filtro).subscribe(
  //     (response: any) => {
  //       if (response.statusCode === 200) {
  //         try {
  //           this.usuarioLogado = JSON.parse(response.body);
  //           console.log("user")
  //           console.log(this.usuarioLogado)
  //         } catch (error) {
  //           console.error('Error parsing JSON:', error);
  //         }
  //       } else {
  //         console.error('Invalid response:', response);
  //       }
  //     },
  //     (error: any) => {
  //       console.error(error);
  //     }
  //   );
  // }


  async getItemsFromOrigin(): Promise<void> {
    const filtro = '';
    (await this.dynamodbService.getItems(this.tableNameLocation, this.urlConsulta, filtro)).subscribe(
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
    const filtro = 'all';
    (await this.dynamodbService.getItems(this.queryCarrier, this.urlConsulta, filtro)).subscribe(
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
  
  // enableAccept() {
  //   if (this.form.vehicle == '---' || !this.form.licensePlate || this.form.accepted != 0) {
  //     return true;
  //   }
  // }


  async salvar() {
    console.log("entrou em salvar")
    this.dateRequest = new Date();
    this.dataCompleta = this.dateRequest.toLocaleString();

    console.log(this.data?.itemsData.motive)
    console.log(this.data?.itemsData.reqEmail)
    console.log(this.data?.itemsData.reqId)
    console.log(this.data?.itemsData.reqName)

    // this.data = this.data || {}; // Inicializa this.data como um objeto vazio, se for nulo
    // this.data.itemsData = this.data.itemsData || {}; 
    console.log(this.formGroup)
    console.log(this.formGroup.valid)
    // this.data.itemsData = {
    //   "ID": this.data.itemsData.reqId + this.data.itemsData.datePickup
    // }
    // console.log(this.data.itemsData.ID)
    if (this.formGroup && this.formGroup.valid) {
      console.log("passou a condicao")

      // const placeCarrierControl = this.formGroup.get('placeCarrier');
      // if (placeCarrierControl && placeCarrierControl.value.trim() !== '') {
      if (!this.data.itemsData.hasOwnProperty("ID")) {
        console.log("passou a segunda condicao")

        const currentDate = new Date();
        this.formattedDate = format(currentDate, 'ddMMyyyyHHmmss');
        this.data.itemsData = {
          "ID": this.formattedDate.toString(),
          "motive": this.formGroup.get('motive')?.value,
          "nf": this.formGroup.get('nf')?.value,
          "vehicleType": this.formGroup.get('vehicleType')?.value,
          "region": this.formGroup.get('region')?.value,
          "carrier": this.formGroup.get('carrier')?.value,
          "nfTotal": this.formGroup.get('nfTotal')?.value,
          "weight": this.formGroup.get('weight')?.value,
          "quantity": this.formGroup.get('quantity')?.value,
          "reqVehicle": this.formGroup.get('reqVehicle')?.value,
          "description": this.formGroup.get('description')?.value,
          "reqName": this.formGroup.get('reqName')?.value,
          "reqId": this.formGroup.get('reqId')?.value,
          "reqEmail": this.formGroup.get('reqEmail')?.value,
          "reqPhone": this.formGroup.get('reqPhone')?.value,
          "supEmail": this.formGroup.get('supEmail')?.value,
          "costCenter": this.formGroup.get('costCenter')?.value,
          "projectNumber": this.formGroup.get('projectNumber')?.value,
          "orderNumber": this.formGroup.get('orderNumber')?.value,
          "locationPickup": this.formGroup.get('locationPickup')?.value,
          "areaPickup": this.formGroup.get('areaPickup')?.value,
          "addressPickup": this.formGroup.get('addressPickup')?.value,// ? this.formGroup.get('addressPickup')?.value : this.placesOrigin?.filter(ad => console.log(ad.endereco) ),
          "cityPickup": this.formGroup.get('cityPickup')?.value,
          "statePickup": this.formGroup.get('statePickup')?.value,
          "cepPickup": this.formGroup.get('cepPickup')?.value,
          "datePickup": this.formGroup.get('datePickup')?.value,
          "timePickup": this.formGroup.get('timePickup')?.value,
          "locationDelivery": this.formGroup.get('locationDelivery')?.value,
          "areaDelivery": this.formGroup.get('areaDelivery')?.value,
          "addressDelivery": this.formGroup.get('addressDelivery')?.value,
          "cityDelivery": this.formGroup.get('cityDelivery')?.value,
          "stateDelivery": this.formGroup.get('stateDelivery')?.value,
          "cepDelivery": this.formGroup.get('cepDelivery')?.value,
          "dateDelivery": this.formGroup.get('dateDelivery')?.value,
          "timeDelivery": this.formGroup.get('timeDelivery')?.value,
          "notes": this.formGroup.get('notes')?.value,
          "critical": this.formGroup.get('critical')?.value,
          "dangerousProduct": this.formGroup.get('dangerousProduct')?.value,
          "status": this.formGroup.get('status')?.value ? this.formGroup.get('status')?.value : 'Requested'  ,
          // "status": this.status != 'Requested' ? this.status = this.status : this.status = 'Requested',
          "dateRequest": this.dataCompleta          
        } 
        this.dataNotify = {
          "phone_number": this.contactTrasport,
          "message": "Novo frete extra solicitado " + "ID: " + this.data.itemsData.ID
        };
        this.notify(this.dataNotify);  
      } else {
        console.log("passou a terceira condicao")
        this.data.itemsData = {
          "ID": this.data.itemsData.ID,
          "motive": this.formGroup.get('motive')?.value,
          "nf": this.formGroup.get('nf')?.value,
          "vehicleType": this.formGroup.get('vehicleType')?.value,
          "region": this.formGroup.get('region')?.value,
          "carrier": this.formGroup.get('carrier')?.value,
          "nfTotal": this.formGroup.get('nfTotal')?.value,
          "weight": this.formGroup.get('weight')?.value,
          "quantity": this.formGroup.get('quantity')?.value,
          "reqVehicle": this.formGroup.get('reqVehicle')?.value,
          "description": this.formGroup.get('description')?.value,
          "reqName": this.formGroup.get('reqName')?.value,
          "reqId": this.formGroup.get('reqId')?.value,
          "reqEmail": this.formGroup.get('reqEmail')?.value,
          "reqPhone": this.formGroup.get('reqPhone')?.value,
          "supEmail": this.formGroup.get('supEmail')?.value,
          "costCenter": this.formGroup.get('costCenter')?.value,
          "projectNumber": this.formGroup.get('projectNumber')?.value,
          "orderNumber": this.formGroup.get('orderNumber')?.value,
          "locationPickup": this.formGroup.get('locationPickup')?.value,
          "areaPickup": this.formGroup.get('areaPickup')?.value,
          "addressPickup": this.formGroup.get('addressPickup')?.value,
          "cityPickup": this.formGroup.get('cityPickup')?.value,
          "statePickup": this.formGroup.get('statePickup')?.value,
          "cepPickup": this.formGroup.get('cepPickup')?.value,
          "datePickup": this.formGroup.get('datePickup')?.value,
          "timePickup": this.formGroup.get('timePickup')?.value,
          "locationDelivery": this.formGroup.get('locationDelivery')?.value,
          "areaDelivery": this.formGroup.get('areaDelivery')?.value,
          "addressDelivery": this.formGroup.get('addressDelivery')?.value,
          "cityDelivery": this.formGroup.get('cityDelivery')?.value,
          "stateDelivery": this.formGroup.get('stateDelivery')?.value,
          "cepDelivery": this.formGroup.get('cepDelivery')?.value,
          "dateDelivery": this.formGroup.get('dateDelivery')?.value,
          "timeDelivery": this.formGroup.get('timeDelivery')?.value,
          "notes": this.formGroup.get('notes')?.value,
          "critical": this.formGroup.get('critical')?.value,
          "dangerousProduct": this.formGroup.get('dangerousProduct')?.value,
          "status": this.formGroup.get('status')?.value ? this.formGroup.get('status')?.value : 'Requested',
          // "status": this.formGroup.get('status')?.value ? this.formGroup.get('status')?.value : this.formGroup.get('status')?.setValue('Requested'),
          // "status": this.formGroup.get('status')?.value,
          "dateRequest": this.dataCompleta
        }
        
        this.dataNotify = {
          "phone_number": this.contactTrasport,
          "message": "Frete extra com ID: " + this.data.itemsData.ID + " foi atualizado."
        };
        this.notify(this.dataNotify); 
      }
      console.log("passou as condicos para salvar")
      console.log("Status")
      console.log(this.status)

        this.data.itemsData.status != null ? this.data.itemsData.status : this.statuses[0].value;
        console.log(this.data.itemsData.status)
        this.data.itemsData.addressPickup != null ? this.data.itemsData.addressPickup :
          this.data.itemsData.addressPickup = this.itemsOrigin?.find(adr => adr.local == this.data.itemsData.locationPickup)?.endereco
        // console.log("endereço")
        // console.log(this.data.itemsData.addressPickup)
        this.data.itemsData.addressDelivery != null ? this.data.itemsData.addressDelivery :
          this.data.itemsData.addressDelivery = this.itemsOrigin?.find(adr => adr.local == this.data.itemsData.locationDelivery)?.endereco
        // console.log("endereço")
        // console.log(this.data.itemsData.addressDelivery)
        this.data.itemsData.tableName = this.tableName
        const itemsDataString = JSON.stringify(this.data.itemsData); // Acessa a string desejada
        const modifiedString = itemsDataString.replace(/\\"/g, '"'); // Realiza a substituição na string
        const jsonObject = JSON.parse(modifiedString) as { [key: string]: string };
        const modifiedJsonString = JSON.stringify(jsonObject);
        const jsonObject2 = JSON.parse(modifiedJsonString) as { tableName: string, ID: string, acao: string };
        const jsonArray = [jsonObject2];
        // console.log(itemsDataString);
        // console.log(modifiedString);
        //console.log(this.data.itemsData);     
        this.dynamodbService.salvar(jsonArray, this.tableName, this.urlAtualiza).subscribe({
          next: response => {
            console.log("success")
            console.log(response)
            this.getItemsFromExtraReq(); // Atualiza os dados após o salvamento
            this.dialogRef.close();
          }, error: error => {
            console.log("error")
            console.log(error);
          }
        });
      
    }
  }
  
  cancel(): void {
    this.formGroup.reset()
    this.dialogRef.close();
  }
  
  notify(data: any) {
    console.log("entrou notify")
    const body =
    {
      "Records": [
        {
          "eventName": "INSERT",
          "dynamodb": {
            "NewImage": {
              "phone_number": {
                "S": data.phone_number
              },
              "message": {
                "S": data.message
              }
            }
          }
        }
      ]
    }    
    this.dynamodbService.enviaNotificacao(body, this.urlNotify).subscribe({
      next: response => {
        console.log("success")
        console.log(response)
        // this.getItemsFromExtraReq(); // Atualiza os dados após o salvamento
        // this.dialogRef.close();
      }, error: error => {
        console.log("error")
        console.log(error);
      }
    });
  }

}





