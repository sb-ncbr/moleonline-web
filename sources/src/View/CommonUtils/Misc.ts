import { MoleConfigPoint, MoleConfigResidue, Submission } from "../../MoleAPIService";
import { StringPoint } from "./Selection";

declare function $(p: any): any;

export function triggerDownload(dataUrl: string, fileName: string) {
    let a = document.createElement("a");
    document.body.appendChild(a);
    $(a).css("display", "none");
    a.href = dataUrl;
    a.download = fileName;
    a.click();
    setTimeout(function () { return a.remove(); }, 20000);
}

export function flattenResiduesArray(residuesArray: MoleConfigResidue[][]): string {
    let rv = "";
    let idx = 0;
    for (let array of residuesArray) {
        if (idx > 0) {
            rv = `${rv}, `;
        }
        rv = `${rv}[${flattenResidues(array)}]`;
        idx++;
    }
    return rv;
}

export function flattenResidues(residues: MoleConfigResidue[]): string {
    let rv = "";
    for (let r of residues) {
        if (rv !== "") {
            rv += ", ";
        }
        rv += `${r.Chain} ${r.SequenceNumber}`;
    }
    return rv;
}

export function flattenPoints(pointsArray: StringPoint[]): string {
    let rv = "";
    for (let p of pointsArray) {
        let group = `[${p.x},${p.y},${p.z}]`;

        if (rv.length !== 0) {
            rv += ",";
        }
        rv += group;
    }

    return rv;
}

export function pointsToString(points: MoleConfigPoint[]): string {
    let rv = "";
    for (let p of points) {
        if (rv !== "") {
            rv += ",";
        }
        rv += `[${p.X},${p.Y},${p.Z}]`;
    }
    return rv;
}

export function isMoleJob(data: Submission) {
    if (data.MoleConfig === void 0 || data.MoleConfig === null) {
        return false;
    }

    let c = data.MoleConfig;
    return !(c.Cavity === void 0
        && c.CustomExits === void 0
        && c.Input === void 0
        && c.NonActiveResidues === void 0
        && c.Origin === void 0
        && c.PoresAuto === void 0
        && c.PoresMerged === void 0
        && c.QueryFilter === void 0
        && c.Tunnel === void 0);
}

export function parseResidues(residues: string | undefined): { Chain: string, SequenceNumber: number, OperatorName: string, Name: string }[] {
    if (residues === void 0) {
        return [];
    }

    residues = residues.replace(/\s*,\s*/g, ",");
    let items = residues.split(',');
    let rv = [];

    let seqNumReg = new RegExp(/^[0-9]+$/);
    let chainReg = new RegExp(/^[A-Z][\-][\d]*$|^[A-Z]{1}$/);

    for (let item of items) {
        let r = item.split(' ');
        let seqNum;
        let chain;
        for (let part of r) {
            if (seqNumReg.test(part)) {
                seqNum = Number(part);
                continue;
            }
            if (chainReg.test(part)) {
                chain = part;
                continue;
            }
        }
        if (chain !== void 0 && seqNum !== void 0) {
            rv.push(
                {
                    Chain: chain,
                    SequenceNumber: seqNum,
                    OperatorName: "", //TODO somehow get operator name if it's possible
                    Name: ""
                }
            );
        }
    }

    return rv;
}

export function parsePoint(value: string | undefined): StringPoint | undefined {
    if (value === void 0) {
        return void 0;
    }
    value = value.replace(/\s*,\s*/g, ",");
    let parts = value.split(",");

    let x = Number(parts[0]);
    let y = Number(parts[1]);
    let z = Number(parts[2]);

    if (isNaN(x) || isNaN(y) || isNaN(z)) {
        return void 0;
    }

    return {
        x: parts[0],
        y: parts[1],
        z: parts[2]
    }
}
