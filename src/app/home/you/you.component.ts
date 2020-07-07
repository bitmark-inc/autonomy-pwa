declare var window: any;

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AppSettings } from "../../app-settings";
import { ApiService } from 'src/app/services/api/api.service';
import * as moment from 'moment';
import * as d3 from 'd3'

@Component({
  selector: 'app-you',
  templateUrl: './you.component.html',
  styleUrls: ['./you.component.scss']
})
export class YouComponent implements OnInit {
  @ViewChild('chartEl', {static: false}) public chartEl: ElementRef;

  public chartColors: any = [];

  public dataBySymptoms: any = [];
  public dataByDays: any = [];
  public listOfDays: string[];
  public listOfSymptoms: string[];
  public maxSymptomByDay: number;

  public reportStart: moment.Moment;
  public reportEnd: moment.Moment;

  constructor(private apiService: ApiService) {
    this.chartColors = AppSettings.CHART_COLORS;
    this.dataBySymptoms = [{
        "id": "fever",
        "name": "Fever",
        "value": 5,
        "change_rate": -82.14285714285714,
        "distribution": {},
        "checked": false
      }, {
        "id": "throat",
        "name": "Sore throat",
        "value": 3,
        "change_rate": -84.21052631578947,
        "distribution": {},
        "checked": false,
      }, {
        "id": "cough",
        "name": "Cough",
        "value": 3,
        "change_rate": -86.36363636363636,
        "distribution": {},
        "checked": false
      }, {
        "id": "muscle_pain",
        "name": "Muscle pain",
        "value": 2,
        "change_rate": 100,
        "distribution": {},
        "checked": false
      }, {
        "id": "suggestion_101",
        "name": "Sleeplessness (insomnia)",
        "value": 1,
        "change_rate": -50,
        "distribution": {},
        "checked": false
      }, {
        "id": "loss_taste_smell",
        "name": "New loss of taste or smell",
        "value": 1,
        "change_rate": 100,
        "distribution": {},
        "checked": false
      }, {
        "id": "suggestion_58",
        "name": "Heartburn (pyrosis)",
        "value": 0,
        "change_rate": -100,
        "distribution": {},
        "checked": false
      }, {
        "id": "e46a3314e9466dec61e2bbca4cf8b38bc8dbd58ca031b3a702ef3a43b82deb02",
        "name": "Test",
        "value": 0,
        "change_rate": -100,
        "distribution": {},
        "checked": false
      }, {
        "id": "5cfae3932e8ef619a14bca9f49cb1348d0be7ae17aff77117b8fcb3067191a31",
        "name": "吃飽太閒",
        "value": 0,
        "change_rate": -100,
        "distribution": {},
        "checked": false
      }, {
        "id": "19155e1e1873ef94470a7c82d83a7fcc56cd904c73234791a5fcaf720f2a79a6",
        "name": "Need coffee",
        "value": 0,
        "change_rate": -100,
        "distribution": {},
        "checked": false
      }]
  }

  ngOnInit() {
    this.getPersonalReport();
  }

  private getPersonalReport() {
    this.reportStart = moment().add(-7, 'days');
    this.reportEnd = moment();

    let start = encodeURIComponent(this.reportStart.toISOString(true));
    let end = encodeURIComponent(this.reportEnd.toISOString(true));

    let endpoint = `api/report-items?scope=individual&type=symptom&granularity=day&start=${start}&end=${end}`;
    this.apiService
      .request('get', endpoint)
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
    
    let margin = {top: 20, right: 20, bottom: 30, left: 40};
    let chartSize = {width: 350, height: 350};
    let g = d3.select(this.chartEl.nativeElement)
      .append("svg")
      .attr("width", chartSize.width + margin.left + margin.right)
      .attr("height", chartSize.height + margin.top + margin.bottom)
      .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    // set x scale
    let x = d3.scaleBand()
      .rangeRound([0, chartSize.width])
      .paddingInner(0.05)
      .align(0.1);

    // set y scale
    let y = d3.scaleLinear()
      .rangeRound([chartSize.height, 0]);

    // set the colors
    let z = d3.scaleOrdinal()
      .range(this.chartColors);

    let maxYScale = this.maxSymptomByDay + (5 - this.maxSymptomByDay%5);

    x.domain(this.listOfDays);
    y.domain([0, maxYScale]).nice();
    z.domain(this.chartColors);

    g.append("g")
      .selectAll("g")
      .data(d3.stack().keys(this.listOfSymptoms)(this.dataByDays))
      .enter().append("g")
        .each(function(d) {
          console.log(d);
        })
        .attr("fill", <any>function(d) { return z(d.key); })
      .selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
        .attr("x", <any>function(d) { return x(d.data.day); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("width", x.bandwidth());

    g.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + chartSize.height + ")")
      .call(d3.axisBottom(x).tickFormat(v => moment(v).format('dd').substring(0,1)));
  
    g.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y).ticks(5, "s"))
      .append("text")
        .attr("x", 2)
        .attr("y", y(y.ticks().pop()) + 0.5)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start");
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
        symptomData.distribution[day] = Math.floor(Math.random() * 2);
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

  public selectSymptom(symptom) {
    symptom.checked = !symptom.checked;
  }

}
