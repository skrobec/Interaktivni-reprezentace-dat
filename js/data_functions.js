

var idk = 1;
var dt = 1;
var dat;
var ct;
var done =0;
var node_counter = 0;
var cam_node_dates = [];
var LinksInfo;
var prom_array = [];

function clean_up() // function for structure clearing 
{
    array_of_source_nodes.length =0; // pole poli s prvky rozdelenych dle zdroju
   
    idk = 1;
    done=0;
    nodes.length =0;
    edges.length =0;
    dates.length =0; // struktura pro datum
    date_array.length =0;
    object_nodes.length =0;
    distanceClasses.length =0; // struktura pro tridy vzdalenosti dle id
    relations.length =0;
    text_data.length =0;
    photo_data.length =0;
    URL_data.length =0;
    link_data.length =0;
    days =1;
    day_pos.length =0;
    LinksInfo = 0;
    prom_array.length =0;
    cam_node_dates.length =0;
    node_counter = 0;
    dt = 1;
    ct = 0;
    dat = 0;
    visnodes = 0;
    visedges = 0;
    idselected = 0;
    loadedField.length =0;
    ar_index=0;
    lastdate =0;
    id1 = 0;
    surplus = 0;
    hideedge = false;
    fc2idx2 = 0;
    sec = false;
    lastselected = 0;
    hide=false;
    edge_type = '';
    network=0;
    colors.length =0;
    alladd.lenght =0;
}

function promise_processing() { // data gathering

    for (var i = 0; i < li_sources.length; i++) {

        prom_array.push(TA.getEntries(source_structure[i],li_sources[i].source));
      
    }

    Promise.all(prom_array).then(entries => {

        for (var j = 0; j < entries.length; j++) {
            console.log(entries[j]);
            for (var i = 0; i < entries[j][0].length; i++) {
                
                var date = new Date(entries[j][0][i].timestamp);
                dat = date;
                dates.push({ id: dt++, datum: date });
                date_array.push(date);
           
                idk++;
                node_counter++;
        
                object_nodes.push({id: idk,source:entries[j][1], entry:entries[j][0][i].URI, entry_object:entries[j][0][i], date: dat, content_type: 0 ,content :{ id: idk , title: "", label: "", x: 0, y: 0, color:'white',shape: 'dot', image: undefined}}); 
  
            }
        }
        process_info();

        });
         
}
        


check_array = [];
function rec_title(str,letters)
{
    if (str.length > letters)
        return str.slice(0,letters) + "...";
    else if(str.length < 10)
        return "";
    else
        return rec_title(str,letters-10);
}

function rec_title2(str,letters)
{
    if (str.length > letters)
        return str.slice(0,letters) + "...";
    else 
        return str;
}



function fin_p2(entry,idf,sit) { // getting data of entry 
          
    Promise.all(TA.loadEntryContents(entry)).then(values => { // load of all data connected with entry 
     
    for (var j = 0; j < values.length; j++) { // going trough values and storing data into specified structures
        var val = values[j];
        var type = TA.client.getRDFObjectType(val);


        links2(val.URI,idf,sit);
        if (type == "TextContent") {
            var tit;
            xxxx = val.text;

            tit = rec_title(xxxx,100);
            ct++;

  
            visnodes.update([{id:idf, title:tit}]);
            text_data.push({id: idf,content:val.text});

        }else if (type == "Image") {
           
            var idx = object_nodes.findIndex((obj => obj.id == idf));// resolving content type for node design


            if (idx != undefined)
            {
                if(  object_nodes[idx].content_type == 1)
                {
                    object_nodes[idx].content_type = 3;
                }
                else
                {
                    object_nodes[idx].content_type = 2;
                }
            }
           
            photo_data.push({id: idf,content:'<a href="' + val.sourceUrl + '"><img style="' + "width:200px; height:auto;" + '" src="' + val.sourceUrl + '" alt=""></a>'});

        } else if (type == "URLContent") {

           

            URL_data.push({id: idf,content:'URL: <a href="' + val.sourceUrl + '">' + val.text + '</a>'});
        } else {

        }

    }
    display_data(idf,sit);
});


}

