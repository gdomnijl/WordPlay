var svg_width  = 800;
var svg_height = 800;

var svg = d3.select('body').append('svg')
            .attr('width', svg_width)
            .attr('height', svg_height)
            .attr("class", "graph-svg-component");

var manyBody = d3.forceManyBody()
                 .strength(-500);

var simulation = d3.forceSimulation()
        .force("center", d3.forceCenter(svg_width/2, svg_height/2))
        .force("link", d3.forceLink().id(d => d.word))
        .force("collide", d3.forceCollide(30).strength(0.2))//.iterations(16))
        .force("charge", manyBody)
        .force("y", d3.forceY(0))
        .force("x", d3.forceX(0));
    

//random number generator 
function randomWholeNum(diff,min) {
    var randNum = Math.floor(Math.random() * diff) + min
    console.log(randNum);
    return randNum;
}

//MACRO CONSTANTS:
//# of neighboring nodes:
var NUM_NEIGHBOR = 3;
//# 
var MIN_SIM = 0.3;
//future: var NUM_LAYERS = 10;

var nodes = []
var nodeSet = new Set([]);
var pairSet = new Set([]);
var subnodeMap = new Map();
var parentMap = new Map();
var layers = [[]];
var links = []
var focus_node = null;
var highlight_node = null;
var highlight_color = "blue";
var default_link_color = "#888";

function indexNodes(data, index){
    if(data[index].Similarity >= MIN_SIM) {
        var pair = (data[index].Source+data[index].Target);
        if(!pairSet.has(pair)) {
            pairSet.add(pair);
        
            
        if(!parentMap.has(data[index].Source)) {
            parentMap.set(data[index].Source, 0);
        }
        //Adding only Target node in subnodeMap 
        //and logging the position they are at 
        //**if no, add in the Target node as the first node
        if(!subnodeMap.has(data[index].Target)) {
            subnodeMap.set(data[index].Target, 1);
            var numNodes = parentMap.get(data[index].Source);
            parentMap.set(data[index].Source, numNodes + 1);        
        } else {
        //**if yes, increment current index and add in its position
            var numNodes = parentMap.get(data[index].Source);
            parentMap.set(data[index].Source, numNodes + 1);
            
           // var previndex = subnodeMap.get(data[index].Target);
          //  var curindex = Math.min(previndex, numNodes + 1)
            subnodeMap.set(data[index].Target, numNodes + 1);
           // console.log("hit same target");
          //console.log(index);
        }  
}
}
}

function addToGraph(data,index){
   
    if(subnodeMap.get(data[index].Target) <= NUM_NEIGHBOR && 
       subnodeMap.get(data[index].Source) <= NUM_NEIGHBOR){
       //check if the nodes already exist in the set
        //if not push in nodes array AND add to nodeSet
        if(!nodeSet.has(data[index].Source)) {
            nodes.push({"word": data[index].Source,
                        "id": nodeSet.size});
            var cur = nodeSet.size;
            nodeSet.add(data[index].Source);
            layers.push(cur);
        }

        if(!nodeSet.has(data[index].Target)) {
            nodes.push({"word": data[index].Target,
                       "id": nodeSet.size});
            var cur = nodeSet.size;
            nodeSet.add(data[index].Target);
            var cur2 = layers.length;
           // layers[cur2].push(cur);
        }
       
    links.push({
         "source": data[index].Source,
         "target": data[index].Target, 
         "value": parseFloat(data[index].Similarity)});
        
    }
    }

