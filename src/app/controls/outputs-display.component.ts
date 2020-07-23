import { Component, Input } from '@angular/core';
import { filter } from 'rxjs/operators';
import { TargetsService } from '../ble/targets.service';

@Component({
    selector: 'app-outputs-display',
    templateUrl: './outputs-display.component.html',
})
export class OutputsDisplayComponent {
    @Input() name: string;
    @Input() svc: string;
    @Input() char: string;

    constructor(private _targets: TargetsService) {
        _targets.connectedBoolObs.pipe(filter(v => !v)).subscribe(() => this._isLoaded = false);
    }

    private _value = 0;
    private _isLoaded = false;

    get isLoaded() {
        return this._isLoaded;
    }

    get heating() {
        return !!(this._value & 0x1);
    }

    get cooling() {
        return !!(this._value & 0x2);
    }

    get humidifying() {
        return !!(this._value & 0x4);
    }

    get dehumidifying() {
        return !!(this._value & 0x8);
    }

    load = async () => {
        try {
            const view = await this._targets.read(this.svc, this.char);
            this._value = view.getUint8(0);
            this._isLoaded = true;
        }
        catch (err) {
            console.warn(err);
            this._value = 0;
        }
    }
}
