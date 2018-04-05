

function source_processing(idx)
{
    if (idx < sources.length)
    {
        promise_processing(idx);
    }
}

var idk = 1;
var dt = 1;
var cr = 0;
var dat;
var ct;
var col = 0;
var done =0;
var help_array = [];
var node_counter = 0;
var cam_node_dates = [];
        
function promise_processing(n) { // data gathering
    //col++;
           
    TA.client.getObject(source_structure[n]).then(function (timeline) {
        //init the title etc
        var title = timeline.rdfs_label;             
        return TA.getEntries(source_structure[n],li_sources[n].source);
    }).then(function (entries) { // obtaining of entries 

        for (var i = 0; i < entries[0].length; i++) {
            var date = new Date(entries[0][i].timestamp);
            dat = date;
            dates.push({ id: dt++, datum: date });
            date_array.push(date);
            src_date.push(date);
                 
            //  var src = help_array.find(src => src.id === entries);
            // console.log(entries[1]);
            fin_p(entries[0][i],i,entries[0].length-1,entries[1],date); // entry processing
        }
        //  console.log(dates);

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

function clean_up() // function for structure clearing 
{
    array_of_source_nodes.length =0; // pole poli s prvky rozdelenych dle zdroju
   
    idk = 1;
    done=0;
    nodes.length =0;
    edges.length =0;
    promises_array.length =0;
    push_promises.length =0;
    dates.length =0; // struktura pro datum
    date_array.length =0;
    object_nodes.length =0;
    distanceArray.length =0;
    distanceClasses.length =0; // struktura pro tridy vzdalenosti dle id
    relations.length =0;
    src_date.length =0;
    text_data.length =0;
    photo_data.length =0;
    URL_data.length =0;
    link_data.length =0;
}


function fin_p(entry,current,total,my_source,my_date) { // getting data of entry 
          
    node_counter++;
    Promise.all(TA.loadEntryContents(entry)).then(values => { // load of all data connected with entry 
     
        //  console.log(total);
        idk=idk+1;
           
    for (var j = 0; j < values.length; j++) { // going trough values and storing data into specified structures
        var val = values[j];
        var type = TA.client.getRDFObjectType(val);
        links(val.URI,dat,idk,current,total,j,values.length); // function to process link data 
        if (type == "TextContent") {
            var tit;
            xxxx = val.text;
            tit = rec_title(xxxx,100);
            ct++;
            object_nodes.push({id: idk,source:my_source, date:my_date, content_type: 0 ,content :{ id: idk , title: tit, label: val.text, x: 0, y: 0, color:'white',shape: 'dot', image: undefined}});             
            text_data.push({id: idk,content:val.text});

        
        }else if (type == "Image") {
           
            var idx = object_nodes.findIndex((obj => obj.id == idk));// resolving content type for node design

            if(  object_nodes[idx].content_type == 1)
            {
                object_nodes[idx].content_type = 3;
            }
            else
            {
                object_nodes[idx].content_type = 2;
            }
           
            /*   idx = photo_data.findIndex((obj => obj.id == idk));
               if (idx != undefined)
                   photo_data[idx].content += '<a href="' + val.sourceUrl + '"><img style="' + "width:200px; height:auto;" + '" src="' + val.sourceUrl + '" alt=""></a>';
               else*/
            photo_data.push({id: idk,content:'<a href="' + val.sourceUrl + '"><img style="' + "width:200px; height:auto;" + '" src="' + val.sourceUrl + '" alt=""></a>'});

        } else if (type == "URLContent") {

           

            URL_data.push({id: idk,content:'URL: <a href="' + val.sourceUrl + '">' + val.text + '</a>'});
        } else {

        }

    }

});
}

function performance_manage() // setting of network accroding to node numbers 
{
    if (node_counter > 200 && node_counter < 300)
    {
        edge_type = 'continuous';
        console.log("slow ");
       // hide = true;
    }
    else if (node_counter > 300)
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
    for (var i =0; i < li_sources.length; i++)
    {

        var result = object_nodes.filter(res => res.source === li_sources[i].source);

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


function links(URI,datesi,kk,current,total,value_count,total_values) // function for loading of link data and storing them to chosen structures 
{
    var finished = false;
    if(current==total && value_count == (total_values-1)) // check for end of data loading 
    {
        finished = true;
    }
    TA.loadLinks(URI,finished).then(function(links) {
            
               
        if (links[0].length > 0) {
            //console.log('Links for ' + URI);
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
                var dtime = new Date(link.dtime);
                relations.push({id:kk, destination_time:dtime.toLocaleString(), solved:false });
                link_data.push({id:kk,content:'<dd>' +
            '<span class="linkname">' + link.label + '</span> ' +
            '<a href="#" class="proflabel">' + link.srclabel + '</a> ' +
            '(<span class="etext">' + link.text + '</span>) ' +
        '</dd>'});

            }
        }
        if(links[1])
        {
          
            done++;
            if (done == li_sources.length)
            {
                   
                process_info(); //  calling of function to process loaded data
            }
        }
                               
    });
}

function init() //  initialization, start of loading data 
{
    clean_up();
    for (var i = 0; i <= li_sources.length; i++) {
       
        promise_processing(i);
      
    }
}


function process_relations() // function for creating edge relations between nodes according to relation data
{
           
    for(var i =0; i < relations.length; i++)
    { 

        /*  if (relations[i].solved == false)
          {
              var dst_node =  object_nodes.find(dst_node => dst_node.date.toLocaleString() === relations[i].destination_time );
  
              if (dst_node != undefined)
              {
  
                  edges.push({ from: relations[i].id , to: dst_node.id , color:{color:'white'} , width: 5});
                  relations[i].solved = true;
           
                  var idx = relations.findIndex((obj => obj.id == dst_node.id )); // can be array 
                  if (idx > 0)
                  {
                      relations[idx].solved = true;
                  }
              }
          }*/
           
           
        if (relations[i].solved == false)
        {
            for(var j =0; j < relations.length; j++)
            {
                        
                var dst_node =  object_nodes.find(dst_node => dst_node.id === relations[j].id );
                        
                if (relations[i].destination_time == dst_node.date.toLocaleString())
                {
                    edges.push({ from: relations[i].id , to: relations[j].id , color:{color:'white'} , width: 5});
                  
                    relations[j].solved = true;
                    relations[i].solved = true;
                }
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
    day_pos.push(last);
    for (var i =0; i < date_array.length ; i++)
    {
        if (last != date_array[i].getUTCDate() )
        {          
           
            last = date_array[i].getUTCDate();
            day_pos.push(last);
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

        jarray[i] = 0;
    }

    for(var i = 0; i < li_sources.length ; i++)
    {

        changed = false;
        last_date = array_of_source_nodes[i][jplus].date.getUTCDate();
        for(var j = jplus; j < array_of_source_nodes[i].length ; j++)
        {

            if (day_pos[day_counter] != array_of_source_nodes[i][j].date.getUTCDate() ) // leaving cycle if day doesnt belong to current sector 
            {
                 
                break;
            }

            if(j == jplus)
                sector_inix = inix;

            upper_sector_inix = Math.max(upper_sector_inix, inix);  
            jarray[i] = j;

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
            //      console.log("zdroj znovu " +jplus);

        }
        else if(counter == li_sources.length ) // end
        {
            console.log("konec " +jplus);
            break;
        }
        else if(i == li_sources.length-1 ) // sector shift
        {
            if (jarray[0] == 0)
                jplus = jarray[0];
            else
                jplus = 1 + jarray[0];

            i = -1;
            ypos = 0;
            day_counter++;
            inix = day_space_struct[day_counter];
            first_day = true;
           
            //    console.log("sektor posun " +jplus);
        }
        else // source shift
        {
          
            ypos = ypos + 120;
            inix = sector_inix;
            if (jarray[i+1] == 0)
                jplus = jarray[i+1];
            else
                jplus = 1 + jarray[i+1];

            //   console.log("zdroj posun " +jplus);

            first_day = true; 
        }
          
    }

    for(var i = 0; i < li_sources.length ; i++)
    {
        for(var j = 0; j < array_of_source_nodes[i].length ; j++)
        {
            //  console.log(array_of_source_nodes[i][j].content.x + " investigation " + array_of_source_nodes[i][j].content.y);       
            nodes.push(array_of_source_nodes[i][j].content);
            var month = array_of_source_nodes[i][j].date.getUTCMonth() + 1; //months from 1-12
            var day = array_of_source_nodes[i][j].date .getUTCDate();
            var year = array_of_source_nodes[i][j].date.getUTCFullYear();
            cam_node_dates.push({id: array_of_source_nodes[i][j].id,date: day + "." + month + "." + year  });

        }
    }
   
    process_relations(); // Calling function to process relation data and prepare them fro visualisation.



    
    invoke(); // Calling function to visualise the node network. 
}





