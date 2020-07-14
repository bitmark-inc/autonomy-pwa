declare var window: any;

import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { AppSettings } from "../../app-settings";
import { ApiService } from 'src/app/services/api/api.service';
import * as moment from 'moment';
import * as d3 from 'd3'
import { environment } from 'src/environments/environment';

@Component({
  selector: "app-trend",
  templateUrl: "./community.component.html",
  styleUrls: ["./community.component.scss"],
})
export class CommunityComponent implements OnInit {
  @ViewChild("chartEl", { static: false }) public chartEl: ElementRef;

  public dataBySymptoms: any = [];
  public dataByDays: any = [];
  public listOfDays: string[];
  public listOfSymptoms: string[];
  public maxSymptomByDay: number;
  public checkedInPerson: number;

  public reportStart: moment.Moment;
  public reportEnd: moment.Moment;

  public colorsInUse: string[] = [];

  constructor(private apiService: ApiService, private renderer: Renderer) {
    this.checkedInPerson = 1234;
    this.dataBySymptoms = [
      {
        id: "fever",
        name: "Fever",
        value: 5,
        change_rate: -82.14285714285714,
        distribution: {},
        checked: false,
      },
      {
        id: "throat",
        name: "Sore throat",
        value: 3,
        change_rate: -84.21052631578947,
        distribution: {},
        checked: false,
      },
      {
        id: "cough",
        name: "Cough",
        value: 3,
        change_rate: -86.36363636363636,
        distribution: {},
        checked: false,
      },
      {
        id: "muscle_pain",
        name: "Muscle pain",
        value: 2,
        change_rate: 100,
        distribution: {},
        checked: false,
      },
      {
        id: "suggestion_101",
        name: "Sleeplessness (insomnia)",
        value: 1,
        change_rate: -50,
        distribution: {},
        checked: false,
      },
      {
        id: "loss_taste_smell",
        name: "New loss of taste or smell",
        value: 1,
        change_rate: 100,
        distribution: {},
        checked: false,
      },
      {
        id: "suggestion_58",
        name: "Heartburn (pyrosis)",
        value: 0,
        change_rate: -100,
        distribution: {},
        checked: false,
      },
      {
        id: "e46a3314e9466dec61e2bbca4cf8b38bc8dbd58ca031b3a702ef3a43b82deb02",
        name: "Test",
        value: 0,
        change_rate: -100,
        distribution: {},
        checked: false,
      },
      {
        id: "5cfae3932e8ef619a14bca9f49cb1348d0be7ae17aff77117b8fcb3067191a31",
        name: "吃飽太閒",
        value: 0,
        change_rate: -100,
        distribution: {},
        checked: false,
      },
      {
        id: "19155e1e1873ef94470a7c82d83a7fcc56cd904c73234791a5fcaf720f2a79a6",
        name: "Need coffee",
        value: 0,
        change_rate: -100,
        distribution: {},
        checked: false,
      },{
        id: "c29b18bae2991272d820eae4c3f8061bfb5495a2f5a119586f3785b2711d5055",
        name: "Sleepy",
        value: 0,
        change_rate: -100,
        distribution: {}
      }, {
        id: "face",
        name: "Bluish lips or face",
        value: 0,
        change_rate: -100,
        distribution: {}
      }, {
        id: "nasal",
        name: "Nasal congestion",
        value: 0,
        change_rate: -100,
        distribution: {}
      }, {
        id: "2e4a33f963deb6f28ff475891b3441b4b1582479423c655a7e36ce2350f1d442",
        name: "Tired too much",
        value: 0,
        change_rate: -100,
        distribution: {}
      }, {
        id: "a8db5c5202904141d3c86d9ba8e2a9950e49573d5498539829128c9beca32aa1",
        name: "Loss of sense of smell",
        value: 0,
        change_rate: -100,
        distribution: {}
      }, {
        id: "breath",
        name: "Shortness of breath or difficulty breathing",
        value: 0,
        change_rate: -100,
        distribution: {}
      }, {
        id: "fatigue",
        name: "Fatigue or tiredness",
        value: 0,
        change_rate: -100,
        distribution: {}
      }, {
        id: "690d323f97b4f7849c3c3f551b7f9912d99ebde5e77666de1911d56b9c5da440",
        name: "火眼金星",
        value: 0,
        change_rate: -100,
        distribution: {}
      }, {
        id: "chest",
        name: "Chest pain",
        value: 0,
        change_rate: -100,
        distribution: {}
      }
    ];
  }

  ngOnInit() {
    this.getSymptomReport();
  }

  private getSymptomReport() {
    this.reportStart = moment().add(-7, 'days');
    this.reportEnd = moment();

    let start = encodeURIComponent(this.reportStart.toISOString(true));
    let end = encodeURIComponent(this.reportEnd.toISOString(true));

    let endpoint = `${environment.autonomy_api_url}api/report-items?scope=individual&type=symptom&granularity=day&start=${start}&end=${end}`;
    this.apiService
      .request('get', endpoint, null, null, ApiService.DSTarget.CDS)
      .subscribe(
        (data: {report_items: any}) => {
          this.renderChart();
        },
        (err) => {
          // TODO: do something
          console.log(err);
        }
      )
  }

