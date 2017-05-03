var svg_width  = 800;
var svg_height = 800;

var svg = d3.select('body').append('svg')
            .attr('width', svg_width)
            .attr('height', svg_height)
            .attr("class", "graph-svg-component");

var manyBody = d3.forceManyBody()
                 .strength(-90);
var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.word))
                            //.distance())
        .force("charge", manyBody)
        .force("center", d3.forceCenter(svg_width/2, svg_height/2));


//random number generator 
function randomWholeNum(diff,min) {
    var randNum = Math.floor(Math.random() * diff) + min
    console.log(randNum);
    return randNum;
}

//MACRO CONSTANTS:
var NUM_NEIGHBOR = 10;
var MIN_SIM = 0.3;
//future: var NUM_LAYERS = 10;

var nodes = []
var nodeSet = new Set([]);
var links = []
var focus_node = null;
var highlight_node = null;
var highlight_color = "blue";
var default_link_color = "#888";

function addToGraph(data, index){
    if(data[index].Similarity >= MIN_SIM) {
        
    //check if the nodes already exist in the set
    //if not push in nodes array AND add to nodeSet
    if(!nodeSet.has(data[index].Source)) {
        nodes.push({"word": data[index].Source});
        nodeSet.add(data[index].Source);
    }
    if(!nodeSet.has(data[index].Target)) {
        nodes.push({"word": data[index].Target});
        nodeSet.add(data[index].Target);

    }
    links.push({
         "source": data[index].Source,
         "target": data[index].Target, 
         "value": parseFloat(data[index].Similarity)});
    }
}


d3.queue()
.defer(d3.json, 'red.json')
.await(function(error,data){
    console.log(data);
    //Step 1: Select which data rows to put into graph
    for(var i = 0; i < data.length; i ++) {
        //Since each node is linked to 10 subnodes
        //filter 1st to Nth node within each 10 subnodes
      if (i % 10 <= NUM_NEIGHBOR) {
      //Future: if (Math.floor(i/10) <= NUM_LAYERS) {
          addToGraph(data, i);
           //}
       }
    }
    console.log(links);
    //Step 2: After nodes/links are filled in
    //Set up colorScale and sizeScale according to the max and min
    
    //Extracting just the value arrays
    var values = links.map(function(a) {return a.value;});
    
    var maxVal = Math.max(...values);
    var minVal = Math.min(...values);
    console.log(maxVal,minVal); 
    console.log(Math.max(minVal, MIN_SIM));
    var colorScale = d3.scaleLinear()
                    .domain([Math.max(minVal, MIN_SIM), maxVal])
                     .range(["#e5f5f9", "#2ca25f"]);
    var sizeScale = d3.scaleLinear()
                    .domain([minVal,maxVal])
                    .range([2,8]);
   
    //Step 3: Set up link and node
    var link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
    //The more similar the words are, the thicker the links
            .attr("stroke-width", d=> sizeScale(d.value))
            .attr("stroke", d => colorScale(d.value)); 

	
     var node = svg.selectAll(".node")
                .data(nodes)
                .enter().append("g")
                .attr("class", "nodes")
                .append("circle")
                .attr("id", d => d.word)
    //Arbitrarily setting node of size 10
                .attr("r", 10)
                .attr("fill", function(d,i){
                    if(i == 0){ return "black"; } 
                    else {return colorScale(maxVal);}})
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
    .distance(d => 50*(1-d.value) + 50);
    
    
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
                if (neighboring(d, o)) {
                    return highlight_color;}});
			text.style("font-weight", function(o) {
                return neighboring(d, o) ? "bold" : "normal";});
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
    $("#search").autocomplete({
        source: optArray
    });
});

    
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
                return d.index==o.source.index | d.index==o.target.index ? 1 : 0.05;
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

var  margin = {right: 50, left: 50},
    width = 600,
    height = 100;

var svg2 = d3.select("svg2")
             .attr("width", width)
             .attr("height",height);

var x = d3.scaleLinear()
    .domain([0, 180])
    .range([0, width])
    .clamp(true);

var slider = svg2.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + margin.left + "," + height / 2 + ")");

slider.append("line")
    .attr("class", "track")
    .attr("x1", x.range()[0])
    .attr("x2", x.range()[1])
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
        .on("start.interrupt", function() { slider.interrupt(); })
        .on("start drag", function() { hue(x.invert(d3.event.x)); }));

slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
  .selectAll("text")
  .data(x.ticks(10))
  .enter().append("text")
    .attr("x", x)
    .attr("text-anchor", "middle")
    .text(function(d) { return d + "°"; });

var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

slider.transition() // Gratuitous intro!
    .duration(750)
    .tween("hue", function() {
      var i = d3.interpolate(0, 70);
      return function(t) { hue(i(t)); };
    });

function hue(h) {
  handle.attr("cx", x(h));
  svg2.style("background-color", d3.hsl(h, 0.8, 0.8));
}

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
    var selectedVal = document.getElementById('search').value;
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
