import { getCookie, setCookie } from "./Cookies";
import { getParameters } from "./Router";

export let LAST_N_SESSIONS_N = 5;
let cookieNamePrefix = "LastNSessionsWithDate";
let version = 4;

export function getNthSession(n: number) {
    let val = getCookie(`${cookieNamePrefix}_${version}_${n}`);
    if (val === void 0 || val === null || val === "") {
        return "";
    }

    return val;
}

function formatDate(date: Date) {
    let day = `${date.getDate()}`;
    if (day.length == 1) {
        day = `0${day}`;
    }
    let month = `${date.getMonth() + 1}`;
    if (month.length === 1) {
        month = `0${month}`;
    }
    let hours = `${date.getHours()}`;
    if (hours.length === 1) {
        hours = `0${hours}`;
    }
    let minutes = `${date.getMinutes()}`;
    if (minutes.length === 1) {
        minutes = `0${minutes}`;
    }

    return `${day}.${month}.${date.getFullYear()} ${hours}:${minutes}`;
}

export function setNthSession(n: number, value: string) {
    setCookie(`${cookieNamePrefix}_${version}_${n}`, `${formatDate(new Date())}|${value}`);
}

export function updateWithCurrentSession() {
    let params = getParameters();

    if (params === null) {
        return;
    }
    let computationId = params.computationId;
    let submitIdPart = (params.isChannelsDB) ? "/ChannelsDB" : (params.submitId === 0) ? "" : `/${params.submitId}`

    for (let i = 0; i < LAST_N_SESSIONS_N; i++) {
        let session = getNthSession(i);
        if (session === "") {
            setNthSession(i, `${computationId}${submitIdPart}`);
            return;
        }

        let compId = session.split("|")[1].split("/")[0];
        if (compId === params.computationId) {
            setNthSession(i, `${computationId}${submitIdPart}`);
            return;
        }
    }

    for (let i = 1; i < LAST_N_SESSIONS_N; i++) {
        setNthSession(i - 1, getNthSession(i).split("|")[1]);
    }

    setNthSession(LAST_N_SESSIONS_N - 1, `${computationId}${submitIdPart}`);
}
