

/**
 * Creates a new RDF client.
 */
var RDFClient = function(serverUrl, repositoryName, namespaces) {
	this.url = serverUrl;
	this.repo = repositoryName;
	this.ns = namespaces;
	this.defaultNS = 'rdf';
};

RDFClient.prototype.setDefaultNamespace = function(ns) {
	this.defaultNS = ns;
}

/**
 * Checks the connection to the RDF4J server.
 * @return true or false 
 */
RDFClient.prototype.checkConnection = function() {
	var ret = false;
	$.ajax({
	    url: this.url + '/protocol',
	    type: 'GET',
	    async: false,
	    success: function(msg) {
	    	ret = true;
	    }
	});
	return ret;
};

/**
 * Executes a query on the server.
 */
RDFClient.prototype.sendQuery = function(query) {
	var client = this;
	return new Promise(function(resolve, reject) {
		$.ajax({
		    url: client.url + '/repositories/' + client.repo,
		    type: 'POST',
		    data: query,
		    contentType: 'application/sparql-query',
		    dataType: 'json',
		    headrs: {
		    	Accept: 'application/sparql-results+json'
		    },
		    async: true,
		    success: function (data) {
		        
		    	resolve(data);
		    },
		    error: reject
		});
	});
};

/**
 * Executes an arbitrary query, parses response from RDF4J server and returns date on succes 
 */
RDFClient.prototype.getDateBounds = function (query) {
    var client = this;
    var q = this.getPrefixes() + " " + query;
    return new Promise(function (resolve, reject) {
        var p = client.sendQuery(q);
        p.then(function (data) {
  
            var bindings = data.results.bindings;
            var date = bindings[0].o.value;

            resolve(date);
        }).catch(function (reason) {
            reject(reason);
        });
    });
};

/**
 * Executes query, returns data on succes without parsing them // less processing 
 */
RDFClient.prototype.getAllLinks = function (query) {
    var client = this;
    var q = this.getPrefixes() + " " + query;
    return new Promise(function (resolve, reject) {
        var p = client.sendQuery(q);
        p.then(function (data) {
            resolve(data);
        }).catch(function (reason) {

            reject(reason);
        });
    });
};



/**
 * Executes an arbitrary query and creates an array of objects with the corresponsing properies.
 */
RDFClient.prototype.queryObjects = function(query,finished) {
	var client = this;
	var q = this.getPrefixes() + " " + query;
	return new Promise(function(resolve, reject) {
		var p = client.sendQuery(q);
		p.then(function(data) {
			resolve([client.bindingsToArray(data.results.bindings),finished]);
		}).catch(function(reason) {
			reject(reason);
		});
	});
};

/**
 * Parses the RDF4J server response and creates a set of objects with the given properties.
 */
RDFClient.prototype.bindingsToArray = function(bindings) {
    var ret = [];
 
	for (var i = 0; i < bindings.length; i++) {
	    var item = bindings[i];
		var newitem = {};
		for (var prop in item) {
	
			if (item.hasOwnProperty(prop)) {
				var value;
				if (item[prop].type == 'uri')
					value = { uri: item[prop].value };
				else
				    value = item[prop].value;


				newitem[prop] = value;
			}
		}
		ret.push(newitem);
	}

	return ret;
}


/**
 * Executes a query on the server.
 * @return an object that maps subject URIs to loaded objects.
 */
RDFClient.prototype.getObjectsWhere = function(where) {
	var client = this;
	var w = '?s ?p ?o';
	if (where)
		w += ' . ' + where;
	var query = this.getPrefixes() + 'SELECT ?s ?p ?o WHERE {' + w + '}';
	//console.log('Q: ' + query);
	return new Promise(function(resolve, reject) {
		var p = client.sendQuery(query);
	    p.then(function (data) {
	       
			resolve(client.parseResponseObjects(data));
		}).catch(function(reason) {
			reject(reason);
		});
	});
};

/**
 * Executes a query on the server. The resulting array may be ordered.
 * @return an ordered array of objects found.
 */