function links2(URI,kk,sit) // function for loading of link data and storing them to chosen structures 
{
    var finished = true;
    TA.loadLinks(URI,finished).then(function(links) {
            
               
        if (links[0].length > 0) {

            var idx = object_nodes.findIndex((obj => obj.id == kk));
            if(  object_nodes[idx].content_type == 2)
            {
                object_nodes[idx].content_type = 3;
            }
            else
            {
                object_nodes[idx].content_type = 1;
            }
                         

            for (var i = 0; i < links[0].length; i++) {
                var link = links[0][i];
                link_data.push({id:kk,content:'<dd>' +
            '<span class="linkname">' + link.label + '</span> ' +
            '<a href="#" class="proflabel">' + link.srclabel + '</a> ' +
            '(<span class="etext">' + link.text + '</span>) ' +
        '</dd>'});

            }
        }
                    
        display_data(kk,sit);        
    });
}

function design2(idf) // function for assigning specific design to nodes according to their data content
{
  

        var node = object_nodes.find(obj => obj.id === idf);
        console.log(idf + "idk " +node);

        if(  node.content_type == 1)
        {
            visnodes.update([{id:idf, shape:'circularImage', image:'style/relation.png'}]);        
        }
        else if(  node.content_type == 2)
        {
            visnodes.update([{id:idf, shape:'circularImage', image:'style/photo.png'}]); 
        }
        else if(  node.content_type == 3)
        {
            visnodes.update([{id:idf, shape:'circularImage', image:'style/photorelation.png'}]); 
        }


  
}


function design() // function for assigning specific design to nodes according to their data content
{
  
    for (var i = 2; i <= object_nodes.length+1; i++)
    {
      
        var idx = object_nodes.findIndex((obj => obj.id == i));
     
        if(  object_nodes[idx].content_type == 1)
        {
            object_nodes[idx].content.shape = 'circularImage';
            object_nodes[idx].content.image = 'style/relation.png';
        }
        else if(  object_nodes[idx].content_type == 2)
        {
            object_nodes[idx].content.shape = 'circularImage';
            object_nodes[idx].content.image = 'style/photo.png';
        }
        else if(  object_nodes[idx].content_type == 3)
        {
            object_nodes[idx].content.shape = 'circularImage';
            object_nodes[idx].content.image = 'style/photorelation.png';
        }


    }
  
}





function performance_manage() // setting of network accroding to node numbers 
{
    if (node_counter > 300 && node_counter < 500 )
    {
        edge_type = 'continuous';
        console.log("slow ");
        hide = true;
    }
    else if (node_counter > 500)
    {
        edge_type = 'continuous';
        hide = true;
    }
    else
    {
        edge_type = 'dynamic';
    }


}



function process_info() //  function that sorts object nodes, sets their color and adds edges between them
{

    performance_manage();
    design();
    var colcounter=0;
    document.getElementById('balloon').innerHTML = "<div class='pad'></div>";
    for (var i =0; i < li_sources.length; i++)
    {


        var result = object_nodes.filter(res => res.source === li_sources[i].source); //array
        colors.push('rgb(' + (i*30)%255 + ',' + (i*50)%255  + ',' + (i*60)%255  + ')'); 
        var restab;

        if(i == 0)
        {
            restab = "<tr>";
        }

        restab += "<td align='center' width='100px' height='60px'>"
          + "<div class='color-box' style='background-color: rgb(" + (i*30)%255 + ',' + (i*50)%255  + ',' + (i*60)%255  + ");'></div>"
           +          " <div class='legend'>"
           +               "<p class='text-box'>" + rec_title2(li_sources[i].source,20)  + "</p>"
            +          "</div>"
           +      "</td>";

       

        if( i == (li_sources.length-1) )
        {
            document.getElementById('permalegend').innerHTML = restab + "</tr>";
        }
        else if( (i%10) == 0 && i != 0)
        {

            restab += "</tr>";
            restab += "<tr>";
        }
      

        
       result.sort(function(a, b) {
            a = new Date(a.date);
            b = new Date(b.date);
            return b>a ? -1 : b<a ? 1 : 0;
        });


        for (var j = 0; j < result.length; j++)
        { 
           
            result[j].content.color = colors[i];
            if(j != result.length-1)
                edges.push({from: result[j].id, to: result[j+1].id  });
        }
        array_of_source_nodes.push(result);

    } 
 
   
    positioning();

}



