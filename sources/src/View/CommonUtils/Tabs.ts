namespace CommonUtils.Tabs{
    declare function $(p:any): any;

    export function getTabLinkById(tabbedElementId:string, tabId:string){
        let tabs = $(`#${tabbedElementId} li a`);
        for(let t of tabs){
            if($(t).attr('href')===`#${tabbedElementId}-${tabId}`){
                return $(t);
            }
        }
    }

    export function isActive(tabbedElementId:string, tabId:string){
        return getTabLinkById(tabbedElementId,tabId).parent().attr("class").indexOf("active")>=0;
    }

    export function activateTab(tabbedElementId:string, tabId:string){
        getTabLinkById(tabbedElementId,tabId).click();
    }

    export function doAfterTabActivated(tabbedElementId:string, tabId:string, callback:()=>void){
        var checker = function(){
            let link = getTabLinkById(tabbedElementId,tabId);
            let href = link.attr("href");
            if(link.parent().attr("class").indexOf("active")>=0 && $(href).css("display")!=="none"){
                callback();
            }
            else{
                window.setTimeout(checker,10);    
            }
        };
        window.setTimeout(checker,10);
    }
}