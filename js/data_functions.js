







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
        
function promise_processing(n) {
    //col++;
           
    TA.client.getObject(source_structure[n]).then(function (timeline) {
        //init the title etc
        var title = timeline.rdfs_label;
        //   help_array.push({id:TA.getEntries(source_structure[n]),source:source_structure[n]});
               
                
        return TA.getEntries(source_structure[n],li_sources[n].source);
    }).then(function (entries) {

        for (var i = 0; i < entries[0].length; i++) {
            // console.log(entries[0].length);
            var date = new Date(entries[0][i].timestamp);
            dat = date;
            dates.push({ id: dt++, datum: date });
            date_array.push(date);
            src_date.push(date);
                 
            //  var src = help_array.find(src => src.id === entries);
         
            fin_p(entries[0][i],i,entries[0].length-1,entries[1],date);
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


function fin_p(entry,current,total,my_source,my_date) {
          
    Promise.all(TA.loadEntryContents(entry)).then(values => {
     
        idk=idk+1;
           
    for (var j = 0; j < values.length; j++) {
        var val = values[j];
        var type = TA.client.getRDFObjectType(val);
        links(val.URI,dat,idk,current,total,j,values.length); // kontrola konce nutna
        if (type == "TextContent") {
            var tit;
            xxxx = val.text;
            /* for (var i = 0; i < (xxxx.length/20); i++) {
                 xxxx=  xxxx.slice(0, 20+(i*20)) + '\n' + xxxx.slice(20+(i*20));
             }*/
            tit = rec_title(xxxx,100);
            ct++;


            object_nodes.push({id: idk,source:my_source, date:my_date, content :{ id: idk , title: tit, label: xxxx, x: 0, y: 0, color:'white'}});
                   
            text_data.push({id: idk,content:xxxx});

        


        }else if (type == "Image") {

            photo_data.push({id: idk,content:'<a href="' + val.sourceUrl + '"><img style="' + "width:200px; height:auto;" + '" src="' + val.sourceUrl + '" alt=""></a>'});
        } else if (type == "URLContent") {

            URL_data.push({id: idk,content:'URL: <a href="' + val.sourceUrl + '">' + val.text + '</a>'});
        } else {

        }

    }
   
});
}

function process_info() // seradit, priradit barvu a vztahy XD
{
    for (var i =0; i < li_sources.length; i++)
    {

        //   console.log(object_nodes);
        var result = object_nodes.filter(res => res.source === li_sources[i].source);
              
        //console.log(li_sources[i].source);
        console.log("result");
        console.log(result);
        result.sort(function(a, b) {
            a = new Date(a.date);
            b = new Date(b.date);
            return a>b ? -1 : a<b ? 1 : 0;
        });
        console.log("result sorted");
        console.log(result);
               
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


function links(URI,datesi,kk,current,total,value_count,total_values)
{

    console.log("curr " + current);
    console.log("total " + total);
    console.log("curr value " + value_count);
    console.log(" value total " + total_values);
    var finished = false;
    if(current==total && value_count == (total_values-1)) //reseni pro konec zpracovani 
    {
        finished = true;
    }
    TA.loadLinks(URI,finished).then(function(links) {
            
               
        if (links[0].length > 0) {
            //console.log('Links for ' + URI);


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
    for (var i = 0; i <= li_sources.length; i++) {
        /* (function(index) {
             setTimeout(function() {
                 invoke();}, 2000);
         })(i);*/
        console.log(li_sources[i].source);
        promise_processing(i);
        console.log(i);
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
                    console.log(edges);
                    relations[j].solved = true;
                    relations[i].solved = true;
                }
            }
        }

    }


}
var days;
function getClasses() //  tridy dle data
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

  
   

    var first = date_array[0].getUTCDate();
    console.log(first);
    var last = date_array[date_array.length-1].getUTCDate();
    console.log(last);
    days = (last - first)+1;

  
}







function positioning(){ // TODO - prazdne dny vyresit 


    var adder = 30;
    var distance = 200;
    var cangle = 30;

    getClasses();
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
                        
                //console.log("times");
                //  console.log(j);
                    
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
                   
            nodes.push(array_of_source_nodes[i][j].content);
        }
    }
   
    process_relations();



    
    invoke();
}





