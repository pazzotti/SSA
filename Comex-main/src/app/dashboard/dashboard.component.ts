import { Component } from '@angular/core';
import * as Highcharts from 'highcharts';
import { getISOWeek } from 'date-fns';
import { ApiService } from '../services/contratos/contratos.service';

@Component({
  selector: 'app-chart',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']


})
export class DashboardComponent {
  items: any[] = [];
  startDate: Date = new Date();
  endDate: Date = new Date();
  weekCounts: any;
  monthCounts: any;
  dados: string[] = [];
  urlAtualiza: string = 'https://uj88w4ga9i.execute-api.sa-east-1.amazonaws.com/dev12';
  urlConsulta: string = 'https://4i6nb2mb07.execute-api.sa-east-1.amazonaws.com/dev13';
  query: string = 'Pipeline_Inbound';
  date: Date = new Date();

  constructor(private dynamoDBService: ApiService) {

  }

  ngOnInit() {


    this.getItemsFromDynamoDB();

  }

  getItemsFromDynamoDB(): void {
    const filtro = 'all';
    this.dynamoDBService.getItems(this.query, this.urlConsulta, filtro).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          try {
            const items = JSON.parse(response.body);
            if (Array.isArray(items)) {
              this.items = items.map(item => ({ ...item, checked: false }));
              // Adiciona a chave 'checked' a cada item, com valor inicial como false
              // Forçar detecção de alterações após atualizar os dados
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

  getMonthInterval(startDate: Date, endDate: Date): number {
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();

    return (endYear - startYear) * 12 + (endMonth - startMonth);
  }

  createChart() {
    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
    let intervalo = this.getMonthInterval(startDate, endDate);
    let labels: string[] = [];
    let dados: string[] = [];
    let intervalos: number[] = [10, 20, 30];

    if (intervalo < 1) {
      // Intervalo inferior a 1 mês (por semana)
      labels = this.getWeekLabels(startDate, endDate);
      dados = labels.map((weekLabel: string) => {
        const weekNumber = parseInt(weekLabel.split(' ')[1]);
        return this.weekCounts[weekNumber] || 0;
      });
    } else {
      // Intervalo superior a 1 mês (por mês)
      labels = this.getMonthLabels(startDate, endDate);
      dados = labels.map((monthLabel: string) => {
        return this.monthCounts[monthLabel] || 0;
      });
    }

    this.updateChart();
  }

  getWeekLabels(startDate: Date, endDate: Date): string[] {
    const labels: string[] = [];

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const weekNumber = getISOWeek(currentDate);
      const weekLabel = `Semana ${weekNumber}`;
      labels.push(weekLabel);

      // Incrementa a data em uma semana
      currentDate.setDate(currentDate.getDate() + 7);
    }

    return labels;
  }

  getMonthLabels(startDate: Date, endDate: Date): string[] {
    const labels: string[] = [];

    // Obter o ano e mês de início
    let year = startDate.getFullYear();
    let month = startDate.getMonth();

    // Iterar pelos meses até chegar à data de término
    while (year < endDate.getFullYear() || (year === endDate.getFullYear() && month <= endDate.getMonth())) {
      const monthLabel = `${this.getMonthName(month)} ${year}`;
      labels.push(monthLabel);

      // Incrementar para o próximo mês
      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
    }

    return labels;
  }

  getMonthName(monthIndex: number): string {
    const monthNames: string[] = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    return monthNames[monthIndex];
  }





  chartOptionsReutiliza: Highcharts.Options = {
    chart: {
      type: 'bar',
      backgroundColor: 'rgba(242, 242, 242, 0.5)',
      width: 900
    },
    title: {
      text: 'Number of Reused and Damage Containers'
    },
    xAxis: {
      categories: ['Total Exported', 'Total Reused', 'Total Damaged']
    },
    yAxis: {
      title: {
        text: 'Scale of Containers'
      }
    },
    legend: {
      enabled: false
    },
    series: [
      {
        type: 'bar',
        name: 'Percentual',
        data: [] // Deixe os dados vazios inicialmente
      }
    ]
  };

  updateChart() {
    const startDate = this.startDate;
    const endDate = this.endDate;
    const testdata = new Date(startDate);

    const atas = this.items.map(item => item.ATA);

    const placesSet = new Set(this.items.map(item => item.ClearancePlace));
    const places = Array.from(placesSet);



    const itemsLocal = this.items
      .filter(item => {
        const parts = item.ATA.split('/');
        const day = parseInt(parts[0], 10); // Converter o dia para um número inteiro
        const month = parseInt(parts[1], 10) - 1; // Converter o mês para um número inteiro (subtraindo 1 para ajustar à base zero)
        const year = parseInt(parts[2], 10); // Converter o ano para um número inteiro

        const date = new Date(year, month, day); // Criar o objeto Date com os valores do dia, mês e ano

        return date >= new Date(startDate) && date <= new Date(endDate);
      })
      .map(item => item.ClearancePlace);


    const itemCounts: { [item: string]: number } = {};

    itemsLocal.forEach(item => {
      if (itemCounts[item]) {
        itemCounts[item]++;
      } else {
        itemCounts[item] = 1;
      }
    });



    // Verifique se a propriedade xAxis existe e é um objeto antes de atualizar as categorias
    if (this.barQuantidadeContainers.xAxis && typeof this.barQuantidadeContainers.xAxis === 'object') {
      const xAxisOptions = this.barQuantidadeContainers.xAxis as Highcharts.XAxisOptions;
      xAxisOptions.categories = Object.keys(itemCounts);

      // Crie um novo objeto de série com os valores atualizados
      const updatedSeries: Highcharts.SeriesOptionsType = {
        type: 'bar',
        name: 'Quantidade de Containers',
        data: Object.values(itemCounts),
        dataLabels: {
          enabled: true,
          inside: true,
          align: 'center',
          verticalAlign: 'middle',
          style: {
            fontWeight: 'bold'
          }
        }
      };

      // Atualize o objeto de série existente no gráfico
      this.barQuantidadeContainers.series = [updatedSeries];

      // Redesenhe o gráfico para refletir as mudanças
      Highcharts.chart('chartQuantidade', this.barQuantidadeContainers);
    }






    const itemsInRange = this.items
      .filter(item => {
        const parts = item.ATA.split('/');
        const day = parseInt(parts[0], 10); // Converter o dia para um número inteiro
        const month = parseInt(parts[1], 10) - 1; // Converter o mês para um número inteiro (subtraindo 1 para ajustar à base zero)
        const year = parseInt(parts[2], 10); // Converter o ano para um número inteiro

        const date = new Date(year, month, day); // Criar o objeto Date com os valores do dia, mês e ano

        return date >= new Date(startDate) && date <= new Date(endDate);
      })
      .map(item => item.Step);

      const itemsAvariados = this.items
      .filter(item => {
        const parts = item.ATA.split('/');
        const day = parseInt(parts[0], 10); // Converter o dia para um número inteiro
        const month = parseInt(parts[1], 10) - 1; // Converter o mês para um número inteiro (subtraindo 1 para ajustar à base zero)
        const year = parseInt(parts[2], 10); // Converter o ano para um número inteiro

        const date = new Date(year, month, day); // Criar o objeto Date com os valores do dia, mês e ano

        return date >= new Date(startDate) && date <= new Date(endDate);
      })
      .map(item => item.avariado);



    const countReusedItems = itemsInRange.filter(item => item === 'Reused').length;
    const countEmptyItems = itemsInRange.filter(item => item === 'Empty Return').length;
    const countAvariados = itemsAvariados.filter(item => item === true).length;
    const totalItens = countReusedItems + countEmptyItems
    const intervalo = [totalItens, countReusedItems, countAvariados]
    const percentReuse = (countReusedItems / totalItens * 100).toFixed(1);
    const percentRDamage = (countAvariados / totalItens * 100).toFixed(1);



    // Verifique se a propriedade chartOptionsReutiliza é undefined
    if (this.chartOptionsReutiliza === undefined) {
      this.chartOptionsReutiliza = {} as Highcharts.Options;
    }

    // Atualize os dados do gráfico
    if (this.chartOptionsReutiliza.series === undefined) {
      this.chartOptionsReutiliza.series = [];
    }
    this.chartOptionsReutiliza.series[0] = {
      type: 'bar',
      name: 'Percentual',
      data: intervalo
    };

    this.chartOptionsReutiliza.series[0].data = [
      { y: totalItens, dataLabels: { enabled: true, align: 'center', inside: true, format: '{y}' } },
      { y: countReusedItems, dataLabels: { enabled: true, align: 'center', inside: true, format: '{y}  Reused   (' + percentReuse + '%)' } },
      { y: countAvariados, dataLabels: { enabled: true, align: 'center', inside: true, format: '{y}  Damaged   (' + percentRDamage + '%)' } }
    ];

    // Redesenha o gráfico
    Highcharts.chart('chartContainer', this.chartOptionsReutiliza);

  }



  lineChartOptionsCustos: Highcharts.Options = {
    chart: {
      type: 'line',
      backgroundColor: 'rgba(242, 242, 242, 0.5)',
      width: 900
    },
    title: {
      text: 'Comparação de Orçamento e Realizado'
    },
    xAxis: {
      categories: this.dados,
    },
    yAxis: {
      title: {
        text: 'Valor (em milhões)'
      }
    },
    series: [
      {
        type: 'line',
        name: 'Orçamento',
        data: [10, 12, 15, 13, 11, 9, 10, 14, 16, 18, 17, 15],
        marker: {
          enabled: false
        }
      },
      {
        type: 'line',
        name: 'Realizado',
        data: [9, 11, 14, 12, 10, 8, 9, 13, 15, 17, 16, 14],
        marker: {
          enabled: false
        }
      }
    ]
  };
  Highcharts: typeof Highcharts = Highcharts;
  columnChartOptions: Highcharts.Options = {
    chart: {
      width: 900,
      backgroundColor: 'rgba(242, 242, 242, 0.5)',
      type: 'column'
    },
    title: {
      text: 'Total containers Arrivel'
    },
    xAxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      title: {
        text: 'Month'
      }
    },
    yAxis: {
      title: {
        text: 'Quantity of Containers'
      }
    },
    series: [
      {
        type: 'column',
        name: 'Product A',
        data: [100, 200, 300, 400, 500, 600],
        pointWidth: 60, // Aumenta a largura das colunas para 40 pixels
      },
      {
        type: 'column',
        name: 'Product B',
        data: [200, 300, 400, 500, 600, 700],
        pointWidth: 50, // Aumenta a largura das colunas para 40 pixels
      }
    ]
  };

  pieChartOptionsCustos: Highcharts.Options = {
    chart: {
      width: 900,
      backgroundColor: 'rgba(242, 242, 242, 0.5)',
      type: 'pie'
    },
    title: {
      text: 'Share of Container Costs'
    },
    plotOptions: {
      pie: {
        innerSize: '30%',
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '{point.percentage:.1f}%',
          distance: -30,
          style: {
            fontWeight: 'bold',
            color: 'white'
          }
        }
      }
    },
    series: [
      {
        type: 'pie',
        name: 'Share',
        data: [
          { name: 'Frete', y: 100 },
          { name: 'Manuseio', y: 200 },
          { name: 'Clean', y: 150 },
          { name: 'Transport', y: 300 },
          { name: 'Storage', y: 250 },
          { name: 'Demurrage', y: 175 }
        ],
        dataLabels: {
          enabled: true,
          format: '{point.percentage:.1f}%',
          distance: -30,
          style: {
            fontWeight: 'bold',
            color: 'white'
          }
        }
      },
      {
        type: 'pie',
        name: 'Values',
        innerSize: '60%',
        data: [
          { name: 'Frete', y: 100 },
          { name: 'Manuseio', y: 200 },
          { name: 'Clean', y: 150 },
          { name: 'Transport', y: 300 },
          { name: 'Storage', y: 250 },
          { name: 'Demurrage', y: 175 }
        ],
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.y}',
          distance: 30,
          style: {
            fontWeight: 'bold'
          }
        }
      }
    ],
    legend: {
      align: 'right',
      verticalAlign: 'middle',
      layout: 'vertical',
      itemMarginTop: 10,
      itemMarginBottom: 10
    }
  };
  pieChartOptions: Highcharts.Options = {
    chart: {
      width: 900,
      backgroundColor: 'rgba(242, 242, 242, 0.5)',
      type: 'pie'
    },
    title: {
      text: 'Share of Container Costs'
    },
    plotOptions: {
      pie: {
        innerSize: '30%',
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.y}'
        }
      }
    },
    series: [
      {
        type: 'pie',
        name: 'Sales',
        data: [
          { name: 'Product A', y: 2100 },
          { name: 'Product B', y: 2500 }
        ]
      }
    ]
  };
  pieChart2Options: Highcharts.Options = {
    chart: {
      width: 900,
      backgroundColor: 'rgba(242, 242, 242, 0.5)',
      type: 'pie'
    },
    title: {
      text: 'Share of Container Costs'
    },
    plotOptions: {
      pie: {
        innerSize: '30%',
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.y}'
        }
      }
    },
    series: [
      {
        type: 'pie',
        name: 'Sales',
        data: [
          { name: 'Product A', y: 2100 },
          { name: 'Product B', y: 2500 }
        ]
      }
    ]
  };

  barQuantidadeContainers: Highcharts.Options = {
    chart: {
      type: 'bar',
      backgroundColor: 'rgba(242, 242, 242, 0.5)',
      width: 900
    },
    title: {
      text: 'Quantidade de Containers por Local'
    },
    xAxis: {
      categories: []
    },
    yAxis: {
      title: {
        text: 'Quantidade'
      }
    },
    series: [
      {
        type: 'bar',
        name: 'Quantidade de Containers',
        data: [], // Substitua os valores com seus dados reais
      }
    ]
  };

  buscarIntervalo() {

  }
}
