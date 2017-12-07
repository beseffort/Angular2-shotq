import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'products-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss']
})
export class ProductsSearchFormComponent implements OnInit {
  @Input() value: string;
  @Output() updateSearchParams: EventEmitter<string> = new EventEmitter<string>();
  form: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.form = this.fb.group({
      search: [this.value]
    });
    this.form.valueChanges.debounceTime(300).subscribe((changes) => {
      this.updateSearchParams.emit(changes);
    });
  }

  clearSearchInput() {
    this.form.patchValue({search: ''});
  }

}
