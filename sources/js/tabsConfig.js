$( function() {

    $( "#right-tabs a" ).bind('click',resizeTabAfterActivate);
    $( "#left-tabs a" ).on('click',resizeTabAfterActivate);
    
    $( "#bottom-tabs-toggler" ).on("click",function(){
        $( ".left-tabs" ).toggleClass( "bottom-tabs-toggled" );
        $( ".right-tabs" ).toggleClass( "bottom-tabs-toggled" );
        //Agglomered parameters resize
        $( window ).trigger('resize');
        //datagrid resize
        $( window ).trigger('contentResize');
        //resizes painting canvas od 2D vizualizer
        $( window ).trigger('lvContentResize');
    });
    $( "#bottom-panel-toggler" ).on("click",function(){
        $( ".plugin" ).toggleClass( "bottom-panel-toggled" );
        $( ".sequence-viewer" ).toggleClass( "bottom-panel-toggled" );
        $( ".bottom-panel" ).toggleClass( "bottom-panel-toggled" );
        //Agglomered parameters resize
        $( window ).trigger('resize');
        //datagrid resize
        $( window ).trigger('contentResize');
        //resizes painting canvas od 2D vizualizer
        $( window ).trigger('lvContentResize');
    });
    $( "#right-panel-toggler" ).on("click",function(){
        $( ".ui" ).toggleClass( "toggled" );
        $( ".bottom" ).toggleClass( "toggled" );
        //Agglomered parameters resize
        $( window ).trigger('resize');
        //datagrid resize
        $( window ).trigger('contentResize');
    });

    $("#right-panel-toggle-minimize").on("click",function(){
        $(".chdb-panel.right-panel").toggleClass("minimized");
        $(".controls-tab").toggleClass("minimized");
    });

    var dropdownMenu;
    $(window).on('show.bs.dropdown', function(e) {

        // grab the menu        
        dropdownMenu = $(e.target).find('.dropdown-menu');
    
        // detach it and append it to the body
        $('body').append(dropdownMenu.detach());   
    
        // grab the new offset position
        var eOffset = $(e.target).offset();
    
        // make sure to place it where it would normally go (this could be improved)
        dropdownMenu.css({
            'display': 'block',
            'top': eOffset.top + $(e.target).outerHeight(),
            'left': eOffset.left
        });                                                
      });
    
      // and when you hide it, reattach the drop down, and hide it normally                                                   
      $(window).on('hide.bs.dropdown', function(e) {        
        $(e.target).append(dropdownMenu.detach());        
        dropdownMenu.hide();                              
      });                              

    //Datagrid
    $( window ).on("resize",dgResize);
    $( window ).on("contentResize",dgResize);

    fillSpaceOnResize("layer-residues","right-tabs-1","right-tabs",39);
    fillSpaceOnResize("layer-properties","right-tabs-1","right-tabs",59);
    // datagridOnResize("dg-lining-residues","right-tabs-2","right-tabs");
    // datagridOnResize("dg-channel-properties","right-tabs-3","right-tabs");
    // datagridOnResize("dg-layer-properties","layer-properties","layer-properties");
    // datagridOnResize("dg-layer-residues","layer-residues","layer-residues");
    //datagridOnResize("dg-protein-annotations","right-panel-tabs-1","right-panel-tabs");
} );

// $(function() {
//     // hold onto the drop down menu                                             
//     var dropdownMenu;
  
//     // and when you show it, move it to the body                                     
//     $(window).on('show.bs.dropdown', function(e) {
  
//       // grab the menu        
//       dropdownMenu = $(e.target).find('.dropdown-menu');
  
//       // detach it and append it to the body
//       $('body').append(dropdownMenu.detach());   
  
//       // grab the new offset position
//       var eOffset = $(e.target).offset();
  
//       // make sure to place it where it would normally go (this could be improved)
//       dropdownMenu.css({
//           'display': 'block',
//           'top': eOffset.top + $(e.target).outerHeight(),
//           'left': eOffset.left
//       });                                                
//     });
  
//     // and when you hide it, reattach the drop down, and hide it normally                                                   
//     $(window).on('hide.bs.dropdown', function(e) {        
//       $(e.target).append(dropdownMenu.detach());        
//       dropdownMenu.hide();                              
//     });                                                   
//   })(); 

function dgResize(){
    fillSpaceOnResize("layer-residues","right-tabs-1","right-tabs",39);
    fillSpaceOnResize("layer-properties","right-tabs-1","right-tabs",59);
    // datagridOnResize("dg-aglomered-parameters","left-tabs-2","left-tabs");

    // datagridOnResize("dg-lining-residues","right-tabs-2","right-tabs");
    // datagridOnResize("dg-layer-properties","layer-properties","layer-properties");
    // datagridOnResize("dg-layer-residues","layer-residues","layer-residues");
    // datagridOnResize("dg-aglomered-parameters","left-tabs-2","left-tabs");
    // datagridOnResize("dg-channel-parameters","right-tabs-3","right-tabs");
    // // datagridOnResize("dg-protein-annotations","right-panel-tabs-1","right-panel-tabs");
    leftPanelTabs();
};

function doAfterCollapseActivated() {
    var checker = function () {
        const collapseSequence = $("#sequence-collapse")[0];
        const collapseBottomPanel = $("#bottom-panel-collapse")[0];
        const changeViewButton = $("#view-change")[0];
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
        let changeViewButtonBottom = 0;

        if (sequenceViewer.attr("class").indexOf("show") >= 0) {
            if (bottomPanel.attr("class").indexOf("show") >= 0) {
                changeViewButtonBottom = bottomPanelHeight + sequenceViewerHeight + 21;
            } else {
                changeViewButtonBottom = sequenceViewerHeight + 21;
            }
        } else {
            if (bottomPanel.attr("class").indexOf("show") >= 0) {
                changeViewButtonBottom = bottomPanelHeight + sequenceViewerHeight;
            } else {
                changeViewButtonBottom = sequenceViewerHeight;
            }
        }
    
        collapseBottomPanel.style.bottom = `${bottomPanelHeight}px`;
        collapseSequence.style.bottom = `${sequenceViewerHeight + bottomPanelHeight}px`;
        changeViewButton.style.bottom = `${changeViewButtonBottom}px`;
    };
    window.setTimeout(checker, 10);
}

function leftPanelTabs() {
    var checker = function () {
        const leftPanel = $("#left-panel");
        const tabs = $("#left-panel-tabs")[0];

        const leftPanelWidth = leftPanel.width();

        tabs.style.left = `${leftPanelWidth}px`;
    };
    window.setTimeout(checker, 10);
}

function resizeTabAfterActivate(){
    var ref = this;
    var checker = function(){
        var href = $(ref).attr("href");
        if($(ref).attr("class").indexOf("active")>=0 && $(href).css("display")!=="none"){
            dgResize();
            $( window ).trigger('lvContentResize');
        }
        else{
            window.setTimeout(checker,10);    
        }
    };
    window.setTimeout(checker,10);
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
};