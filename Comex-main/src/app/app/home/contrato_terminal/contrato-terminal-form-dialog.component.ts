import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/contratos/contratos.service';
import { format } from 'date-fns';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contrato-terminal-form-dialog',
  templateUrl: './contrato-terminal-form-dialog.component.html',
  styleUrls: ['./contrato-terminal-form-dialog.component.css']
})
export class ContratoTerminalFormDialogComponent {

  base: number = 3;
  ID: number = Date.now();
  local: string = "";
  contato: string = "";
  exponent: number = 22;
  dataSource: any;
  urlAtualiza: string = 'https://uj88w4ga9i.execute-api.sa-east-1.amazonaws.com/dev12';
  query: string = 'Contratos_Terminais_Inbound';
  formGroup!: FormGroup;
  formattedDate: string = '';



  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    public dialogRef: MatDialogRef<ContratoTerminalFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any

  ) { }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      harborname: [this.data.itemsData.harborname, Validators.required],
      contaienrsize: [this.data.itemsData.contaienrsize, Validators.required],
      fsperiodTime: [this.data.itemsData.fsperiodTime, Validators.required],
      scperiodTime: [this.data.itemsData.scperiodTime, Validators.required],
      tdperiodTime: [this.data.itemsData.tdperiodTime, Validators.required],
      ftperiodTime: [this.data.itemsData.ftperiodTime, Validators.required],
      ffperiodTime: [this.data.itemsData.ffperiodTime, Validators.required],
      fsperiodCIF: [this.data.itemsData.fsperiodCIF, Validators.required],
      scperiodCIF: [this.data.itemsData.scperiodCIF, Validators.required],
      tdperiodCIF: [this.data.itemsData.tdperiodCIF, Validators.required],
      ftperiodCIF: [this.data.itemsData.ftperiodCIF, Validators.required],
      ffperiodCIF: [this.data.itemsData.ffperiodCIF, Validators.required],
      fsperiodValue: [this.data.itemsData.fsperiodValue, Validators.required],
      scperiodValue: [this.data.itemsData.scperiodValue, Validators.required],
      tdperiodValue: [this.data.itemsData.tdperiodValue, Validators.required],
      ftperiodValue: [this.data.itemsData.ftperiodValue, Validators.required],
      ffperiodValue: [this.data.itemsData.ffperiodValue, Validators.required],
      inspection: [this.data.itemsData.inspection, Validators.required],
      sealchange: [this.data.itemsData.sealchange, Validators.required],
      clean: [this.data.itemsData.clean, [Validators.required,Validators.pattern('[0-9]+(\.[0-9]{1,2})?')]],


    });
  }

  salvar() {

    if (this.formGroup && this.formGroup.valid) {
      const harbornameControl = this.formGroup.get('harborname');
      if (harbornameControl && harbornameControl.value.trim() !== '') {
        if (!this.data.itemsData.hasOwnProperty("ID")) {
          const currentDate = new Date();
          this.formattedDate = format(currentDate, 'ddMMyyyyHHmmss');
          this.data.itemsData = {
            "ID": this.formattedDate.toString(),
            "harborname": this.formGroup.get('harborname')?.value,
            "contaienrsize": this.formGroup.get('contaienrsize')?.value,
            "fsperiodTime": this.formGroup.get('fsperiodTime')?.value,
            "scperiodTime": this.formGroup.get('scperiodTime')?.value,
            "tdperiodTime": this.formGroup.get('tdperiodTime')?.value,
            "ftperiodTime": this.formGroup.get('ftperiodTime')?.value,
            "ffperiodTime": this.formGroup.get('ffperiodTime')?.value,
            "fsperiodCIF": this.formGroup.get('fsperiodCIF')?.value,
            "scperiodCIF": this.formGroup.get('scperiodCIF')?.value,
            "tdperiodCIF": this.formGroup.get('tdperiodCIF')?.value,
            "ftperiodCIF": this.formGroup.get('ftperiodCIF')?.value,
            "ffperiodCIF": this.formGroup.get('ffperiodCIF')?.value,
            "fsperiodValue": this.formGroup.get('fsperiodValue')?.value,
            "scperiodValue": this.formGroup.get('scperiodValue')?.value,
            "tdperiodValue": this.formGroup.get('tdperiodValue')?.value,
            "ftperiodValue": this.formGroup.get('ftperiodValue')?.value,
            "ffperiodValue": this.formGroup.get('ffperiodValue')?.value,
            "inspection": this.formGroup.get('inspection')?.value,
            "sealchange": this.formGroup.get('sealchange')?.value,
            "clean": this.formGroup.get('clean')?.value
          }
        }else{

          this.data.itemsData = {
            "ID": this.data.itemsData.ID,
            "harborname": this.formGroup.get('harborname')?.value,
            "contaienrsize": this.formGroup.get('contaienrsize')?.value,
            "fsperiodTime": this.formGroup.get('fsperiodTime')?.value,
            "scperiodTime": this.formGroup.get('scperiodTime')?.value,
            "tdperiodTime": this.formGroup.get('tdperiodTime')?.value,
            "ftperiodTime": this.formGroup.get('ftperiodTime')?.value,
            "ffperiodTime": this.formGroup.get('ffperiodTime')?.value,
            "fsperiodCIF": this.formGroup.get('fsperiodCIF')?.value,
            "scperiodCIF": this.formGroup.get('scperiodCIF')?.value,
            "tdperiodCIF": this.formGroup.get('tdperiodCIF')?.value,
            "ftperiodCIF": this.formGroup.get('ftperiodCIF')?.value,
            "ffperiodCIF": this.formGroup.get('ffperiodCIF')?.value,
            "fsperiodValue": this.formGroup.get('fsperiodValue')?.value,
            "scperiodValue": this.formGroup.get('scperiodValue')?.value,
            "tdperiodValue": this.formGroup.get('tdperiodValue')?.value,
            "ftperiodValue": this.formGroup.get('ftperiodValue')?.value,
            "ffperiodValue": this.formGroup.get('ffperiodValue')?.value,
            "inspection": this.formGroup.get('inspection')?.value,
            "sealchange": this.formGroup.get('sealchange')?.value,
            "clean": this.formGroup.get('clean')?.value

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



