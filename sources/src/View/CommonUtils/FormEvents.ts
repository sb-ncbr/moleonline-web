import { Handlers } from "./Handlers";

// The settings form's submit and clear, for the form group named in the event
export class Events {
    // attach… returns a function that detaches the handler again
    private static onClear = new Handlers<[string]>();
    private static onSubmit = new Handlers<[string]>();

    public static attachOnClearEventHandler(handler: (formGroup: string) => void) { return this.onClear.attach(handler); }
    public static invokeOnClear(formGroup: string) { this.onClear.invoke(formGroup); }

    public static attachOnSubmitEventHandler(handler: (formGroup: string) => void) { return this.onSubmit.attach(handler); }
    public static invokeOnSubmit(formGroup: string) { this.onSubmit.invoke(formGroup); }
}
