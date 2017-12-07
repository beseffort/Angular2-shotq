import { NgModule } from '@angular/core';
import { CalendarFilterComponent } from './calendar-filter/calendar-filter.component';
import { CalendarHeaderComponent } from './calendar-header/calendar-header.component';
import { CalendarModule } from 'ap-angular2-fullcalendar';
import { CalendarEntryComponent } from './calendar-entry/calendar-entry.component';
import { CalendarFullcalendarComponent } from './calendar-fullcalendar/calendar-fullcalendar.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownSelectModule } from '../shared/dropdown-select/dropdown-select.module';

/* Directives */
@NgModule({
  imports: [
    CalendarModule.forRoot(),
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DropdownSelectModule
  ],
  declarations: [
    CalendarEntryComponent,
    CalendarHeaderComponent,
    CalendarFilterComponent,
    CalendarFullcalendarComponent,
  ],
  entryComponents: [
  ],
  exports: [
  ],
  providers: [
  ]
})
export class CalendarEntryModule {
}
