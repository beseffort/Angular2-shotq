import {
  Component, EventEmitter, Input, OnInit, Output,
} from '@angular/core';

@Component({
  selector: 'calendar-header',
  templateUrl: './calendar-header.component.html',
  styleUrls: ['./calendar-header.component.scss'],
  providers: []
})
export class CalendarHeaderComponent implements OnInit {
  @Input() title: string;
  @Input() view: string;
  @Output() onChangeViewButtonClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() onNextButtonClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() onPrevButtonClicked: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}

  ngOnInit() {}

  changeView(view) {
    this.onChangeViewButtonClicked.emit(view);
  }

  next() {
    this.onNextButtonClicked.emit();
  }

  prev() {
    this.onPrevButtonClicked.emit();
  }
}