function init() //  initialization, start of loading data 
{
        clean_up();
        TA.AllLinks().then(function (LinkArray){
   
            LinksInfo = LinkArray;
            promise_processing();
                 
        });

    
}

function process_relations2()
{
    for(var i =0; i < LinksInfo.results.bindings.length; i++)
    { 
                    
                    var processed = false;
                    var src_node =  object_nodes.find(src_node => src_node.entry === LinksInfo.results.bindings[i].sourceEntry.value );
                    var dst_node =  object_nodes.find(dst_node => dst_node.entry === LinksInfo.results.bindings[i].destinationEntry.value );
                    if (src_node != undefined && dst_node != undefined)
                    {
                        var edge =  edges.filter(edge => edge.from === dst_node.id );
                       
                        if (edge != undefined)
                        {
                            for (var j =0; j < edge.length; j++)
                            {
                                if(edge[j].to == src_node.id )
                                    processed = true;

                            }
                        }
                        if(processed==false)
                        {
                            edges.push({from: src_node.id , to: dst_node.id , color:{color:'white',highlight: 'red'} , width: 3 ,selectionWidth: function (width) {return width*2;}});
                            objIndex = nodes.findIndex((obj => obj.id == src_node.id));
                            objIndex2 = nodes.findIndex((obj => obj.id == dst_node.id));
                            nodes[objIndex].shape = 'circularImage';
                            nodes[objIndex].image = 'style/relation.png';
                            nodes[objIndex2].shape = 'circularImage';
                            nodes[objIndex2].image = 'style/relation.png';
                            white_edges.push({id: src_node.id, from: src_node.id , to: dst_node.id , color:{color:'white'} , width: 5});
                        }
                           
                    }   
                        
         
    }

    
}

var days =1;
var day_pos = [];
function getDays() // function for computing number of days and preparation of day_pos structure for work with sectors
{
    var lastmonth;
    var lastDay;
    var lastYear;
    var idn = 0;
    var last;
          

    var sort_date = function (date_1, date_2) { // ascending sort of days
            
        if (date_1 > date_2) return 1;
        if (date_1 < date_2) return -1;
        return 0;
    };
    date_array.sort(sort_date);
    last = date_array[0].getUTCDate();


    day_pos.push(last + "." + (date_array[0].getUTCMonth() + 1) );
    console.log(date_array);
    for (var i =0; i < date_array.length ; i++)
    {
        if (last != date_array[i].getUTCDate() )
        { 
          
           
            last = date_array[i].getUTCDate();

            var month = date_array[i].getUTCMonth() + 1; //months from 1-12
            var day = date_array[i].getUTCDate();
            var year = date_array[i].getUTCFullYear();
            var com_date = day + "." + month; 

           day_pos.push(com_date);


            days++;
        }
            
        
    }
  
}



