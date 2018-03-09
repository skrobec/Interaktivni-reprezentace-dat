/*
 * gui.js
 * (c) Radek Burget 2017
 */

var GUI = {

}

//==================================================================================

var GUITimelineSet = function(parentElement) {
	this.parent = parentElement;
	this.timelines = [];
	this.timeAxis = new GUITimeAxis(this.parent);
};

GUITimelineSet.prototype.addTimeline = function(uri) {
	var col = $('<div class="col-md-4"></div>');
	this.parent.append(col);
	var panel = this.createTimelineElement(col);
	var timeline = new GUITimeline(this, uri, panel);
	this.timelines.push(timeline);
};

GUITimelineSet.prototype.recomputeOffsets = function(don) {
	//collect all entries
	entries = [];
	for (var i = 0; i < this.timelines.length; i++) {
		Array.prototype.push.apply(entries, this.timelines[i].entries);
	}
	//sort them by date
	entries.sort(function(a, b) {
		var da = Date.parse(a.timestamp);
		var db = Date.parse(b.timestamp);
		return da - db;
	});
	//reset values
	for (var i = 0; i < entries.length; i++)
		entries[i].GUIElem.css('margin-top', '');
	//update the gui
	this.timeAxis.clear();
	if (entries.length > 1) {
		var entry = entries[0];
		var lastdate = new Date(entry.timestamp);
		var lastStart = entry.GUIElem.offset().top;
		var lastEnd = entry.GUIElem.offset().top + entry.GUIElem.outerHeight();
		var curDateBlock = { date: lastdate, start: lastStart };
		var dateBlocks = [ curDateBlock ];
		for (var i = 1; i < entries.length; i++) {
			entry = entries[i];
			var curdate = new Date(entry.timestamp);

			var ofs = lastStart + 20;
			if (curdate.toDateString() != lastdate.toDateString()) {
				//console.log(curdate.toDateString() + " x " + lastdate.toDateString());
				curDateBlock.end = lastEnd;
				curDateBlock = { date: curdate, start: entry.GUIElem.offset().top };
				dateBlocks.push(curDateBlock);
				ofs = lastEnd + 10;
			}
			
			var dif = ofs - entry.GUIElem.offset().top;
			if (dif > 0)
				entry.GUIElem.css('margin-top',  dif+'px');
			
			lastdate = curdate;
			lastStart = entry.GUIElem.offset().top;
			lastEnd = Math.max(lastEnd, entry.GUIElem.offset().top + entry.GUIElem.outerHeight()); 
		}
		curDateBlock.end = lastEnd;
		if (don == 1)
		{
           // relations(entries);
		}
		
		this.timeAxis.refresh(dateBlocks);
	}
};

var ele;
var done = 0;
function relations(entries){
  
    if (done == 0) {
        done = 1;
       // var st = $('<div class="svg_cont"></div>');
       // ele.append(svg);
        var svg = $('<svg style="left:0px; top:0px; position: absolute;" height="21000" width="1500"></svg>');
        ele.append(svg);
       // st.append(svg);
        for (var i = 0; i <  entries.length; i++) {
            entry = entries[i];
            var posun = entry.GUIElem.offset().left;
            var top = entry.GUIElem.offset().top;
            var vyska = entry.GUIElem.height();
          //  alert(vyska);
            var f = top + vyska;
           // alert(f);
            //var rect = entry.getBoundingClientRect();
           // var svg = $('<div id="' + i + '" style="left:' + posun + 'px; top:' + f + 'px; position: absolute;"><svg height="210" width="500"><line x1="' + posun + '" y1="' + top + '" x2=" ' + posun + ' + 200" y2="200 +' + top + '" style="stroke:rgb(255,0,0);stroke-width:2" /></svg></div>');
           // var svg = $('<div id="' + i + '" style="left:' + posun + 'px; top:' + f + 'px; position: absolute; width:1500; height:21000;"><svg height="21000" width="1500"><line x1="' + 100 + '" y1="' + 100 + '" x2="' + 700 + '" y2="' + 10000 + '" style="stroke:rgb(255,0,0);stroke-width:2" /></svg></div>');
            //var svg = $('<svg  height="21000" width="1500"><line x1="' + posun + '" y1="' + f + '" x2="' + 700 + ' + 200" y2="200 +' + 10000 + '" style="stroke:rgb(255,0,0);stroke-width:2" /></svg>');
            // var svg = $('<svg id="' + i + '" style="left:' + posun + 'px; top:' + f + 'px; position: absolute;" height="100%" width="100%"><line x1="' + posun + '" y1="' + f + '" x2=" ' + 700 + '" y2="' + 10000 + '" style="stroke:rgb(255,0,0);stroke-width:2" /></svg>');
            var oof = $('<line x1="' + posun + '" y1="' + f + '" x2=" ' + 700 + '" y2="' + 10000 + '" style="stroke:rgb(255,0,0);stroke-width:2" />');
            //var oof = $('<line x1="500" y1="500" x2="200" y2="200" style="stroke:rgb(255,0,0);stroke-width:2" />');
           svg.append(oof);
        }
        //ele.append(oof);
    }

};

