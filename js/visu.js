

var GUI = {

}

//==================================================================================

var JS = document.createElement('script');
var vis = " ";
var GUITimelineSet = function (parentElement) {
    this.parent = parentElement;
    this.timelines = [];
    this.timeAxis = new GUITimeAxis(this.parent);
};

GUITimelineSet.prototype.addTimeline = function (uri) {
    //var col = $('<div class="col-md-4"></div>');




    //this.parent.append(col);
    //	var panel = this.createTimelineElement(col);
    var timeline = new GUITimeline(this, uri, panel);
    //this.timelines.push(timeline);
};



var ele;
var done = 0;




//==================================================================================

var GUITimeline = function (parentSet, uri, element) {
    this.parentSet = parentSet;
    this.uri = uri;
    this.el = element;
    //ele = this.el;
    this.entries = [];

    var client = this;
    TA.client.getObject(this.uri).then(function (timeline) {
        //init the title etc
        client.initTimeline(timeline);
        //load and add the entries
        TA.getEntries(client.timeline.URI).then(function (entries) {
            client.addEntries(entries);
        });
    });

};
var first;
GUITimeline.prototype.initTimeline = function (timeline) {
    this.timeline = timeline;
    console.log('init uri: ' + this.uri);

    //create panel header
    var title = this.timeline.rdfs_label;
    if (!title) title = this.uri;
    //this.el.append('<div class="panel-heading"><h3 class="panel-title" title="' + this.uri + '">' + title + '</h3></div>');
    first = "id: 1, label: '" + title + "', group: 0},";


};
var nodes;
var edges;
GUITimeline.prototype.addEntries = function (entries) {
    //console.log(entries);
    var don = 0;
    for (var i = 0; i < entries.length; i++) {
        if (i == (entries.length - 1)) {
            don = 1;
        }
        this.addEntry(entries[i], don);
    }
    vis = "var color = 'gray' var len = undefined; var nodes = [" + first + nodes + edges + "var container = document.getElementById('mynetwork');var data = { nodes: nodes, edges: edges };  var options = { nodes: {  shape: 'dot', size: 30,  font: {  size: 32,   color: '#ffffff'   }, borderWidth: 2   }, edges: { width: 2   }  };   network = new vis.Network(container, data, options); ";
    

   
};

GUITimeline.prototype.addEntry = function (entry, don) {
    this.entries.push(entry);

    //create the DOM representation of the entry
    var date = new Date(entry.timestamp);
    var elem = $('<div class="entry"><div>').attr('resource', entry.URI);
    elem.append($('<div class="timestamp"></div>').text(date.toLocaleString()));
    this.el.append(elem);
    entry.GUIElem = elem; // jqerry element

    //load and represent the contents
    var self = this;
    Promise.all(TA.loadEntryContents(entry)).then(function (values) { //zjistit kde co je 
        for (var i = 0; i < values.length; i++) {
            var val = values[i];
            var type = TA.client.getRDFObjectType(val);

            var div = $('<div class="content"></div>');
            div.attr('resource', val.URI);
            if (type == "TextContent") {
                div.addClass('text');
                div.text(values[i].text);
                elem.append(div);
            } else if (type == "Image") {
                div.addClass('image');
                div.append('<a href="' + val.sourceUrl + '"><img src="' + val.sourceUrl + '" alt=""></a>');
                elem.append(div);
            } else if (type == "URLContent") {
                div.addClass('url');
                div.append('URL: <a href="' + val.sourceUrl + '">' + val.text + '</a>');
                elem.append(div);
            } else {
                div.addClass('unknown');
                elem.append($('<div class="content"></div>').text('Unknown ' + type));
            }

            self.appendLinks(elem, val.URI);
        }
       // self.parentSet.recomputeOffsets(don);
    });

};
var ct = 0;
GUITimeline.prototype.appendLinks = function (parent, uri) {
    TA.loadLinks(uri).then(function (links) {
        if (links.length > 0) {
            console.log('Links for ' + uri);
            console.log(links);
            ct++;
            var ul = $('<ul class="links" id=' + ct + '></ul>');
            var bt = $('<div class="bt"><button onclick="hide(' + ct + ')">More</button></div>');
            parent.append(bt);
            parent.append(ul);

            for (var i = 0; i < links.length; i++) {
                var link = links[i];
                var dtime = new Date(link.dtime);
                var li = $('<dl><dt>' +
						'[<a href="#" class="etime">' + dtime.toLocaleString() + '' + '</a>] ' +
					'</dt><dd>' +
						'<span class="linkname">' + link.label + '</span> ' +
						'<a href="#" class="proflabel">' + link.srclabel + '</a> ' +
						'(<span class="etext">' + link.text + '</span>) ' +
					'</dd></dl>');
                ul.append(li);
            }
        }
    });

    /*var links = $('<div class="links"></div>');
	elem.append(links);
	self.loadLinks*/

};


var GUITimeAxis = function (parentElement) {
    this.el = $('<div class="timeaxis"></div>');
    ele = parentElement;
    parentElement.append(this.el);

};