d3.queue()
.defer(d3.json, 'maddie.json')
.await(function(error,data){

    console.log(data);
    //Step 0: Record the first entry as the central word
    var centralWord = data[0].Source;
    
    //Step 1: Sort the entries alphabetically according to Source 
    function compareStrings(a, b) {
        return (a < b) ? -1 : (a > b) ? 1 : 0;
    }
    data.sort(function(a, b) {
        return compareStrings(a.Source, b.Source);
    })
    //Check:
    //console.log("sorted:");
    //console.log(data);
    
    //Step 2: Select which data rows to put into graph
    for(var i = 0; i < data.length; i ++) {
    
          indexNodes(data,i);
        //Make sure the central word always show
          subnodeMap.set(centralWord, 0);
          addToGraph(data,i);       
   
    }
    console.log("subnodeMap:");
    console.log(subnodeMap);
    console.log("parentMap:");
    console.log(parentMap);
    console.log("node");
    console.log(nodes);
    //Step 3: After nodes/links are filled in
    //Set up colorScale and sizeScale according to the max and min
    
    //Extracting just the value arrays
    var values = links.map(function(a) {return a.value;});
   // console.log(values);
    var maxVal = Math.max(...values);
    var minVal = Math.min(...values);
    console.log(maxVal,minVal); 
    var colorScale = d3.scaleLinear()
                    .domain([Math.max(minVal, MIN_SIM), maxVal])
                    //.range(["#88EEC2","#00193D"]);
                    .range(["#A2BDDF", "#00234D"]);
    var sizeScale = d3.scaleLog()
                    .domain([minVal,maxVal])
                    .range([2,8]);
   
    //Step 3: Set up link and node
    var link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
    //The more similar the words are, the thicker the links
            .attr("stroke-width", 3)
            .attr("stroke", d => colorScale(d.value)); 

	
     var node = svg.selectAll(".node")
                .data(nodes)
                .enter().append("g")
                .attr("class", "nodes")
                .append("circle")
                .attr("id", d => d.word)
    //Arbitrarily setting node of size 10
                .attr("r", 10)
                .attr("fill", function(d){
                    if(d.word == centralWord){ return "black"; } 
                    else {return "#FF9B71";}})
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
    
    var text = svg.selectAll(".nodes")
    .data(nodes)
    .append("text")
    .attr("dx",10)
    .attr("dy", ".35em")
    .text(function(d) { return d.word});
    

    simulation.nodes(nodes)
    .on("tick", ticked);

    simulation.force("link")
    .links(links)
    //The more similar the words, the closer they are
    .distance(d => sizeScale(1-d.value));
    
    
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
		      return o.source.index == d.index || o.target.index == d.index ? highlight_color : colorScale(o.value)})
            }}

function exit_highlight(){
		highlight_node = null;
	if (focus_node===null){
		svg.style("cursor","move");
		if (highlight_color!="white"){
  	       node.style("stroke", "white");
	       text.style("font-weight", "normal");
	       link.style("stroke", function(o) {return (/*isNumber(o.Similarity) && */ o.value>=0)?colorScale(o.value):default_link_color});
        }
			
	}
}
 




    ////////Searchbox
var optArray = [];
for (var i = 0; i < nodes.length - 1; i++) {
    optArray.push(nodes[i].word);
}
optArray = optArray.sort();

$(function () {
    $("#search2").select2({
  data: optArray,
  placeholder: "Select a node",
  //allowClear: true
})});

    
/* Not working
//**********Feature B: expel nodes beyond threshold
    //adjust threshold

function threshold(thresh) {
    links.splice(0, links.length);

		for (var i = 0; i < links.length; i++) {
			if (links[i].value > thresh) {links.push(links[i]);}
		}
    restart();
}


//Restart the visualisation after any node and link changes

function restart() {
	
	link = link.data(links);
	link.exit().remove();
	link.enter().insert("line", ".node").attr("class", "link");
	node = node.data(nodes);
	node.enter().insert("circle", ".cursor").attr("class", "node").attr("r", 5).call(force.drag);
	force.start();
}*/

//**********Feature A: highlight 

    //Toggle stores whether the highlighting is on
    var toggle = 0;

    //Create an array logging what is connected to what
    var linkedByIndex = {};

    //Every node is linking to itself 
    for (i = 0; i < nodes.length; i++) {
        linkedByIndex[i + "," + i] = 1;
    };

    //Logging from links array
    links.forEach(function (d) {
        linkedByIndex[d.source.index + "," + d.target.index] = 1;
    });

    //This function looks up whether a pair are neighbours  
    function neighboring(a, b) {
        return linkedByIndex[a.index + "," + b.index];
    }

    function connectedNodes() {

        if (toggle == 0) {
            //Reduce the opacity of all but the neighbouring nodes
            d = d3.select(this).node().__data__;
            node.style("opacity", function (o) {
                return neighboring(d, o) | neighboring(o, d) ? 1 : 0.05;
            });

            link.style("opacity", function (o) {
                return d.index==o.source.index | d.index==o.target.index ? 1 : 0.003;
            });

            text.style("opacity", function (o) {
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
    })


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

//**************For Searchbox
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

$("#ex6").bootstrapSlider();
$("#ex6").on("slide", function(slideEvt) {
    $("#ex6SliderVal").text(slideEvt.value);
});


var r = $('#score').bootstrapSlider()
    .on('slideStop', function(ev){
    var value = r.getValue();
        if(value >= 1 && value <= 5){
            $('.slider-selection').css('background', 'red');
        }
        else if(value > 5 && value <= 8) {
            $('.slider-selection').css('background', 'orange');
        }
        else if(value > 8 && value <= 10) {
            $('.slider-selection').css('background', 'green');
        }
        $('#lbl').val = value;
    })
    .data('slider');
