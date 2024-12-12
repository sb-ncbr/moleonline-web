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
    // return getTabLinkById(tabbedElementId, tabId).parent().attr("class").indexOf("active") >= 0;
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
    var checker = function () {
        let link = getTabLinkById(tabbedElementId, tabId);
        let href = link.attr("href");
        console.log(link.parent());
        console.log(link.parent().attr("class"));
        console.log(link.parent().attr("class").indexOf("active"));
        console.log(link.attr("class"));
        console.log(link.attr("class").indexOf("active"));
        console.log($(href).css("display"));
        // if (link.parent().attr("class").indexOf("active") >= 0 && $(href).css("display") !== "none") {
        //     callback();
        // }
        // else {
        //     window.setTimeout(checker, 10);
        // }
        if (link.attr("class").indexOf("active") >= 0 && $(href).css("display") !== "none") {
            callback();
        }
        else {
            window.setTimeout(checker, 10);
        }
    };
    window.setTimeout(checker, 10);
}

export function doAfterCollapseActivated() {
    var checker = function () {
        const collapseSequence = $("#sequence-collapse")[0];
        const collapseBottomPanel = $("#bottom-panel-collapse")[0];
        const changeViewButton = $("#view-change")[0];
    
        const bottomPanel = $("#bottom-pannel");
        const sequenceViewer = $("#sequence-viewer");

        // if (bottomPanel.attr("class").indexOf("show") >= 0) {
        //     sequenceViewer[0].style.height = "21vh";
        // } else {
        //     sequenceViewer[0].style.height = "17vh";
        // }
    
        const bottomPanelHeight = bottomPanel.attr("class").indexOf("show") >= 0 ? bottomPanel.height() : 0;
        const sequenceViewerHeight = sequenceViewer.attr("class").indexOf("show") >= 0 ? sequenceViewer.height() : 21;
    
        collapseBottomPanel.style.bottom = `${bottomPanelHeight}px`;
        collapseSequence.style.bottom = `${sequenceViewerHeight + bottomPanelHeight}px`;
        changeViewButton.style.bottom = `${bottomPanelHeight + sequenceViewerHeight}px`;
    };
    window.setTimeout(checker, 10);
}

export function leftPanelTabs() {
    var checker = function () {
        const leftPanel = $("#left-panel");
        const tabs = $("#left-panel-tabs")[0];

        const leftPanelWidth = leftPanel.width();

        tabs.style.left = `${leftPanelWidth}px`;
    };
    window.setTimeout(checker, 10);
}