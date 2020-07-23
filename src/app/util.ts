export function asString(v: any): string {
    try {
        if (typeof v === 'symbol') {
            return (v as any).description || 'Symbol';
        }
        if (v.toString && typeof v.toString === 'function') {
            return v.toString();
        }
        if (typeof v === 'object') {
            return JSON.stringify(v);
        }
        return String(v);
    }
    catch (err) {
        try {
            return 'asString() failed: ' + err;
        }
        catch {
            return 'asString() failed, and conversion of error to string also failed';
        }
    }
}
