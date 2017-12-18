$( function() {

    $( "#right-tabs a" ).on('click',resizeTabAfterActivate);
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
    });

    //Datagrid
    $( window ).on("resize",dgResize);
    $( window ).on("contentResize",dgResize);

    fillSpaceOnResize("layer-residues","right-tabs-1","right-tabs",39);
    fillSpaceOnResize("layer-properties","right-tabs-1","right-tabs",59);
    datagridOnResize("dg-lining-residues","right-tabs-2","right-tabs");
    datagridOnResize("dg-channel-properties","right-tabs-3","right-tabs");
    datagridOnResize("dg-layer-properties","layer-properties","layer-properties");
    datagridOnResize("dg-layer-residues","layer-residues","layer-residues");
    //datagridOnResize("dg-protein-annotations","right-panel-tabs-1","right-panel-tabs");
} );

function dgResize(){
    fillSpaceOnResize("layer-residues","right-tabs-1","right-tabs",39);
    fillSpaceOnResize("layer-properties","right-tabs-1","right-tabs",59);
    datagridOnResize("dg-lining-residues","right-tabs-2","right-tabs");
    datagridOnResize("dg-channel-parameters","right-tabs-3","right-tabs");
    datagridOnResize("dg-layer-properties","layer-properties","layer-properties");
    datagridOnResize("dg-layer-residues","layer-residues","layer-residues");
    datagridOnResize("dg-aglomered-parameters","left-tabs-2","left-tabs");
    //datagridOnResize("dg-protein-annotations","right-panel-tabs-1","right-panel-tabs");
};

function resizeTabAfterActivate(){
    var ref = this;
    var checker = function(){
        var href = $(ref).attr("href");
        if($(ref).parent().attr("class").indexOf("active")>=0 && $(href).css("display")!=="none"){
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