var svg_width  = 800;
var svg_height = 800;

var svg = d3.select('body').append('svg')
            .attr('width', svg_width)
            .attr('height', svg_height)

var manyBody = d3.forceManyBody()
                 //.strength();
var collide = d3.forceCollide([1]);
var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.word))
                            //.distance())
        .force("charge", manyBody)
        .force("center", d3.forceCenter(svg_width/2, svg_height/2));

var colorscale = d3.scaleLinear()
                    .domain([0, 20])
                     .range(["#e5f5f9", "#2ca25f"]);

//random number generator 
function randomWholeNum(diff,min) {
    var randNum = Math.floor(Math.random() * diff) + min
    console.log(randNum);
    return randNum;
}

//MACRO CONSTANTS:
var NUM_NEIGHBOR = 10;

var nodes = []
var links = []
var indexRecord = []

function indexSoFar() {
    return indexRecord[indexRecord.length-1];
}

function addToGraph(i, data, selectIndex){
    nodes.push({
        "word": data[i].Word, 
        "frequency":parseFloat(data[i].Frequency)});
    links.push({
         "source": data[selectIndex].Word,
         "target":data[i].Word, 
         "value":parseFloat(data[i].Similarity)});
}



d3.queue()
.defer(d3.json, 'MOCK_DATA.json')
.await(function(error,data){
    
    var indexSoFar = 0;
   // indexRecord.push(0);
   var numNode1 = NUM_NEIGHBOR; //randomWholeNum(20,1);

    //First layer
    for(var i = 0; i < numNode1; i++) {
       
     nodes.push({
         "word": data[i].Word, 
         "frequency":parseFloat(data[i].Frequency)});
    
     links.push({
         "source": "Test", 
         "target":data[i].Word, 
         "value":parseFloat(data[i].Similarity)});
    }
    
    indexRecord.push(numNode1);
    indexSoFar = numNode1;
    console.log("first layer sofar: "+ indexRecord);
    
    nodes.push({
        "word":"Test",
        "frequency": 0.65});

    //Second layer from subnodeA:
    var numNode2A = NUM_NEIGHBOR;
        console.log("subnodeA:")
    var subnodeA = randomWholeNum(numNode1,0);
 
    for(var j = indexSoFar; j < indexSoFar+numNode2A;j++) {
        addToGraph(j, data, subnodeA);
    }
    
    indexRecord.push(indexRecord[indexRecord.length-1] + numNode2A);
    indexSoFar = indexSoFar + numNode2A;
    console.log("second layer sofar: "+ indexRecord);

    //Second layer from subnodeB:
    var numNode2B = NUM_NEIGHBOR;
    console.log("subnodeB:");
    var subnodeB = randomWholeNum(numNode1,0);
    for(var i = indexSoFar; i < indexSoFar + numNode2B; i++) {
        addToGraph(i, data, subnodeB);
    }
        indexRecord.push(indexRecord[indexRecord.length-1] + numNode2B);

    indexSoFar = indexSoFar + numNode2B;
    console.log("second layer sofar: "+indexRecord);

    //Third layer from subnodeAC: 
    var numNode3C = NUM_NEIGHBOR;
    console.log("subnodeC:")
    var subnodeC = randomWholeNum(numNode2A,numNode1);
    
    for(var i = indexSoFar; i < indexSoFar + numNode3C; i++) {
       addToGraph(i,data,subnodeC);
    }
    
    indexRecord.push(indexRecord[indexRecord.length-1] + numNode3C);

    indexSoFar = indexSoFar + numNode3C;
    console.log("third layer sofar: "+indexSoFar);

    //Forth layer from subnode ACD:
      var numNode4D = NUM_NEIGHBOR;
    console.log("subnodeD:")
    var subnodeD = randomWholeNum(numNode4D,numNode1+numNode2A);
    
    for(var i = indexSoFar; i < indexSoFar + numNode4D; i++) {
       addToGraph(i,data,subnodeD);
    }
    indexRecord.push(indexRecord[indexRecord.length-1] + numNode4D);
    indexSoFar = indexSoFar + numNode4D;
    console.log("forth layer sofar: "+ indexRecord);

    
    //Fifth layer from subnode ACDE:
      var numNode5E = NUM_NEIGHBOR;
    console.log("subnodeE:")
    var subnodeE = randomWholeNum(numNode5E,indexRecord[indexRecord.length-1]);
    
    for(var i = indexSoFar; i < indexSoFar + numNode5E; i++) {
       addToGraph(i,data,subnodeE);
    }
    indexRecord.push(indexRecord[indexRecord.length-1] + numNode5E);
    indexSoFar = indexSoFar + numNode5E;
    console.log("fifth layer sofar: "+ indexRecord);
    
    
    var link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
    //The more similar the words are, the thicker the links
            .attr("stroke-width", d=> 5*d.value + 1)
            .attr("stroke", d => colorscale(d.value*10 +5)); 

    var node = svg.append("g")
                .attr("class", "nodes")
                .selectAll("circle")
                .data(nodes)
                .enter().append("circle")
                .attr("id", d => d.word)
    //The more frequent a word is, the bigger it is
                .attr("r", function(d) {return d.frequency * 5 + 5})
                .attr("fill", function(d){
                    if(d.word == "Test"){ return "black"; } 
                    else { return colorscale(d.frequency*10 + 5)}})
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
    
    //---Insert-------

//Toggle stores whether the highlighting is on
var toggle = 0;

//Create an array logging what is connected to what
var linkedByIndex = {};
for (i = 0; i < nodes.length; i++) {
    linkedByIndex[i + "," + i] = 1;
};
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
            return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
        });
        
        link.style("opacity", function (o) {
            return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
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

