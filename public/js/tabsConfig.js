$( function() {
    // Bound on document: React renders these elements after this runs

    // A shown tab gets its layout and the profile canvas, which skips resizing while hidden
    $(document).on("shown.bs.tab", "#left-tabs a, #right-tabs a", function() {
        dgResize();
        $( window ).trigger('lvContentResize');
    });

    $(document).on("click", "#bottom-tabs-toggler", function() {
        $( ".left-tabs" ).toggleClass( "bottom-tabs-toggled" );
        $( ".right-tabs" ).toggleClass( "bottom-tabs-toggled" );
        $( window ).trigger('resize');
        $( window ).trigger('contentResize');
        $( window ).trigger('lvContentResize');
    });

    $(document).on("click", "#left-panel-toggle-minimize", function() {
        $(".left-panel").toggleClass("minimized");
        $("#left-panel-tabs").find("a").not("#home-tab").toggleClass("disabled");
        $('#left-panel .tab-content').toggleClass("hide");
        leftPanelTabs();
    });

    $( window ).on("resize",dgResize);
    $( window ).on("contentResize",dgResize);

    $( window ).on("resize",doAfterCollapseActivated);
    $( window ).on("contentResize",doAfterCollapseActivated);
} );

function dgResize(){
    fillSpaceOnResize("layer-residues","right-tabs-1","right-tabs",39);
    fillSpaceOnResize("layer-properties","right-tabs-1","right-tabs",59);
    leftPanelTabs();
}

function doAfterCollapseActivated() {
    var checker = function () {
        const collapseSequence = $("#sequence-collapse")[0];
        const collapseBottomPanel = $("#bottom-panel-collapse")[0];
        const plugin = $("#plugin")[0];
    
        const bottomPanel = $("#bottom-pannel");
        const sequenceViewer = $("#sequence-viewer");

        if (bottomPanel.attr("class").indexOf("show") >= 0) {
            if (sequenceViewer.attr("class").indexOf("show") >= 0) {
                plugin.style.maxHeight = "49vh";
            } else {
                plugin.style.maxHeight = "66vh";
            }
        } else {
            if (sequenceViewer.attr("class").indexOf("show") >= 0) {
                plugin.style.maxHeight = "83vh";
            } else {
                plugin.style.maxHeight = "100vh";
            }
        }
    
        const bottomPanelHeight = bottomPanel.attr("class").indexOf("show") >= 0 ? bottomPanel.height() : 0;
        const sequenceViewerHeight = sequenceViewer.attr("class").indexOf("show") >= 0 ? sequenceViewer.height() : 21;
    
        collapseBottomPanel.style.bottom = `${bottomPanelHeight}px`;
        collapseSequence.style.bottom = `${sequenceViewerHeight + bottomPanelHeight}px`;
    };
    window.setTimeout(checker, 60);
}

function leftPanelTabs() {
    const leftPanel = $("#left-panel");
    const tabs = $("#left-panel-tabs")[0];

    const leftPanelWidth = leftPanel.width();

    tabs.style.left = `${leftPanelWidth}px`;
}

function fillSpaceOnResize(elementId,lowLevelContainerId,highLevelContainerId,height){
    if($('#'+elementId).length === 0){
        return;
    }
    
    if(height===void 0){
        height=100;
    }
	var elementJ = $( "#"+elementId );
	var element = elementJ[0];
    var parentJ = $("#"+highLevelContainerId);
    var parent = parentJ[0];

	var parentHeight = parent.clientHeight;
    var parentWidth = parentJ.width();
    
    var filledHeight = $('#'+highLevelContainerId+' ul.nav.nav-tabs')[0].clientHeight;

    var paddingAndMarginH = parseStyleNumeric(elementJ.css("padding-left")); 
	paddingAndMarginH += parseStyleNumeric(elementJ.css("padding-right")); 
	paddingAndMarginH += parseStyleNumeric(elementJ.css("margin-left")); 
	paddingAndMarginH += parseStyleNumeric(elementJ.css("margin-right"));

    paddingAndMarginH += parseStyleNumeric(parentJ.css("padding-left")); 
	paddingAndMarginH += parseStyleNumeric(parentJ.css("padding-right")); 
	paddingAndMarginH += parseStyleNumeric(parentJ.css("margin-left")); 
	paddingAndMarginH += parseStyleNumeric(parentJ.css("margin-right"));

    var availableHeight = parentHeight-filledHeight;

	element.style.height = String((availableHeight/100)*height)+"px";
    element.style.width = String(parentWidth-paddingAndMarginH)+"px";
}

function parseStyleNumeric(str){
	var val = str.split("px")[0];
	return (isNaN(Number(val)))?0:Number(val);
}
