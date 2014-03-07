(function (global) {
    guide = new kendo.data.DataSource({
        transport: { 
            read: { 
                //url: "data/pocket-guide.json", 
                url: "http://www.butler.bham.ac.uk/pocket_guides/index.json",
                dataType: "json"
                
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