RDFClient.prototype.getObjectArrayWhere = function(where, notused , src) { 
   var order = null;
	var client = this;
	var w = '?s ?p ?o';
	if (where)
		w += ' . ' + where;
	var query = this.getPrefixes() + 'SELECT ?s ?p ?o WHERE {' + w + '}';
	if (order)
		query += ' ORDER BY ' + order;
    //console.log('Q: ' + query);
	
	return new Promise(function(resolve, reject) {
	    var p = client.sendQuery(query);

	    p.then(function (data) {

			resolve([client.parseResponseObjectsToArray(data),src]);
		}).catch(function(reason) {
			reject(reason);
		});
	});
}

/**
 * Loads a single object with the given IRI.
 */
RDFClient.prototype.getObject = function(iri) {
	var client = this;
	return new Promise(function(resolve, reject) {
		var p = client.getObjectsWhere('FILTER (?s = <' + iri + '>)');
		p.then(function(objects) {
			resolve(objects[iri]);
		}).catch(function(reason) {
			reject(reason);
		});
	});
}

/**
 * Parses the RDF4J server response and creates a set of objects with the given properties.
 */
RDFClient.prototype.parseResponseObjects = function(data) {
    var ret = {};
   
    var bindings = data.results.bindings;
  
	for (var i = 0; i < bindings.length; i++) {
		var item = bindings[i];
		if (item.s.type == 'uri') { //process only URI subjects
		    var subject = item.s.value;

			var property = this.getPropertyName(item.p.value);
			var value;
			if (item.o.type == 'uri')
				value = { uri: item.o.value };
			else
				value = item.o.value;
			
		    //create a new object when it does not exist yet for the subject URI

			if (ret[subject] === undefined) {
				ret[subject] = { URI: subject };
			}
			ret[subject][property] = value;

		}
	}

	return ret;
};

/**
 * Parses the RDF4J server response and creates an array of objects with the given properties.
 */
RDFClient.prototype.parseResponseObjectsToArray = function(data) {
	var ret = {};
	var uris = []; //subject uris ordered by the query result order
	var bindings = data.results.bindings;
	for (var i = 0; i < bindings.length; i++) {
		var item = bindings[i];
		if (item.s.type == 'uri') { //process only URI subjects
			var subject = item.s.value;
			var property = this.getPropertyName(item.p.value);
			var value;
			if (item.o.type == 'uri')
				value = { uri: item.o.value };
			else
				value = item.o.value;
			
			//create a new object when it does not exist yet for the subject URI
			if (ret[subject] === undefined) {
				ret[subject] = { URI: subject };
				uris[uris.length] = subject;
			}
			//if there are more values for a single property, convert it to array
			if(ret[subject][property] !== undefined) {
				if (!Array.isArray(ret[subject][property])) //convert to array
					ret[subject][property] = [ ret[subject][property] ];
				ret[subject][property][ret[subject][property].length] = value;
			} else {
				ret[subject][property] = value; //a single value
			}
		}
	}
	//replace uris with the objects and return
	for (var i = 0; i < uris.length; i++)
	    uris[i] = ret[uris[i]];

	
	return uris;
};

/**
 * Generates the SPARQL prefix string based on the registered namespaces.
 */
RDFClient.prototype.getPrefixes = function() {
	var ret = '';
	for (var ns in this.ns) {
		if (this.ns.hasOwnProperty(ns)) {
			ret += 'PREFIX ' + ns + ': <' + this.ns[ns] + '>\n';
		}
	}
	return ret;
}

/**
 * Computes an object property name from the property URI according to the currently
 * configured namespaces.
 */
RDFClient.prototype.getPropertyName = function(uri) {
	for (var ns in this.ns) {
		if (this.ns.hasOwnProperty(ns)) {
			var prefix = this.ns[ns];
			if (uri.startsWith(prefix)) {
				var name = uri.substring(prefix.length);
				if (ns == this.defaultNS)
					return name;
				else
					return ns + '_' + name;
			}
		}
	}
	return uri;
};

RDFClient.prototype.getRDFObjectType = function(obj) {
	return this.getPropertyName(obj.rdf_type.uri);
};
