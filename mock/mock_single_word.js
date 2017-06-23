var svg_width  = 3/4 * window.innerWidth;
var svg_height = 4/5 * window.innerHeight;

var svg = d3.select('#svg').append('svg')
            .attr('width', svg_width)
            .attr('height', svg_height)
            .attr("class", "graph-svg-component");

var g = svg.append("g");
var manyBody = d3.forceManyBody()
                 .strength(-500);


var simulation = d3.forceSimulation()
        .force("center", d3.forceCenter(svg_width/2, svg_height/2))
        .force("link", d3.forceLink().id(d => d.word))
        .force("collide", d3.forceCollide(30).strength(0.2))//.iterations(16))
        .force("charge", manyBody)
        .force("y", d3.forceY(0))
        .force("x", d3.forceX(0));

var sampleArray = ["maddie", "communism", "refugee","psy","microsoft", "apple", "grinnell","iowa","seattle","syria"];

var values;
var maxVal; 
var minVal; 
var colorScale;
var groupColorScale;  
var sizeScale;
    
var linkScale;

    var nodeInMap = [];
    
var node;
var link;
var text;
var nodes = []
var nodeSet = new Set([]);
var pairSet = new Set([]);
var layerMap = new Map();
//Map has all the source nodes as keys, array of objects (its subnodes and respective similarity) as values 
var map = new Map();
var links = []


var toggle;
//Create an array logging what is connected to what
var linkedByIndex;

var focus_node = null;
var highlight_node = null;
var highlight_color = "#66D7D1";
var default_link_color = "#A8A6B3";
var transform = d3.zoomIdentity;

//Indexing source & target info into map for later reference
function indexNodes(row){
        var pair = (row.Source+row.Target);
        if(!pairSet.has(pair)) {
            pairSet.add(pair);
        if(!map.has(row.Source)) {
            map.set(row.Source, []);
        }
            var subnodes = map.get(row.Source);
            subnodes.push({"t":row.Target, "v":row.Similarity});
            map.set(row.Source, subnodes);              
        }
     }

//1. Adding one's sub-node to the graph (to both nodes[] and links[])
//2. Assign their layers 
function addNodeToGraph(source, target, similarity, layer){
      
        //if the subnode is new, assign the next layer to it
         if(!nodeSet.has(target)) {
            nodes.push({"word": target});
            nodeSet.add(target);
             layerMap.set(target,layer);
        //if the subnode already exists in the graph, assign the minimum layer to it (display its closest relation to the central word)
        } else {
            var cur_layer = layerMap.get(target);
            layerMap.set(target,Math.min(cur_layer,layer));
        }
         links.push({
         "source": source,
         "target": target, 
         "value": parseFloat(similarity)});
}

/// MACRO CONSTANTS:
var NUM_NEIGHBOR = 9;  //Max allowed is 9
var MIN_SIM = 0.5;    //Between 0 and 1
var NUM_LAYERS = 1;   //Max allowed is 3 

var centralWord;

// A macro level function that calls addNodeToGraph
function addToGraph(root){
    //Root:
    if(!nodeSet.has(root)) { 
            nodes.push({"word": root});
            nodeSet.add(root);
        layerMap.set(root,0);
        }
    //First layers:
    for (var i = 0; i < NUM_NEIGHBOR + 1; i++) {
    
        var firstee = map.get(root)[i];
   
        //if the firstee is filtered out don't go further
        if(firstee.v >= MIN_SIM && NUM_LAYERS >= 1) {
            
        addNodeToGraph(root,firstee.t,firstee.v,1);
        
        //Second layers:
        for (var j = 0; j < NUM_NEIGHBOR; j++) {
         
            var secondee = map.get(firstee.t)[j]
           
            if(secondee.v >= MIN_SIM && NUM_LAYERS >= 2) {
                if((j == 0) && (secondee.t == root)) {
                    var sub2 = map.get(firstee.t)[j+2];
                    addNodeToGraph(firstee.t,sub2.t,sub2.v,2); 
                } else { 
                    addNodeToGraph(firstee.t,secondee.t,secondee.v,2);       
            
                    if(NUM_LAYERS >= 3) {
                    //Third layers:
                    for (var k = 0; k < NUM_NEIGHBOR; k++) {
                  
                        var thirdee = map.get(secondee.t)[k]
                    
                        if((k == 0) && (thirdee.t == firstee.t)) {
                            var sub3 = map.get(secondee.t)[k+2];
                            addNodeToGraph(secondee.t,sub3.t,sub3.v,3);
                        } else { 
                            addNodeToGraph(secondee.t,thirdee.t,thirdee.v,3);
                        }
                    }
                    }
                }
            }
        }
        }
    }
}

