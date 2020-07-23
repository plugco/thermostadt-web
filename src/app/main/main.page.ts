import { Component, QueryList, ViewChildren } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { timer } from 'rxjs';

import { TargetsService } from '../ble/targets.service';
import { OutputsDisplayComponent } from '../controls/outputs-display.component';
import { UintEditComponent } from '../controls/uint-edit.component';
import { RepconService } from '../repcon.service';
import { asString } from '../util';

const minRefreshDelay = 500;

@Component({
    selector: 'app-main',
    templateUrl: 'main.page.html',
})
export class MainPage {
    constructor(
        private _platform: Platform,
        public targets: TargetsService,
        private toast: ToastController,
        public repcon: RepconService,
    ) { }

    @ViewChildren(OutputsDisplayComponent) private _outputsDisplays: QueryList<OutputsDisplayComponent>;
    @ViewChildren(UintEditComponent) private _uintEdits: QueryList<UintEditComponent>;

    protected afterEnter: () => Promise<void>;
    protected beforeLeave: () => Promise<void>;

    private _terminate = false;

    ionViewDidEnter = async () => {
        this._terminate = false;
        await this._platform.ready();
        if (this.afterEnter) {
            await this.afterEnter();
        }
        const edits = [
            ...this._outputsDisplays.toArray(),
            ...this._uintEdits.toArray(),
        ];
        while (!this._terminate) {
            for (const edit of edits) {
                if (this.targets.connectedBool) {
                    await edit.load();
                }
            }
            await timer(minRefreshDelay).toPromise();
        }
    }

    ionViewWillLeave() {
        if (this.beforeLeave) {
            this.beforeLeave().catch(console.error);
        }
        this._terminate = true;
    }

    get connUi() {
        if (this.targets.connecting) {
            return {
                text: 'Connecting',
                icon: '',
                spinner: true,
            };
        }
        if (this.targets.disconnecting) {
            return {
                text: 'Disconnecting',
                icon: '',
                spinner: true,
            };
        }
        if (this.targets.connected) {
            return {
                text: 'Connected',
                icon: 'log-out',
                spinner: false,
            };
        }
        return {
            text: 'Disconnected',
            icon: 'log-in',
            spinner: false,
        };
    }

    get cannotToggleConnection() {
        return this.targets.connecting || this.targets.disconnecting;
    }

    async toggleConnection() {
        if (this.cannotToggleConnection) {
            return;
        }

        if (this.targets.connected) {
            await this.disconnect();
        }
        else {
            await this.connect();
        }
    }

    async connect() {
        try {
            await this.targets.connect();
        }
        catch (err) {
            try {
                console.log(err);
            }
            catch {
                console.log(asString(err));
            }
            if (!err || err.name !== 'NotFoundError') {
                const toast = await this.toast.create({
                    header: 'Connect failed',
                    message: `Error: ${asString(err)}`,
                    buttons: ['OK'],
                    duration: 15000,
                });
                await toast.present();
            }
        }
    }

    async disconnect() {
        try {
            await this.targets.disconnect();
        }
        catch (err) {
            try {
                console.log(err);
            }
            catch {
                console.log(asString(err));
            }
            const toast = await this.toast.create({
                header: 'Disconnect failed',
                message: `Error: ${asString(err)}`,
                buttons: ['OK'],
                duration: 3000,
            });
            await toast.present();
        }
    }
}
