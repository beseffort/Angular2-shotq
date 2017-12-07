import { NgModule }               from '@angular/core';
import { DatePipe }               from '@angular/common';

/* Pipes */
import { HumanizePipe }           from './humanize/humanize.pipe';
import { HighlightPipe }           from './highlight/highlight.pipe';
import { CapitalizePipe }         from './capitalize/capitalize.pipe';
import { KeysPipe }               from './object-it/keys.pipe';
import { FilterByPipe }           from './filter-by/filter-by.pipe';
import { ArrayFilterPipe }        from './array-filter/array-filter.pipe';
import { TruncateWordsPipe }      from './truncate/truncate-words.pipe';
import { TruncateCharactersPipe } from './truncate/truncate-characters.pipe';
import { SafeHtmlPipe }           from './safe-html/safe-html.pipe';
import { CustomDatePipe }         from './custom-date/custom-date.pipe';
import { SafeUrlPipe } from './safe-url/safe-url.pipe';
import { GroupByPipe } from './group-by/group-by.pipe';
import { UTCDatePipe } from './utc-date';
import { SortPipe } from './sort/sort.pipe';
import { PhonePipe } from './phone/phone.pipe';

const PIPES = [
  HumanizePipe,
  HighlightPipe,
  CapitalizePipe,
  KeysPipe,
  FilterByPipe,
  ArrayFilterPipe,
  TruncateWordsPipe,
  TruncateCharactersPipe,
  SafeHtmlPipe,
  CustomDatePipe,
  SafeUrlPipe,
  GroupByPipe,
  UTCDatePipe,
  SortPipe,
  PhonePipe
];

@NgModule({
  imports: [],
  declarations: [
    ...PIPES
  ],
  exports: [
    ...PIPES
  ],
  providers: [DatePipe]
})
export class PipesModule {
}
