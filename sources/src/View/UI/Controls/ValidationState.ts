export type ValidationStates = "VALID" | "INVALID"
export type ValidationStateChangeHandler = (oldState: ValidationStates, newState: ValidationStates) => void

export class ValidationState {
    private static validationStates: Map<string, ValidationStates> = new Map<string, ValidationStates>();

    public static getState(validationGroup: string) {
        let state = this.validationStates.get(validationGroup);
        if (state === void 0) {
            return "VALID";
        }

        return state;
    }

    private static stateChangeHandlers: Map<string, ValidationStateChangeHandler[]> = new Map<string, ValidationStateChangeHandler[]>();

    // Returns a function that detaches the handler again
    public static attachOnStateChangeHandler(validationGroup: string, handler: ValidationStateChangeHandler): () => void {
        let groupHandlers = this.stateChangeHandlers.get(validationGroup);
        if (groupHandlers === void 0) {
            groupHandlers = [];
        }
        groupHandlers.push(handler);
        this.stateChangeHandlers.set(validationGroup, groupHandlers);
        return () => {
            const idx = groupHandlers!.indexOf(handler);
            if (idx !== -1) {
                groupHandlers!.splice(idx, 1);
            }
        };
    }

    private static invokeOnStateChangeHandlers(validationGroup: string, oldState: ValidationStates, newState: ValidationStates) {
        let groupHandlers = this.stateChangeHandlers.get(validationGroup);
        if (groupHandlers === void 0) {
            return;
        }

        for (let h of groupHandlers) {
            h(oldState, newState);
        }
    }

    public static reset(validationGroup: string) {
        let oldState = this.getState(validationGroup);
        this.validationStates.delete(validationGroup);
        this.invokeOnStateChangeHandlers(validationGroup, oldState, this.getState(validationGroup));
    }
}
