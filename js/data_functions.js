







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
        
function promise_processing(n) { //zpracování dat 
    //col++;
           
    TA.client.getObject(source_structure[n]).then(function (timeline) {
        //init the title etc
        var title = timeline.rdfs_label;
        //   help_array.push({id:TA.getEntries(source_structure[n]),source:source_structure[n]});
               
                
        return TA.getEntries(source_structure[n],li_sources[n].source);
    }).then(function (entries) {

        for (var i = 0; i < entries[0].length; i++) {
           
            var date = new Date(entries[0][i].timestamp);
            dat = date;
            dates.push({ id: dt++, datum: date });
            date_array.push(date);
            src_date.push(date);
                 
          
            fin_p(entries[0][i],i,entries[0].length-1,entries[1],date);
        }
     

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

function clean_up()
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


function fin_p(entry,current,total,my_source,my_date) {
          
    node_counter++;
    Promise.all(TA.loadEntryContents(entry)).then(values => {
     
          
        idk=idk+1;
           
    for (var j = 0; j < values.length; j++) {
        var val = values[j];
        var type = TA.client.getRDFObjectType(val);
        links(val.URI,dat,idk,current,total,j,values.length); // kontrola konce nutna
        if (type == "TextContent") {
            var tit;
            xxxx = val.text;
        
            tit = rec_title(xxxx,100);
            ct++;


            object_nodes.push({id: idk,source:my_source, date:my_date, content_type: 0 ,content :{ id: idk , title: tit, label: val.text, x: 0, y: 0, color:'white',shape: 'dot', image: undefined}});
                   
            text_data.push({id: idk,content:val.text});
      
        



        }else if (type == "Image") {
           
            var idx = object_nodes.findIndex((obj => obj.id == idk));//rozliseni typu obsahu pro vzhled

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
    /*   if(current==total)
       {
         
           done++;
           if (done == li_sources.length)
           {
              
               process_info();
           }
       }*/
});
}

function performance_manage()
{
    if (node_counter > 300 && node_counter < 500 )
    {
        edge_type = 'continuous';
    
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

function process_info() // seradit, priradit barvu a vztahy 
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

function design()
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


function links(URI,datesi,kk,current,total,value_count,total_values)
{
    var finished = false;
    if(current==total && value_count == (total_values-1)) //reseni pro konec zpracovani 
    {
        finished = true;
    }
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
                   
                process_info();
            }
        }
               
                
    });
}

function init()
{
    clean_up();
    for (var i = 0; i <= li_sources.length; i++) {
       

        promise_processing(i);
      
    }
}








function circleX(distance, coreX , coreY , angle)
{
    var x = coreX + distance * Math.cos(angle * Math.PI/180);
    return x;
}

function circleY(distance, coreX , coreY , angle)
{

    var y = coreY + distance * Math.sin(angle * Math.PI/180);
    return y;
}

function process_relations() //zpracovani vztahu
{
           
    for(var i =0; i < relations.length; i++)
    { 
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
function getDays() //  tridy dle data
{
    var lastmonth;
    var lastDay;
    var lastYear;
    var idn = 0;
    var last;
          

    var sort_date = function (date_1, date_2) { // vzestupne
            
        if (date_1 > date_2) return 1;
        if (date_1 < date_2) return -1;
        return 0;
    };
    date_array.sort(sort_date);
    last = date_array[0].getUTCDay();
    for (var i =0; i < date_array.length ; i++)
    {
        if (last != date_array[i].getUTCDay() )
        {
            last = date_array[i].getUTCDay();
            days++;
        }
            
        
    }

  //  var first = date_array[0].getUTCDate();
  
  //  var last = date_array[date_array.length-1].getUTCDate();
   
  //  days = (last - first)+1;

  
}







function positioning(){ // TODO - prazdne dny vyresit 


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
   // days = 30;
      
           
    for(var i = 0; i < days ; i++)
    {   
        day_space_struct.push(i*1000);
    }
    var day_counter = 0;

    do{
        changed = false;
        inix = 0;
        ypos = 0;
        day_counter = 0;
        first_day = true; 
                


        for(var i = 0; i < li_sources.length ; i++)
        {
            last_date = array_of_source_nodes[i][0].date.getUTCDate();
            for(var j = 0; j < array_of_source_nodes[i].length ; j++)
            {
                        
            
                    
                if (last_date != array_of_source_nodes[i][j].date.getUTCDate())
                {
                        
                    day_counter++;
                    inix = day_space_struct[day_counter];
                    first_day = true; 
                     
                }
                      
                if(inix > (day_space_struct[day_counter+1]-300))
                {
                 
                    for (var f = day_counter+1; f<day_space_struct.length ; f++ )
                    {
        
                        day_space_struct[f] = day_space_struct[f] + 1000;
                        //              console.log(day_space_struct);
                    }
                    changed = true;
                }
                       
                      
                inix = inix + 300;
             
                if ( first_day == true) // cele datum prvniho dne
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
                //  nodes.push(array_of_source_nodes[i][j].content);
                last_date = array_of_source_nodes[i][j].date.getUTCDate();
            }
            ypos = ypos + 120;
            inix = 0;
            day_counter = 0;
            first_day = true; 
        }
    }while(changed == true);

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
   
    process_relations();



    
    invoke();
}





