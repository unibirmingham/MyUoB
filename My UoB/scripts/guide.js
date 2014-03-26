(function (global) {
    
    if (navigator.onLine) {
        guideUrl = "http://www.butler.bham.ac.uk/pocket_guides/index.json";
    }
    else {
        if (!localStorage.getItem('pocketguide')) {
            guideUrl = "data/pocket-guide.json";
        }
    }
    
    guide = new kendo.data.DataSource({
    	/*
        transport: { 
        	read: { 
            	url: guideUrl,
                dataType: "json"
            }
        }
        */
		transport: {
            read: function(operation) {
	            var cachedData = localStorage.getItem("pocketGuide");
				//var cachedDate = localStorage.getItem("lastCached");
            	if((cachedData != null || cachedData != undefined) && (!navigator.onLine)) {
                	//if local data exists and we're offline, load from it
                	operation.success(JSON.parse(cachedData));
            	} else {
                	$.ajax({ 
                   	 url: guideUrl,
                   	 dataType: "json",
                   	 success: function(response) {
                   	     //store response, if online 
                   	     if (navigator.onLine) {
                                localStorage.setItem("pocketGuide", JSON.stringify(response));
                            }
                   	     //pass the pass response to the DataSource
                   	     operation.success(response);
                   	 }
                	});
            	}
        	}
        }   
    })
        
})(window);

function guideShow(e) {
    //var myFilter = { logic: "and", filters: [{field: "PageFunction", operator: "eq", value: "index"},{field: "ParentId", operator: "eq", value: 1}] };
    var myFilter = { logic: "and", filters: [{field: "ParentId", operator: "eq", value: 1}] };
    guide.filter(myFilter);
    //app.application.navigate("#tabstrip-pocket-guide2");
};

function guideSectionShow(e) {
    //alert(e.dataItem);
    //var id = e.dataItem.id;
    //guide.filter({field: "ParentId", operator: "eq", value: id});
};

function onGuideIndexClick(e) {
    var id = e.dataItem.id;
    var name = e.dataItem.PageTitle;
       
    if (e.dataItem.PageFunction === "page") {
        guide.filter({field: "id", operator: "eq", value: id});
        app.application.navigate("#guide-page-feedback");    
    }
    else {
        guide.filter({field: "ParentId", operator: "eq", value: id});
        app.application.navigate("#guide-section");
    }
};

function onGuideSectionClick(e) {
    var id = e.dataItem.id;
    var name = e.dataItem.PageTitle;
    var parent = e.dataItem.ParentId;
    guide.filter({field: "id", operator: "eq", value: id});
    
    app.application.navigate("#guide-page");
    $('#backFromPage').attr('data-parent', parent);
    $('#backFromPage').attr('href','#guide-section?id=' + parent);
};

function onBackFromPage(e) {
    //onGuideSectionClick(e);
    
    //var id =e.id;
  //  id = this.element.attr("data-parent")
//    alert("boom" + id);
 //   guide.filter({field: "ParentId", operator: "eq", value: id});   
    //app.application.navigate("#guide-section");
   
}

function onGuidePageClick(e) {
   var parent = e.dataItem.ParentId;
   //alert(parent);
   guide.filter({field: "ParentId", operator: "eq", value: parent});   
   app.application.navigate("#guide-section");
}


function guidePageShow(e) {
    
};