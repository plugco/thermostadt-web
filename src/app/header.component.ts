import { Component } from '@angular/core';
import { TargetsService } from './ble/targets.service';

@Component({
    selector: 'app-header',
    templateUrl: 'header.component.html',
})
export class AppHeaderComponent {
    constructor(
        public targets: TargetsService,
    ) {}
}
