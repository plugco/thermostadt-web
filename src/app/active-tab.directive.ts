import { Directive, HostBinding, ElementRef, SimpleChanges, Input, Attribute } from '@angular/core';

@Directive({
    selector: '[appActiveTab]'
})
export class ActiveTabDirective {
    @HostBinding('class.active') active = false;
    @Input() appActiveTab: string;

    constructor(@Attribute('tab') private tab: string) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.appActiveTab) {
            this.active = this.appActiveTab === this.tab;
        }
    }
}
