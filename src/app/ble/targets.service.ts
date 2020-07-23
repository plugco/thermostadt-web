import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { map } from 'rxjs/operators';

import {
    thermostadtService,
    thermostadtServiceChars,
} from './uuids';

export const errorMessages = {
    notConnected: 'Not connected to a device',
    charNotFound: 'Characteristic not found on device',
    connInProgress: 'Connection already in progress',
};

@Injectable({
    providedIn: 'root'
})
export class TargetsService {
    connecting = false;
    disconnecting: BluetoothDevice;

    private connectedSubj = new BehaviorSubject<BluetoothDevice>(undefined);
    private chars = new Map<string, BluetoothRemoteGATTCharacteristic>();
    private onGattserverdisconnected: (ev: Event) => void;

    get connected() {
        return this.connectedSubj.value;
    }
    get connectedObs() {
        return this.connectedSubj.asObservable();
    }

    get connectedBool() {
        return Boolean(this.connectedSubj.value);
    }
    get connectedBoolObs() {
        return this.connectedSubj.asObservable().pipe(map(v => !!v));
    }

    read = async (svc: string | number, char: string | number, maxRetries = 10, retryDelay = 100) => {
        if (!this.connectedSubj.value || !this.connectedSubj.value.gatt || !this.connectedSubj.value.gatt.connected) {
            throw new DOMException(errorMessages.notConnected, 'NetworkError');
        }
        const gattChar = this.chars.get(`${svc}/${char}`);
        if (!gattChar) {
            throw new DOMException(errorMessages.charNotFound, 'NetworkError');
        }
        let retries = 0;
        for (; ;) {
            try {
                let value = (await gattChar.readValue()) as ArrayBuffer | DataView;
                if (!('buffer' in value)) {
                    value = new DataView(value);
                }
                return value;
            }
            catch (err) {
                console.warn(err);
                if (!err || err.name !== 'NetworkError' || !this.connectedSubj.value
                    || !this.connectedSubj.value.gatt || !this.connectedSubj.value.gatt.connected) {
                    throw err;
                }
                await timer(retryDelay).toPromise();
                ++retries;
                if (retries >= maxRetries) {
                    throw err;
                }
            }
        }
    }

    write = async (svc: string | number, char: string | number, value: BufferSource, maxRetries = 10, retryDelay = 100) => {
        if (!this.connectedSubj.value || !this.connectedSubj.value.gatt || !this.connectedSubj.value.gatt.connected) {
            throw new DOMException(errorMessages.notConnected, 'NetworkError');
        }
        const gattChar = this.chars.get(`${svc}/${char}`);
        if (!gattChar) {
            throw new DOMException(errorMessages.charNotFound, 'NetworkError');
        }
        let retries = 0;
        for (; ;) {
            try {
                await gattChar.writeValue(value);
                return;
            }
            catch (err) {
                console.warn(err);
                if (!err || err.name !== 'NetworkError' || !this.connectedSubj.value
                    || !this.connectedSubj.value.gatt || !this.connectedSubj.value.gatt.connected) {
                    throw err;
                }
                await timer(retryDelay).toPromise();
                ++retries;
                if (retries >= maxRetries) {
                    throw err;
                }
            }
        }
    }

    connect = async () => {
        if (this.connecting) {
            throw new DOMException(errorMessages.connInProgress, 'NetworkError');
        }
        if (this.connectedSubj.value) {
            this.connectedSubj.value.gatt.disconnect();
            this.connectedSubj.next(undefined);
            this.chars.clear();
        }
        this.connecting = true;
        try {
            const dev = await navigator.bluetooth.requestDevice({
                filters: [{ services: [thermostadtService], }],
                optionalServices: [thermostadtService],
            });
            console.log('Connected to device', dev);
            this.onGattserverdisconnected = (ev) => {
                console.log('GATT server disconnected', ev);
                if (this.disconnecting === dev) {
                    this.disconnecting = undefined;
                }
                if (this.connectedSubj.value === dev) {
                    console.log('Cleaning up connected device', dev);
                    this.connectedSubj.value.removeEventListener('gattserverdisconnected', this.onGattserverdisconnected);
                    this.chars.clear();
                    this.onGattserverdisconnected = undefined;
                    this.connectedSubj.next(undefined);
                }
            }
            dev.addEventListener('gattserverdisconnected', this.onGattserverdisconnected);
            await dev.gatt.connect();
            try {
                const svc = await dev.gatt.getPrimaryService(thermostadtService);
                // theoretically should be done in parallel but this seems less likely to trip over bugs
                try {
                    for (const char of await svc.getCharacteristics()) {
                        this.chars.set(`${char.service.uuid}/${char.uuid}`, char);
                    }
                }
                catch {
                    // some implementations don't have a working getCharacteristics, so we use a slower workaround
                    for (const charUuid of thermostadtServiceChars) {
                        try {
                            const char = await svc.getCharacteristic(charUuid);
                            this.chars.set(`${char.service.uuid}/${char.uuid}`, char);
                        }
                        catch { }
                    }
                }
            }
            catch { }

            this.connectedSubj.next(dev);
        }
        finally {
            this.connecting = false;
        }
    }

    disconnect = async () => {
        if (this.connectedSubj.value) {
            this.disconnecting = this.connectedSubj.value;
            this.connectedSubj.value.gatt.disconnect();
        }
    }
}
