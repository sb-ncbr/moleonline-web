import { CommonOptions } from "../../../config/common";

declare function $(p: any): any;

export class Tooltips {

    private static checkedElements: Map<string, string> = new Map<string, string>();

    private static checkLoop() {
        if (this.checkedElements.size > 0) {
            window.setTimeout(() => {
                let finished: string[] = [];
                this.checkedElements.forEach((val, key, map) => {
                    if (this.checkElement(key)) {
                        finished.push(key);
                        if (CommonOptions.DEBUG_MODE)
                            console.log('tooltip for ' + key + ' is initialized');
                    }
                });
                for (let elementId of finished) {
                    if (CommonOptions.DEBUG_MODE)
                        console.log('tooltipInit: removing ' + elementId + ' from loop');
                    this.checkedElements.delete(elementId);
                }
            })
        }
    }

    private static checkElement(elementId: string) {
        if ($(`#${elementId}`).length === 0) {
            return false;
        }

        $(`#${elementId}`).tooltip();

        return true;
    }

    public static initWhenReady(elementId: string) {
        this.checkedElements.set(elementId, elementId);
        this.checkLoop();
    }

    public static initImmediate(element: HTMLElement, content?: string) {
        if ($(element).length === 0) {
            return false;
        }

        if (content !== void 0) {
            $(element).tooltip({ content: content });
        }
        else {
            $(element).tooltip();
        }

        return true;
    }

    public static destroy(element: HTMLElement) {
        if ($(element).length === 0) {
            return false;
        }

        $(element).tooltip("destroy");

        return true;
    }

}
