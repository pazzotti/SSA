import { Component } from '@angular/core';
import { HeaderModule } from './header.module';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponentes {
  selectedOption: string = "";

}
