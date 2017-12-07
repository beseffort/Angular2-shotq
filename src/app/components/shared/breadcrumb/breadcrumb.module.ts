import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule }        			 from '@angular/common';
import { BreadcrumbComponent } 			 from './components/breadcrumb.component';
import { BreadcrumbService } 			 from './components/breadcrumb.service';

export * from './components/breadcrumb.component';
export * from './components/breadcrumb.service';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        BreadcrumbComponent
    ],
    exports: [
        BreadcrumbComponent
    ]
})
export class BreadcrumbModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: BreadcrumbModule,
            providers: [BreadcrumbService]
        };
    }
}
