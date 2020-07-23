import { Component } from '@angular/core';
import { RepconService } from '../repcon.service';

@Component({
    selector: 'app-repcon',
    templateUrl: 'repcon.page.html',
})
export class RepconPage {
    constructor(public repcon: RepconService) { }
}
