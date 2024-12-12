import { ApiService } from "../../PatternQueryAPIService";
import { parsePoints, parseResidues, parseResiduesArray, removeMultipleWSp } from "./Misc";

export interface ValidationResult {
    valid: boolean,
    message?: string
}

export function validateChainsArray(value: string) {
    return new Promise<ValidationResult>((res, rej) => {
        if (value.length === 0) {
            res({ valid: true, message: "" });
        }

        let reg = new RegExp(/^[A-Z][\-][\d]*$|^[A-Z]{1}$/);
        value = value.replace(/\s*,\s*/g, ",");
        value = value.replace(/\s*$/g, '');
        value = value.replace(/^\s*/g, '');
        let chains = value.split(",");
        let valid = true;
        for (let chain of chains) {
            valid = valid && reg.test(chain);
        }

        res({
            valid,
            message: (!valid) ? "List of chains is not in readable format!" : ""
        });
    });
}

export function validateResidueSimpleArray(value: string) {
    return new Promise<ValidationResult>((res, rej) => {
        if (value.length === 0) {
            res({ valid: true, message: "" });
        }

        let expectedCount = value.split(',').length;
        let valid = parseResidues(value).length === expectedCount

        res({
            valid,
            message: (!valid) ? "List of resiudes is not in readable format!" : ""
        });
    });
}

export function validatePoints(value: string) {
    return new Promise<ValidationResult>((res, rej) => {
        if (value.length === 0) {
            res({ valid: true, message: "" });
        }
        let v = removeMultipleWSp(value);
        let expectedCount = v.split('],[').length;
        let valid = parsePoints(value).length === expectedCount

        res({
            valid,
            message: (!valid) ? "List of points is not in readable format!" : ""
        });
    });
}

export function validateResidueDoubleArray(value: string) {
    return new Promise<ValidationResult>((res, rej) => {
        if (value.length === 0) {
            res({ valid: true, message: "" });
        }

        value = value.replace(/\]\s*,\s*\[/g, '],[');

        let arrays = value.split("],[");

        let expectedCount = value.split(',').length;
        let valid = true;
        let residuesArray = parseResiduesArray(value);

        if (residuesArray.length !== arrays.length) {
            valid = false;
        }
        else {
            for (let i = 0; i < residuesArray.length; i++) {
                valid = valid && arrays[i].split(",").length === residuesArray[i].length;
                if (!valid) {
                    break;
                }
            }
        }

        res({
            valid,
            message: (!valid) ? "Invalid syntax! Should be [A 69, ...], [A 137, ...], ..." : ""
        });
    });
}

export function validatePatternQuery(v: string) {
    return new Promise<{ valid: boolean, message?: string }>((res, rej) => {
        if (v.length === 0) {
            res({ valid: true });
        }
        ApiService.getValidationResult(v)
            .then((result) => {
                if (result.isOk) {
                    res({ valid: true });
                }
                else {
                    res({ valid: false, message: (result.error === void 0) ? "" : result.error });
                }
            })
            .catch((err) => {
                rej(err);
            });
    });
}
