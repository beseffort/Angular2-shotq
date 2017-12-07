import { Observable } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  inject,
  async,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
  BaseRequestOptions,
  ConnectionBackend,
  Http
} from '@angular/http';
import { MockBackend } from '@angular/http/testing';

/**
 * Load the implementations that should be tested.
 */
import { PackageCategoryService } from '../../../../../services/product/package-category';
import { PackageCategory } from '../../../../../models/package-category';
import { PackageDescriptionFormComponent } from './package-description-form.component';

describe('PackageDescriptionFormComponent', () => {
  let comp: PackageDescriptionFormComponent;
  let fixture: ComponentFixture<PackageDescriptionFormComponent>;
  let packageCategoryServiceStub = {
    getList: (): Observable<{results: PackageCategory[]}> => {
      return Observable.of({results: [
        {id: 1, name: 'cat1', account: 1}
      ]});
    }
  }

  /**
   * async beforeEach.
   */
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PackageDescriptionFormComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        BaseRequestOptions,
        MockBackend,
        {
          provide: Http,
          useFactory: (backend: ConnectionBackend, defaultOptions: BaseRequestOptions) => {
            return new Http(backend, defaultOptions);
          },
          deps: [MockBackend, BaseRequestOptions]
        },
        FormBuilder,
        {
          provide: PackageCategoryService,
          useValue: packageCategoryServiceStub
        }
      ]
    })
    /**
     * Compile template and css.
     */
    .compileComponents();
  }));

  /**
   * Synchronous beforeEach.
   */
  beforeEach(() => {
    fixture = TestBed.createComponent(PackageDescriptionFormComponent);
    comp = fixture.componentInstance;
    comp.package = {
      name: 'test package',
      account: 1,
      price: 10.1,
      categories: [1]
    };
    /**
     * Trigger initial data binding.
     */
    fixture.detectChanges();
  });

  it('package categories should not be blank', () => {
    expect(comp.packageCategories).toEqual([
      { id: 1, name: 'cat1' }
    ]);
  });

  it('the name field must be filled', () => {
    expect(comp.form.controls['name'].value).toEqual('test package');
  });

});
