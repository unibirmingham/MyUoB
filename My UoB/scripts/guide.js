(function (global) {
    
    if (navigator.onLine) {
        //guideUrl = "http://www.alfred.bham.ac.uk/pocket_guides/index.json";
        guideUrl = "http://www.pocketguide-cm.bham.ac.uk/pages.json";
    }
    else {
        if (!localStorage.getItem('pocketguide')) {
            guideUrl = "data/pocket-guide.json";
        }
    }
    
    guide = new kendo.data.DataSource({
		transport: {
            read: function(operation) {
	            var cachedData = localStorage.getItem("pocketGuide");
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
    var myFilter = { logic: "and", filters: [{field: "ParentId", operator: "eq", value: 1}] };
    guide.filter(myFilter);
    //analytics
    if (navigator.onLine) {
        ScreenButtonClicked("Pocket Guide");
    }
};


function onGuideIndexClick(e) {

};

function guideSectionShow(e) {
    id = parseInt(e.view.params.id);
    guide.filter({field: "ParentId", operator: "eq", value: id});
};

function onGuideSectionClick(e) {
    
};

function guidePageShow(e) {
    id = parseInt(e.view.params.id);
    guide.filter({field: "id", operator: "eq", value: id});
    
    $(".guide-page-content a").click(function(e){
    	//alert(this.href.substring(0,4));
    	if (this.href.substring(0,4)==="http" && this.href.indexOf("#tabstrip-location") < 0 ) {
            e.preventDefault();
    	    window.open(this.href, '_system');
    	}
    	else {
            return true;
    	}
	});
};

function onPageSectionClick(e) {
    
};