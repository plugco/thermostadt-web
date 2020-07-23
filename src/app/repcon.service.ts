import { Injectable } from '@angular/core';

import { asString } from './util';

const messageTypes = ['info', 'log', 'warn', 'error'] as const;
export type RepconMessageType = typeof messageTypes[number];

export class RepconMessage {
    constructor(
        public date: Date,
        public type: RepconMessageType,
        public args: any[],
    ) { }

    get string() {
        return this.args.map(asString).join(' ');
    }
}

@Injectable({ providedIn: 'root' })
export class RepconService {
    messages: RepconMessage[] = [];

    private orig: { [key in RepconMessageType]: typeof console.info };

    clear() {
        this.messages = [];
    }

    get enable() {
        return !!this.orig;
    }

    set enable(v) {
        if (v) {
            if (!this.orig) {
                this.orig = Object.assign({}, ...messageTypes.map(type => ({ type: console[type] })));
                for (const type of messageTypes) {
                    console[type] = (...data: any[]) => this.messages.push(new RepconMessage(new Date(), type, data));
                }
            }
        }
        else {
            if (this.orig) {
                for (const type of messageTypes) {
                    console[type] = this.orig[type];
                }
                this.orig = undefined;
            }
        }
    }
}