  private renderChart() {
    this.buildKeyLists();
    this.fakeDistribution();
    this.buildDataByDays();
    
    let viewWidth = window.innerWidth > 768 ? 768 : window.innerWidth;
    let margin = {top: 20, right: 20, bottom: 30, left: 40};
    let chartSize = { width: viewWidth - margin.left - margin.right, height: 270 };
    let g = d3.select(this.chartEl.nativeElement)
      .append('svg')
      .attr('width', chartSize.width + margin.left + margin.right)
      .attr('height', chartSize.height + margin.top + margin.bottom)
      .append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    
    // set x scale
    let x = d3.scaleBand()
      .rangeRound([0, chartSize.width])
      .paddingInner(0.05)
      .align(0.1);

    // set y scale
    let y = d3.scaleLinear()
      .rangeRound([chartSize.height, 0]);

    let maxYScale = this.maxSymptomByDay + (5 - this.maxSymptomByDay%5);

    x.domain(this.listOfDays);
    y.domain([0, maxYScale]).nice();

    let dataBySymptoms = this.dataBySymptoms;
    // Draw cell
    g.append('g')
      .selectAll('g')
      .data(d3.stack().keys(this.listOfSymptoms)(this.dataByDays))
      .enter().append('g')
        .each(function(d) {
          let symtomData = dataBySymptoms.find(sd => sd.name === d.key);
          symtomData.chartControl = this;
        })
        .attr('fill', AppSettings.DEFAULT_CHART_COLOR)
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
      .selectAll('rect')
      .data(function(d) { return d; })
      .enter().append('rect')
        .attr('x', <any>function(d) { return x(d.data.day); })
        .attr('y', function(d) { return y(d[1]); })
        .attr('height', function(d) { return y(d[0]) - y(d[1]); })
        .attr('width', x.bandwidth());

    // Draw bottom axis
    g.append('g')
      .attr('class', 'axis chart-text bottom')
      .attr('transform', 'translate(0,' + chartSize.height + ')')
      .call(d3.axisBottom(x).tickFormat(v => moment(v).format('dd').substring(0,1)));

    // Draw left axis
    g.append('g')
        .attr('class', 'axis chart-text left')
        .call(d3.axisLeft(y).ticks(5, 's'));
    
    this.chartEl.nativeElement.querySelector('svg .left path').remove();
    this.chartEl.nativeElement.querySelector('svg .left g').remove();
    this.chartEl.nativeElement.querySelectorAll('svg .axis g line').forEach(el => el.remove());

    this.chartEl.nativeElement.querySelector('svg .bottom path').remove();
    d3.select(this.chartEl.nativeElement.querySelector("svg .bottom"))
      .append("path")
      .attr("d", `M-10,0H0,${chartSize.width + 5}`)
      .attr("stroke", "#828180")
      .attr("stroke-width", 1)
      .attr("fill", "#828180");
  }

  private buildKeyLists() {
    this.listOfDays = [];
    let dayCounter = moment(this.reportStart);
    for (let i = 0; i < 7; i++) {
      this.listOfDays.push(dayCounter.format('YYYY-MM-DD'));
      dayCounter.add(1, 'days');
    }

    this.listOfSymptoms = this.dataBySymptoms.map(symptomData => symptomData.name);
  }

  private fakeDistribution() {
    this.dataBySymptoms.forEach((symptomData) => {
      this.listOfDays.forEach(day => {
        symptomData.distribution[day] = Math.floor(Math.random() * 7);
      });
    });
  }

  private buildDataByDays() {
    this.maxSymptomByDay = 0;
    this.listOfDays.forEach((day: string) => {
      let dayData = {day};
      let totalSymptom = 0;
      this.dataBySymptoms.forEach(symptom => {
        dayData[symptom.name] = symptom.distribution[day] || 0;
        totalSymptom += dayData[symptom.name];
      });
      if (totalSymptom > this.maxSymptomByDay) {
        this.maxSymptomByDay = totalSymptom;
      }
      this.dataByDays.push(dayData);
    });
  }

  private addColor() {
    let color: string;
    if (this.colorsInUse.length < AppSettings.CHART_COLORS.length) {
      color = AppSettings.CHART_COLORS.find(c => this.colorsInUse.indexOf(c) === -1);
      this.colorsInUse.push(color);
    } else {
      color = this.colorsInUse[0];
      this.colorsInUse.shift();
      this.colorsInUse.push(color);
    }
    return color;
  }

  private removeColor(color: string) {
    let colorIndex = this.colorsInUse.indexOf(color);
    if (colorIndex !== -1) {
      this.colorsInUse.splice(colorIndex, 1);
    }
  }

  public selectSymptom(symptomData) {
    if (symptomData.chartShown) {
      symptomData.chartShown = false;
      this.removeColor(symptomData.chartColor);
      d3.select(symptomData.chartControl).attr('fill', AppSettings.DEFAULT_CHART_COLOR);
    } else {
      let color = this.addColor();
      let sameColorSymptom = this.dataBySymptoms.find(symptom => symptom.chartColor === color);
      if (sameColorSymptom) {
        sameColorSymptom.chartColor = null;
        sameColorSymptom.chartShown = false;
        d3.select(sameColorSymptom.chartControl).attr('fill', AppSettings.DEFAULT_CHART_COLOR);
      }
      symptomData.chartShown = true;
      symptomData.chartColor = color;
      d3.select(symptomData.chartControl).attr('fill', color);
    }
  }
}
