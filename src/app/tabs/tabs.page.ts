import { Component, isDevMode } from '@angular/core';
import { TargetsService } from '../ble/targets.service';
import { RepconService } from '../repcon.service';

@Component({
    selector: 'app-tabs',
    templateUrl: 'tabs.page.html',
})
export class TabsPage {
    activeTab: string;

    constructor(
        public repcon: RepconService,
        public targets: TargetsService,
    ) { }

    get isDevMode() {
        return isDevMode();
    }

    onTabsWillChange() {
        this.activeTab = undefined;
    }

    onTabsDidChange(event: { tab: string }) {
        this.activeTab = event.tab;
    }
}
