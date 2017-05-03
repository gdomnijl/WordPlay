var svg_width  = 800;
var svg_height = 800;

var svg = d3.select('body').append('svg')
            .attr('width', svg_width)
            .attr('height', svg_height)

var manyBody = d3.forceManyBody()
                 //.strength();
//var collide = d3.forceCollide([1]);
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
//future: var NUM_LAYERS = 10;

var nodes = []
var nodeSet = new Set([]);
var links = []

function addToGraph(data, index){
    
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

//Trying to convert csv to json
   // ref: http://stackoverflow.com/a/1293163/2343
    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
//var csv is the CSV file with headers
/*function csvJSON(csv){

  var lines =csv.toString();
      console.log(lines);

  var test = lines.split("\n"); 
    console.log(test);
  var result = [];

  var headers=lines[0].toString().split(",");

  for(var i=1;i<lines.length;i++){

	  var obj = {};
	  var currentline=lines[i].split(",");

	  for(var j=0;j<headers.length;j++){
		  obj[headers[j]] = currentline[j];
	  }

	  result.push(obj);

  }
  
  //return result; //JavaScript object
  return JSON.stringify(result); //JSON
}*/

d3.queue()
.defer(d3.json, 'trump.json')
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
    
    //Getting just the value arrays
    var values = links.map(function(a) {return a.value;});
    
    var maxVal = Math.max(...values);
    var minVal = Math.min(...values);
    console.log(maxVal,minVal); 
    var colorscale = d3.scaleLinear()
                    .domain([minVal,maxVal])
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
            .attr("stroke", d => colorscale(d.value)); 

    var node = svg.append("g")
                .attr("class", "nodes")
                .selectAll("circle")
                .data(nodes)
                .enter().append("circle")
                .attr("id", d => d.word)
    //Arbitrarily setting node of size 10
                .attr("r", 10)
                .attr("fill", function(d,i){
                    if(i == 1){ return "black"; } 
                    else { return colorscale(0.5)}})
                    .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))
                    .on("click",connectedNodes);
                   
	
    
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
        
    }
    
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

            //Reduce the op

            toggle = 1;
        } else {
            //Put them back to opacity=1
            node.style("opacity", 1);
            link.style("opacity", 1);
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

