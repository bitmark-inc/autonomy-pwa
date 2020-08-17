declare var window: any;

import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { AppSettings } from "../../app-settings";
import { ApiService } from 'src/app/services/api/api.service';
import * as moment from 'moment';
import * as d3 from 'd3'
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/services/user/user.service';
import { NoInternetErrors } from 'src/app/errors';

enum NotificationPermissionState { None, Allowed, Denied, NotSupported, NoThanks };

@Component({
  selector: "app-trend",
  templateUrl: "./community.component.html",
  styleUrls: ["./community.component.scss"],
})
export class CommunityComponent implements OnInit {
  @ViewChild("chartEl") public chartEl: ElementRef;

  public isdownloadIRB: boolean = false;
  public dataBySymptoms: any = [];
  public dataByDays: any = [];
  public listOfDays: string[];
  public listOfSymptoms: string[];
  public maxSymptomByDay: number;
  public checkedInPerson: number;

  public reportStart: moment.Moment;
  public reportEnd: moment.Moment;

  public colorsInUse: string[] = [];

  public NotificationPermissionState = NotificationPermissionState;
  public notificationPermissionState: NotificationPermissionState;
  public isNotificationPermissionActive: boolean = false;

  constructor(private userService: UserService, private apiService: ApiService, private ref: ChangeDetectorRef) {
    this.initOneSignal();
  }

  ngOnInit() {
    this.getSymptomReport();
  }

  private getSymptomReport() {
    this.reportStart = moment().add(-7, 'days');
    this.reportEnd = moment();

    let start = encodeURIComponent(this.reportStart.toISOString(true));
    let end = encodeURIComponent(this.reportEnd.toISOString(true));

    let endpoint = `${environment.autonomy_api_url}api/report-items?type=symptom&granularity=day`;
    this.apiService
      .request('get', endpoint, null, null, ApiService.DSTarget.CDS)
      .subscribe(
        (data: {checkins_num_past_three_days: number,report_items: any}) => {
          this.checkedInPerson = data.checkins_num_past_three_days;
          this.dataBySymptoms = data.report_items;

          // default fill color for first 6 symptoms
          for (let i = 0; i < AppSettings.CHART_COLORS.length; i++) {
            if (this.dataBySymptoms[i]) {
              this.dataBySymptoms[i].chartColor = this.addColor();
              this.dataBySymptoms[i].chartShown = true;
            }
          }
          this.renderChart();
        },
        (err) => {
          // TODO: do something
          if (err instanceof NoInternetErrors) {
            window.alert(err.message);
          } else {
            console.log(err);
          }
        }
      )
  }

  private renderChart() {
    this.buildKeyLists();
    this.buildDataByDays();
    
    let viewWidth = window.innerWidth > 768 ? 768 : window.innerWidth;
    let margin = {top: 20, right: 40, bottom: 30, left: 20};
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
        .attr('transform', `translate(${chartSize.width}, 0)`)
        .call(d3.axisRight(y).ticks(5, 's'));
    
    this.chartEl.nativeElement.querySelector('svg .left path').remove();
    this.chartEl.nativeElement.querySelector('svg .left g').remove();
    this.chartEl.nativeElement.querySelectorAll('svg .axis g line').forEach(el => el.remove());

    this.chartEl.nativeElement.querySelector('svg .bottom path').remove();
    d3.select(this.chartEl.nativeElement.querySelector("svg .bottom"))
      .append("path")
      .attr("d", `M-0,0H0,${chartSize.width + 25}`)
      .attr("stroke", "#EDEDED")
      .attr("stroke-width", 1)
      .attr("fill", "#EDEDED");

    this.dataBySymptoms.forEach(sym => {
      sym.chartColor = sym.chartColor || AppSettings.DEFAULT_CHART_COLOR;
      d3.select(sym.chartControl).attr('fill', sym.chartColor);
    })
  }

  private buildKeyLists() {
    // render 7 days from the last day had data
    let reportEndDay: any = Object.keys(this.dataBySymptoms[0].distribution)[0];
    this.dataBySymptoms.forEach(symp => {
      Object.keys(symp.distribution).forEach(day => {
        if (moment(day).isAfter(reportEndDay, 'day')) {
          reportEndDay = day;
        }
      })
    })

    let reportStartDay = moment(reportEndDay).add(-6, 'days');

    this.listOfDays = [];
    let dayCounter = moment(reportStartDay);
    for (let i = 0; i < 7; i++) {
      this.listOfDays.push(dayCounter.format('YYYY-MM-DD'));
      dayCounter.add(1, 'days');
    }

    this.listOfSymptoms = this.dataBySymptoms.map(symptomData => symptomData.name);
  }

  private buildDataByDays() {
    this.maxSymptomByDay = 0;
    this.listOfDays.forEach((day: string) => {
      let dayData = {day};
      let totalSymptom = 0;
      this.dataBySymptoms.forEach(symptom => {
        dayData[symptom.name] = symptom.distribution && symptom.distribution[day] ? symptom.distribution[day] : 0;
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

  // ======== WORK WITH ONESIGNAL
  private initOneSignal() {
    this.notificationPermissionState = this.userService.getPreference('notification-permission') || NotificationPermissionState.None;
    console.log(this.notificationPermissionState);

    if (this.notificationPermissionState != NotificationPermissionState.NoThanks) {
      window.OneSignal.push(() => {
        var isPushSupported = window.OneSignal.isPushNotificationsSupported();
        console.log(`Push notification is ${isPushSupported ? '' : 'not '}supported`);
  
        if (!isPushSupported) {
          this.notificationPermissionState = NotificationPermissionState.NotSupported;
          return;
        }
        // getNotificationPermission from OneSignal has a bug that return `default` if users denied
  
        switch (Notification.permission) {
          case 'default':
            this.notificationPermissionState = NotificationPermissionState.None;
            this.listenOnSubscriptionChange();
            break;
          case 'granted':
            this.notificationPermissionState = NotificationPermissionState.Allowed;
            break;
          case 'denied':
            this.notificationPermissionState = NotificationPermissionState.Denied;
            break;  
        }
      });
    }
  }

  public askForNotificationPermission() {
    window.OneSignal.push(() => {
      this.isNotificationPermissionActive = true;
      window.OneSignal.showNativePrompt();
    });
  }

  public listenOnSubscriptionChange(): void {
    window.OneSignal.push(() => {
      window.OneSignal.on('subscriptionChange', (isSubscribed: boolean) => {
        console.log('Subscription changed: ', isSubscribed);
        if (this.notificationPermissionState !== NotificationPermissionState.Allowed && isSubscribed) {
          this.userService.submitOneSignalTag();
        }
        this.notificationPermissionState = isSubscribed ? NotificationPermissionState.Allowed : NotificationPermissionState.Denied;
        this.ref.detectChanges();
      });
    });
  }

  public declinedNotificationPermission() {
    this.notificationPermissionState = NotificationPermissionState.NoThanks;
    this.userService.setPreference('notification-permission', this.notificationPermissionState);
  }

}