function updateData() {
    nodes.length = 0;
    links.length = 0;
    nodeSet.clear();
    addToGraph(centralWord);
    
    //Extracting just the value arrays
     values = links.map(function(a) {return a.value;});
   // console.log(values);
     maxVal = Math.max(...values);
     minVal = Math.min(...values);
  
  //updating scales:
     colorScale = d3.scaleLinear()
                    .domain([Math.max(minVal, MIN_SIM), maxVal])
                    .range(["#A8A6B3", "#0C0C10"]);

  groupColorScale = d3.scaleOrdinal()
                            .domain([0,1,2,3])
                            .range(["#b30000","#e34a33", "#fc8d59", "#fdcc8a"]);
    
 sizeScale = d3.scaleLog()
                    .domain([minVal,maxVal])
                    .range([2,8]);
    
 linkScale = d3.scaleLog()
                    .domain([minVal,maxVal])
                    .range([0.3,3]);  
}

function restart() {
    
    updateData();
    d3.selectAll('svg').remove();
    
   svg = d3.select('#svg').append('svg')
            .attr('width', svg_width)
            .attr('height', svg_height)
            .attr("class", "graph-svg-component"); 
   g = svg.append("g");
    //Arbitrarily setting node of size 10
          
   var link = svg.select("g")
                .append("g")
                .attr("class", "links")
                .selectAll("line")
                .data(links)
                .enter().append("line")
                //The more similar the words are, the thicker the links
                .attr("stroke-width", d => linkScale(d.value))
                .attr("stroke", "#A8A6B3"); //d => colorScale(d.value));

    var node = svg.select("g")
                .selectAll(".node")
                .data(nodes)
                .enter().append("g")
                .attr("class", "nodes")
                .append("circle")
                .attr("id", d => d.word)
                //Arbitrarily setting node of size 10
                .attr("r", 10)
                .attr("fill", d => groupColorScale(layerMap.get(d.word)))
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))
                .on("click", connectedNodes)
                .on("mouseover", d => set_highlight(d))
                .on("mouseout", d => exit_highlight());


    var text = svg.selectAll(".nodes")
                .data(nodes)
                .append("text")
                .attr("dx", 10)
                .attr("dy", ".35em")
                .text(d => d.word);


    //Step 5: build simulation
    simulation.nodes(nodes)
    .on("tick", ticked);

    simulation.force("link")
    .links(links)
    //The more similar the words, the closer they are
    .distance(d => sizeScale(1-d.value));
    
    simulation.alpha(1).restart();

    function ticked() {
        link
      .attr("x1", d => d.source.x )
      .attr("y1", d => d.source.y )
      .attr("x2", d => d.target.x )
      .attr("y2", d => d.target.y );

        node
      .attr("cx", d => d.x )
      .attr("cy", d => d.y );
        
    ///// make the text moves with the node
    d3.selectAll("text")
      .attr("x", function (d) {
        return d.x;})
       .attr("y", function (d) {
        return d.y;});      
    }



     //This function looks up whether a pair are neighbours  
    function neighboring(a, b) {
            return linkedByIndex[a.index + "," + b.index];
    }
     function connectedNodes() {

            if (toggle == 0) {

                //Reduce the opacity of all but the neighbouring nodes
                d = d3.select(this).node().__data__;
                console.log("d: " );
                console.log(d);
                node.style("opacity", function (o) {
                   return neighboring(d, o) | neighboring(o, d) ? 1 : 0.05;
                    //return d.index==o.source.index | d.index==o.target.index ? 1 : 0.05;

                });

                link.style("opacity", function (o) {
                    return d.index==o.source.index | d.index==o.target.index ? 1 : 0.003;
                });

                text.style("opacity", function (o) {
                    //return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;

                return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
                });
                //Reduce the op
                toggle = 1;
            } else {
                //Put them back to opacity=1
                node.style("opacity", 1);
                link.style("opacity", 1);
                 text.style("opacity", 1);
                toggle = 0;
            }
        }
      
    function set_highlight(d){
           svg.style("cursor","pointer");
           if (focus_node!==null){
               d = focus_node;
           }
                highlight_node = d;

        if (highlight_color!="white"){
              node.style("stroke", function(o) {
                    if (neighboring(d, o) || neighboring(o,d)) {
                        return highlight_color;}});
                text.style("font-weight", function(o) {
                    return (neighboring(d, o)||neighboring(o,d)) ? "bold" : "normal";});
                link.style("stroke", function(o) {
                  return o.source.index == d.index || o.target.index == d.index ? highlight_color : "#A8A6B3"})
                }}

    function exit_highlight(){
            highlight_node = null;
        if (focus_node===null){
            svg.style("cursor","move");
            if (highlight_color!="white"){
               node.style("stroke", "white");
               text.style("font-weight", "normal");
               link.style("stroke", function(o) {return (/*isNumber(o.Similarity) && */ o.value>=0)?"#A8A6B3":default_link_color});
            }
                
        }
    }

    //Toggle stores whether the highlighting is on
    toggle = 0;

    //Create an array logging what is connected to what
    linkedByIndex = [];
    //Every node is linking to itself 
    for (i = 0; i < nodes.length; i++) {
        linkedByIndex[i + "," + i] = 1;
    }

    //Logging from links array
    links.forEach(d => linkedByIndex[d.source.index + "," + d.target.index] = 1 );


