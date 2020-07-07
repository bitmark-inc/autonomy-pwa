import { Component, OnInit } from '@angular/core';
import { AppSettings } from "../../app-settings";

@Component({
  selector: 'app-you',
  templateUrl: './you.component.html',
  styleUrls: ['./you.component.scss']
})
export class YouComponent implements OnInit {
  public symptoms: any = [];
  public chartColors: any = [];

  constructor() {
    this.chartColors = AppSettings.CHARTCOLORS;
    this.symptoms = [{
        "id": "fever",
        "name": "Fever",
        "value": 5,
        "change_rate": -82.14285714285714,
        "distribution": {
          "2020-06-15": 1,
          "2020-06-16": 1,
          "2020-06-17": 1
        },
        "checked": false
      }, {
        "id": "throat",
        "name": "Sore throat",
        "value": 3,
        "change_rate": -84.21052631578947,
        "distribution": {
          "2020-06-16": 1,
          "2020-06-17": 1,
          "2020-06-19": 1
        },
        "checked": false,
      }, {
        "id": "cough",
        "name": "Cough",
        "value": 3,
        "change_rate": -86.36363636363636,
        "distribution": {
          "2020-06-15": 1,
          "2020-06-16": 1,
          "2020-06-17": 1,
          "2020-06-18": 1,
          "2020-06-19": 1,
          "2020-06-20": 1,
          "2020-06-21": 1
        },
        "checked": false
      }, {
        "id": "muscle_pain",
        "name": "Muscle pain",
        "value": 2,
        "change_rate": 100,
        "distribution": {
          "2020-06-20": 1,
          "2020-06-21": 1
        },
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
      }, {
        "id": "c29b18bae2991272d820eae4c3f8061bfb5495a2f5a119586f3785b2711d5055",
        "name": "Sleepy",
        "value": 0,
        "change_rate": -100,
        "distribution": {},
        "checked": false
      }, {
        "id": "face",
        "name": "Bluish lips or face",
        "value": 0,
        "change_rate": -100,
        "distribution": {},
        "checked": false
      }, {
        "id": "nasal",
        "name": "Nasal congestion",
        "value": 0,
        "change_rate": -100,
        "distribution": {},
        "checked": false
      }, {
        "id": "2e4a33f963deb6f28ff475891b3441b4b1582479423c655a7e36ce2350f1d442",
        "name": "Tired too much",
        "value": 0,
        "change_rate": -100,
        "distribution": {},
        "checked": false
      }, {
        "id": "a8db5c5202904141d3c86d9ba8e2a9950e49573d5498539829128c9beca32aa1",
        "name": "Loss of sense of smell",
        "value": 0,
        "change_rate": -100,
        "distribution": {},
        "checked": false
      }, {
        "id": "breath",
        "name": "Shortness of breath or difficulty breathing",
        "value": 0,
        "change_rate": -100,
        "distribution": {},
        "checked": false
      }, {
        "id": "fatigue",
        "name": "Fatigue or tiredness",
        "value": 0,
        "change_rate": -100,
        "distribution": {},
        "checked": false
      }, {
        "id": "690d323f97b4f7849c3c3f551b7f9912d99ebde5e77666de1911d56b9c5da440",
        "name": "火眼金星",
        "value": 0,
        "change_rate": -100,
        "distribution": {},
        "checked": false
      }, {
        "id": "chest",
        "name": "Chest pain",
        "value": 0,
        "change_rate": -100,
        "distribution": {},
        "checked": false
      }]
  }

  ngOnInit() {
  }

  public selectSymptom(symptom) {
    symptom.checked = !symptom.checked;
  }

}
