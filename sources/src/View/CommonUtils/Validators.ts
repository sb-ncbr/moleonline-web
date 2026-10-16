import { ApiService } from "../../PatternQueryAPIService";

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
