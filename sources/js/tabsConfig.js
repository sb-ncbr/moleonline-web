$( function() {
    $( "#left-tabs" ).tabs({
        show: true,/*
        beforeActivate: function(_, _){
            resizeAgTable();
        },*/
        activate: function( _, _ ) {
            $(window).trigger('resize');
            $(window).trigger('contentResize');
        }
    });
    $( "#right-tabs" ).tabs({
        show: true,
        activate: function(_, _){
            $(window).trigger('resize');
        }
    });
    $( "#right-panel-tabs" ).tabs({show: true});
    $( "#bottom-tabs-toggler" ).on("click",function(){
        $( ".left-tabs" ).toggleClass( "bottom-tabs-toggled" );
        $( ".right-tabs" ).toggleClass( "bottom-tabs-toggled" );
        //Agglomered parameters resize
        $(window).trigger('resize');
        //resizes painting canvas od 2D vizualizer
        $( window ).trigger('contentResize');
        $( window ).trigger('lvCcontentResize');
    });
    $( "#bottom-panel-toggler" ).on("click",function(){
        $( ".plugin" ).toggleClass( "bottom-panel-toggled" );
        $( ".bottom-panel" ).toggleClass( "bottom-panel-toggled" );
        //Agglomered parameters resize
        $( window ).trigger('resize');
        //resizes painting canvas od 2D vizualizer
        $( window ).trigger('contentResize');
    });
    $( "#right-panel-toggler" ).on("click",function(){
        $( ".ui" ).toggleClass( "toggled" );
        $( ".bottom" ).toggleClass( "toggled" );
        //Agglomered parameters resize
        $( window ).trigger('resize');
        //resizes painting canvas od 2D vizualizer
        $( window ).trigger('contentResize');
    });


    var dgResize = function(){
        fillSpaceOnResize("layer-residues","right-tabs-1","right-tabs",39);
        fillSpaceOnResize("layer-properties","right-tabs-1","right-tabs",59);
        /*datagridOnResize("dg-layer-properties","right-tabs-1","right-tabs");
        datagridOnResize("dg-layer-residues","right-tabs-2","right-tabs");*/
        datagridOnResize("dg-layer-properties","layer-properties","layer-properties");
        datagridOnResize("dg-layer-residues","layer-residues","layer-residues");
        datagridOnResize("dg-residue-annotations","right-tabs-3","right-tabs");
        datagridOnResize("dg-aglomered-parameters","left-tabs-2","left-tabs");
        datagridOnResize("dg-protein-annotations","right-panel-tabs-1","right-panel-tabs");
    };
    //Datagrid
    $( window ).on("resize",dgResize);
    $( window ).on("contentResize",dgResize);

    fillSpaceOnResize("layer-residues","right-tabs-1","right-tabs",39);
    fillSpaceOnResize("layer-properties","right-tabs-1","right-tabs",59);
    /*datagridOnResize("dg-layer-properties","right-tabs-1","right-tabs");
    datagridOnResize("dg-layer-residues","right-tabs-2","right-tabs");*/
    datagridOnResize("dg-layer-properties","layer-properties","layer-properties");
    datagridOnResize("dg-layer-residues","layer-residues","layer-residues");
    datagridOnResize("dg-residue-annotations","right-tabs-3","right-tabs");
    datagridOnResize("dg-protein-annotations","right-panel-tabs-1","right-panel-tabs");
    /*datagridOnResize("dg-aglomered-parameters","left-tabs-2","left-tabs");*/
} );

function fillSpaceOnResize(elementId,lowLevelContainerId,highLevelContainerId,height){
    if(height===void 0){
        height=100;
    }
	var elementJ = $( "#"+elementId );
	var element = elementJ[0];
	var parentJ = $("#"+highLevelContainerId);
    var parent = parentJ[0];/*datagrid.parentElement.parentElement;*/ //Specially modified for Jquery Tabs
	//var header = $( "#"+elementId+" .header" )[0];
	//var body = $( "#"+elementId+" .body" )[0];

	//var headHeight = header.clientHeight;

	//Make body and header width correspond
	//var btWidth = $( "#"+elementId+" .body table" )[0].clientWidth;
	//$( "#"+elementId+" .header table" ).css("width",String(btWidth));

	var parentHeight = parent.clientHeight;
    var parentWidth = parentJ.width();
	var filledHeight = 0;
	for(var i=0;i<parent.children.length;i++){
		var el = parent.children[i];	

		if(el.id === lowLevelContainerId){
			continue;
		}
		filledHeight+=el.clientHeight;
	}

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

	//var datagrid_updated = $( "#"+elementId )[0];
	//var header = $( "#"+elementId+" .header" )[0];
	//var body = $( "#"+elementId+" .body" )[0];
	//body.style.height = String((parentHeight-filledHeight)-headHeight-paddingAndMargin)+"px";
};