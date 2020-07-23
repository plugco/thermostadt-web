import { Component, Input } from '@angular/core';
import { filter } from 'rxjs/operators';
import { TargetsService } from '../ble/targets.service';

@Component({
    selector: 'app-uint-edit',
    templateUrl: './uint-edit.component.html',
})
export class UintEditComponent {
    @Input() name: string;
    @Input() svc: string;
    @Input() char: string;
    @Input() readOnly = false;
    @Input() fractionDigits = 0;
    @Input() multiplier = 1;
    @Input() unit = '';

    constructor(private _targets: TargetsService) {
        _targets.connectedBoolObs.pipe(filter(v => !v)).subscribe(() => this._isLoaded = false);
    }

    private _value = NaN;
    private _isLoaded = false;

    get isLoaded() {
        return this._isLoaded;
    }

    get textValue() {
        if (isNaN(this._value)) {
            return '';
        }
        return (this._value * this.multiplier).toFixed(this.fractionDigits);
    }

    get placeholder() {
        if (isNaN(this._value)) {
            return '';
        }
        return (this._value * this.multiplier).toFixed(this.fractionDigits);
    }

    get step() {
        return Math.pow(10, -this.fractionDigits);
    }

    onChange(str: string) {
        if (this._isLoaded && !this.readOnly && str !== this.textValue) {
            this._value = parseFloat(str) / this.multiplier;
            this.save().catch(console.warn);
        }
    }
    load = async () => {
        try {
            const view = await this._targets.read(this.svc, this.char);
            this._value = view.getUint32(0, true);
            this._isLoaded = true;
        }
        catch (err) {
            console.warn(err);
            this._value = NaN;
        }
    }

    save = async () => {
        const ab = new ArrayBuffer(4);
        const view = new DataView(ab);
        view.setUint32(0, this._value, true);
        try {
            await this._targets.write(this.svc, this.char, ab);
        }
        catch (err) {
            console.warn(err);
        }
        await this.load();
    }
}
