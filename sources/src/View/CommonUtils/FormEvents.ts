type OnClearEventHandler = (formGroup: string) => void;
type OnSubmitEventHandler = (formGroup: string) => void;

export class Events {
    private static handlers_onClear: OnClearEventHandler[] = [];

    public static attachOnClearEventHandler(h: OnClearEventHandler) {
        this.handlers_onClear.push(h);
    }

    public static invokeOnClear(formGroup: string) {
        for (let h of this.handlers_onClear) {
            h(formGroup);
        }
    }

    //--

    private static handlers_onSubmit: OnSubmitEventHandler[] = [];

    public static attachOnSubmitEventHandler(h: OnSubmitEventHandler) {
        this.handlers_onSubmit.push(h);
    }

    public static invokeOnSubmit(formGroup: string) {
        for (let h of this.handlers_onSubmit) {
            h(formGroup);
        }
    }
}
