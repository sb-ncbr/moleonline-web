export function setCookie(c_name: string, value: string, exdays?: number) {
    let exdate = new Date();
    if (exdays !== void 0) {
        exdate.setDate(exdate.getDate() + exdays);
    }
    let c_value = encodeURI(value) + ((exdays === void 0) ? "" : "; expires=" + exdate.toUTCString()) + "; path=/";
    document.cookie = c_name + "=" + c_value;
}

export function getCookie(c_name: string) {
    let i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) {
            return decodeURI(y);
        }
    }
}