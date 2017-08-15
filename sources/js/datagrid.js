function parseStyleNumeric(str){
	var val = str.split("px")[0];
	return (isNaN(Number(val)))?0:Number(val);
}
function datagridOnResize(elementId,lowLevelContainerId,highLevelContainerId){
	var datagridJ = $( "#"+elementId );
	var datagrid = datagridJ[0];
	var parent = $("#"+highLevelContainerId)[0];/*datagrid.parentElement.parentElement;*/ //Specially modified for Jquery Tabs
	var header = $( "#"+elementId+" .header" )[0];
	var body = $( "#"+elementId+" .body" )[0];

	var headHeight = header.clientHeight;

	//Make body and header width correspond
	var btWidth = $( "#"+elementId+" .body table" )[0].clientWidth;
	$( "#"+elementId+" .header table" ).css("width",String(btWidth));

	var parentHeight = parent.clientHeight;
	var filledHeight = 0;
	for(var i=0;i<parent.children.length;i++){
		var el = parent.children[i];	

		if(el.id === lowLevelContainerId){
			continue;
		}
		filledHeight+=el.clientHeight;
	}
	
	var paddingAndMargin = parseStyleNumeric(datagridJ.css("padding-top")); 
	paddingAndMargin += parseStyleNumeric(datagridJ.css("padding-bottom")); 
	paddingAndMargin += parseStyleNumeric(datagridJ.css("margin-top")); 
	paddingAndMargin += parseStyleNumeric(datagridJ.css("margin-bottom"));  

	datagrid.style.height = String(parentHeight-filledHeight)+"px";

	var datagrid_updated = $( "#"+elementId )[0];
	var body = $( "#"+elementId+" .body" )[0];

	body.style.height = String((parentHeight-filledHeight)-headHeight-paddingAndMargin)+"px";
};
