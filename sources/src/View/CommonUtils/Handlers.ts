// A list of event handlers. attach returns a function that detaches the handler again (e.g. when a component unmounts).
export class Handlers<Args extends any[]> {
    // one entry per attach, so a detach removes exactly its own registration, even of a handler attached twice
    private list: { handler: (...args: Args) => void }[] = [];

    attach(handler: (...args: Args) => void): () => void {
        const entry = { handler };
        this.list.push(entry);
        return () => {
            // a second call finds nothing and does nothing
            const idx = this.list.indexOf(entry);
            if (idx !== -1) {
                this.list.splice(idx, 1);
            }
        };
    }

    invoke(...args: Args) {
        // a copy: a handler may detach itself while the event is delivered
        for (const entry of [...this.list]) {
            entry.handler(...args);
        }
    }
}
