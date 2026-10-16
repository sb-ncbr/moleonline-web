declare function $(p: any): any;

export function getTabLinkById(tabbedElementId: string, tabId: string) {
    let tabs = $(`#${tabbedElementId} li a`);
    for (let t of tabs) {
        if ($(t).attr('href') === `#${tabbedElementId}-${tabId}`) {
            return $(t);
        }
    }
}

export function isActive(tabbedElementId: string, tabId: string) {
    return getTabLinkById(tabbedElementId, tabId).attr("class").indexOf("active") >= 0;
}

export function activateTab(tabbedElementId: string, tabId: string) {
    let tabLink = getTabLinkById(tabbedElementId, tabId);
    if (tabLink) {
        tabLink.tab('show'); // Trigger the click to activate the tab
    } else {
        console.error(`Tab with id "${tabId}" not found in element "${tabbedElementId}".`);
    }
}

export function doAfterTabActivated(tabbedElementId: string, tabId: string, callback: () => void) {
    let checker = function () {
        let link = getTabLinkById(tabbedElementId, tabId);
        let href = link.attr("href");
        if (link.attr("class").indexOf("active") >= 0 && $(href).css("display") !== "none") {
            callback();
        }
        else {
            window.setTimeout(checker, 10);
        }
    };
    window.setTimeout(checker, 10);
}

export function leftPanelTabs() {
    let checker = function () {
        const leftPanel = $("#left-panel");
        const tabs = $("#left-panel-tabs")[0];

        const leftPanelWidth = leftPanel.width();

        tabs.style.left = `${leftPanelWidth}px`;
    };
    window.setTimeout(checker, 10);
}