GUITimelineSet.prototype.createTimelineElement = function(parent) {
	var ret = $('<div class="timeline panel panel-primary"></div>');
	parent.append(ret);
	return ret;
};

//==================================================================================

var GUITimeline = function(parentSet, uri, element) {
	this.parentSet = parentSet;
	this.uri = uri;
	this.el = element;
	//ele = this.el;
	this.entries = [];
	
	var client = this;
	TA.client.getObject(this.uri).then(function(timeline) {
		//init the title etc
		client.initTimeline(timeline);
		//load and add the entries
		TA.getEntries(client.timeline.URI).then(function (entries) {
			client.addEntries(entries);
		});
	});
	
};

GUITimeline.prototype.initTimeline = function(timeline) {
	this.timeline = timeline;
	console.log('init uri: ' + this.uri);
	
	//create panel header
	var title = this.timeline.rdfs_label;
	if (!title) title = this.uri;
	this.el.append('<div class="panel-heading"><h3 class="panel-title" title="' + this.uri + '">' + title + '</h3></div>');
};

GUITimeline.prototype.addEntries = function(entries) {
    //console.log(entries);
    var don = 0;
    for (var i = 0; i < entries.length; i++) {
        if (i == (entries.length - 1))
        {
            don = 1;
        }
		this.addEntry(entries[i],don);
	}
};

GUITimeline.prototype.addEntry = function(entry,don) {
	this.entries.push(entry);
	
	//create the DOM representation of the entry
	var date = new Date(entry.timestamp);
	var elem = $('<div class="entry"><div>').attr('resource', entry.URI);
	elem.append($('<div class="timestamp"></div>').text(date.toLocaleString()));
	this.el.append(elem);
	entry.GUIElem = elem; // jqerry element
	
	//load and represent the contents
	var self = this;
	Promise.all(TA.loadEntryContents(entry)).then(function(values) { //zjistit kde co je 
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
		self.parentSet.recomputeOffsets(don);
	});
	
};
var ct = 0;
GUITimeline.prototype.appendLinks = function(parent, uri) {
	TA.loadLinks(uri).then(function(links) {
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
						'[<a href="#" class="etime">' + dtime.toLocaleString() + ''+ '</a>] ' +
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

//==================================================================================
function myFunction() {
    var x = document.getElementsByClassName("links");
    if (x[0].display === "none") {
        x[0].display = "block";
    } else {
        x[0].display = "none";
    }
}
function hide(i) {
    var x = document.getElementById(i);
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}
var GUITimeAxis = function(parentElement) {
    this.el = $('<div class="timeaxis"></div>');
    ele = parentElement;
    parentElement.append(this.el);
   
};

GUITimeAxis.prototype.clear = function() {
	this.el.empty();
};

GUITimeAxis.prototype.refresh = function(blocks) {
	this.clear();
	for (var i = 0; i < blocks.length; i++) {
		var block = blocks[i];
		var blockEl = $('<div class="day"><span>' + block.date.toLocaleDateString() + '<span></div>');
		this.el.append(blockEl);
		
		var ofs = block.start - blockEl.offset().top;
		if (ofs > 0)
			blockEl.css('margin-top', ofs + 'px');
		blockEl.css('height', (block.end - block.start) + 'px');
	}
};