function positioning(){ // positioning nodes, creation of day sectors 


    var adder = 30;
    var distance = 200;
    var cangle = 30;

    getDays();
    var lastdate;
    var inix = 0;
    var ypos = 0;

    var lastIdn = 1;
    var cnter = 0;

    var last_date;
    var day_lenght = 2000;
    var day_surplus = 2000;
    var day_space_struct = [];
    var changed =false;
    var first_day = true; 
      
           
    for(var i = 0; i < days ; i++)
    {   
        day_space_struct.push(i*1000);
    }
    var day_counter = 0;
    
    inix = 0;
    ypos = 0;
    day_counter = 0;
    first_day = true; 
    var sector_inix =0; 
    var upper_sector_inix =0;  
    var jplus = 0; 
    var jarray =[]; 
    var counter =0;  
    var crash=0;
    for(var i = 0; i < li_sources.length ; i++)
    {
        jarray[i] = -1; 
        
        if(array_of_source_nodes[i].length == 0)
        {
            counter++;
        }

    }
    var err = 0;
    for(var i = 0; i < li_sources.length ; i++)
    {

        changed = false;

        if(jplus < array_of_source_nodes[i].length)
            last_date = array_of_source_nodes[i][jplus].date.getUTCDate();


       

        err++;
        for(var j = jplus; j < array_of_source_nodes[i].length ; j++)
        {
                


            var comp_day = array_of_source_nodes[i][j].date.getUTCDate() + "." + (array_of_source_nodes[i][j].date.getUTCMonth() + 1);

              if (day_pos[day_counter] != comp_day ) // leaving cycle if day doesnt belong to current sector 
              {                
                  break;
              }

            jarray[i] = j;

            if(array_of_source_nodes[i][j] == "lidovky")
            {

            }
            
            if (last_date != array_of_source_nodes[i][j].date.getUTCDate()) // leaving cycle
            {                       
                   
                first_day = true; 
                break;
                     
            }

                      
            if(inix > (day_space_struct[day_counter+1]-300)) // sector bounds overstepped
            {
                 
                for (var f = day_counter+1; f<day_space_struct.length ; f++ )
                {

                    day_space_struct[f] = day_space_struct[f] + 1000;

                }
                changed = true;
                break;
            }
                       
                      
            inix = inix + 300;
             
            if ( first_day == true) // whole date display ( first day of sector )
            {
                array_of_source_nodes[i][j].content.label = array_of_source_nodes[i][j].date.toLocaleString();
                var idcheck = cam_node_dates.find(cam => cam.id === array_of_source_nodes[i][j].id );
                if(idcheck == undefined)
                {
                    var month = array_of_source_nodes[i][j].date.getUTCMonth() + 1; //months from 1-12
                    var day = array_of_source_nodes[i][j].date .getUTCDate();
                    var year = array_of_source_nodes[i][j].date.getUTCFullYear();
                    cam_node_dates.push({id: array_of_source_nodes[i][j].id,date: day + "." + month + "." + year  });
                }    
               
                first_day = false;
            }                           
            else
            {
                var minute = array_of_source_nodes[i][j].date.getUTCMinutes();
                var hour = array_of_source_nodes[i][j].date.getUTCHours();
                var seconds =array_of_source_nodes[i][j].date.getUTCSeconds();
                var day_time = hour + ":" + minute + ":" + seconds;
                array_of_source_nodes[i][j].content.label = day_time;
            }
            array_of_source_nodes[i][j].content.x = inix;
            array_of_source_nodes[i][j].content.y = ypos;
            last_date = array_of_source_nodes[i][j].date.getUTCDate();
            crash++;
            if (j == array_of_source_nodes[i].length -1)
                counter++;

        }
  
          
        if (changed == true) // source again 
        {
          
            i--;
            inix = sector_inix;
            first_day = true; 

        }
        else if(counter == li_sources.length ) // end
        {
            break;
        }
        else if(i == li_sources.length-1 ) // sector shift
        {
            if (jarray[0] == -1)
                jplus = 0;
            else if (jarray[0] == 0)
                jplus = 1;
            else
                jplus = 1 + jarray[0];

            i = -1;
            ypos = 0;
                
            day_counter++;

            inix = day_space_struct[day_counter];
            sector_inix = inix;
            first_day = true;
           

        }
        else // source shift
        {
          
            ypos = ypos + 120;
            inix = sector_inix;
            if (jarray[i+1] == -1)
                jplus = 0;
            else if (jarray[i+1] == 0)
                jplus = 1;
            else
                jplus = 1 + jarray[i+1];

      

            first_day = true; 
        }
          
    }
 

    for(var i = 0; i < li_sources.length ; i++)
    {
        for(var j = 0; j < array_of_source_nodes[i].length ; j++)
        {
         
            nodes.push(array_of_source_nodes[i][j].content);      

        }
    }
   
    process_relations2();


    
    invoke(); // Calling function to visualise the node network. 
}