for (var i = 0; i < nodes.length - 1; i++) {
    nodeInMap.push(nodes[i].word);
}
    nodeInMap = nodeInMap.sort();

      $(function() {

                $("#wordsearch").select2({
                    data: sampleArray,
                    //placeholder: "Select a node",
                    //allowClear: false
                })
//Need update
                 $("#search2").select2({
                    data: nodeInMap,
                    //placeholder: "Select a node",
                    //allowClear: true
                })

            });

      function searchNode() {
    //find the node
    var selectedVal = document.getElementById('search2').value;
    var node = svg.selectAll(".nodes");
    if (selectedVal == "none") {
        node.style("stroke", "white").style("stroke-width", "1");
    } else {
        var selected = node.filter(function (d, i) {
            return d.word != selectedVal;
        });
        selected.style("opacity", "0");
        var link = svg.selectAll(".links")
        link.style("opacity", "0");
        d3.selectAll(".nodes, .links").transition()
            .duration(5000)
            .style("opacity", 1);
    }
}
}



d3.queue()
.defer(d3.json, "communism.json")
.await(function(error,data){
    
    //Step 0: Record the first entry as the central word
    centralWord = data[0].Source;
    
    //Step 1: Log every relation into map
    for(row of data) {  
          indexNodes(row);
    }
    restart();
})

//problems:
//var central_selected = e.options[e.selectedIndex].value;

function searchWord(){
    var central_selected= document.getElementById('wordsearch').value;

d3.queue()
.defer(d3.json, central_selected + ".json")
.await(function(error,data){
    
    //Step 0: Record the first entry as the central word
    centralWord = central_selected;
    //data[0].Source;
    
    //Step 1: Log every relation into map
    for(row of data) {  
          indexNodes(row);
    }
    restart();
})
}
    
   /* //Step 2: Add nodes into graph
       addToGraph(centralWord);   
 
    //Step 3: Set up colorScale and sizeScale according to the max and min
    
    //Extracting just the value arrays
     values = links.map(function(a) {return a.value;});
     maxVal = Math.max(...values);
     minVal = Math.min(...values);
  

     colorScale = d3.scaleLinear()
                    .domain([Math.max(minVal, MIN_SIM), maxVal])
                    .range(["#A8A6B3", "#0C0C10"]);
   
    groupColorScale = d3.scaleOrdinal()
                            .domain([0,1,2,3])
                            .range(["#b30000","#e34a33", "#fc8d59", "#fdcc8a"]);
    
    sizeScale = d3.scaleLog()
                    .domain([minVal,maxVal])
                    .range([2,8]);
    
    linkScale = d3.scaleLog()
                    .domain([minVal,maxVal])
                    .range([0.3,3]);               
   
    //Step 4: Set up link and node
     link = svg.select("g")
            .append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            //The more similar the words are, the thicker the links
            .attr("stroke-width", d => linkScale(d.value))
            .attr("stroke", "#A8A6B3");//d => colorScale(d.value));
	
      node = svg.select("g")
                .selectAll(".node")
                .data(nodes)
                .enter().append("g")
                .attr("class", "nodes")
                .append("circle")
                .attr("id", d => d.word)
                //Arbitrarily setting node of size 10
                .attr("r", 10)
                .attr("fill", d => groupColorScale(layerMap.get(d.word)))
                
                    .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))
                    .on("click",connectedNodes)
                    .on("mouseover", function(d){
                        set_highlight(d);
                    })
                    .on("mouseout", function(d){
                        exit_highlight();
                    })

             text = svg.selectAll(".nodes")
                        .data(nodes)
                        .append("text")
                        .attr("dx",10)
                        .attr("dy", ".35em")
                        .text(function(d) { return d.word});

    //Step 5: build simulation
    simulation.nodes(nodes)
    .on("tick", ticked);

    simulation.force("link")
    .links(links)
    //The more similar the words, the closer they are
    .distance(d => sizeScale(1-d.value));
    
    //Toggle stores whether the highlighting is on
 toggle = 0;

    //Create an array logging what is connected to what
 linkedByIndex = [];
    //Every node is linking to itself 
    for (i = 0; i < nodes.length; i++) {
        linkedByIndex[i + "," + i] = 1;
    };

    //Logging from links array
    links.forEach(function (d) {
        linkedByIndex[d.source.index + "," + d.target.index] = 1;
    }); 

*/

/*-----------------*/

    //});
    

  

    //*************** For sliders
$("#numNeighbors").on("slide", function(slideEvt) {
    $("#ex6SliderVal").text(slideEvt.value);
    NUM_NEIGHBOR = slideEvt.value;
});

$("#score").on("slide", function(slideEvt) {
    $("#ex6SliderVal").text(slideEvt.value);
    MIN_SIM = slideEvt.value;
});

$("#numLayers").on("slide", function(slideEvt) {
    $("#ex6SliderVal").text(slideEvt.value);
    NUM_LAYERS = slideEvt.value;
});


function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;

}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}





//***************** For Zoom function


svg.call(d3.zoom()
    .scaleExtent([1 / 2, 8])
    .on("zoom", zoomed));

function zoomed() {
  g.attr("transform", d3.event.transform);
}


