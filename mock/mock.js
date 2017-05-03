var svg_width  = 800;
var svg_height = 600;

                     

var svg = d3.select('body').append('svg')
            .attr('width', svg_width)
            .attr('height', svg_height)
            .attr("class", "graph-svg-component");

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
                     
var nodes = []
var links = []


/// making nodes and link arrays   
d3.queue()
.defer(d3.json, 'MOCK_DATA.json')
.await(function(error,data){
  
    for(var i = 0; i < 20; i++) {
        
        nodes.push({//"id": n,
            "word": data[i].Word, "frequency":parseFloat(data[i].Frequency)});
       links.push({"source": "Test", "target":data[i].Word, "value":parseFloat(data[i].Similarity)});
    }
    nodes.push({"word": "Test", "frequency": 0.6});

    
//fill in links
    var link = svg.append("g")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("class", "links")
    //The more similar the words are, the thicker the links
            .attr("stroke-width", d=> 5*d.value + 1)
            .attr("stroke", d => colorscale(d.value*10 +5)); 

//fill in nodes
var node = svg.selectAll(".node")
              .data(nodes)
              .enter().append("g")
              .attr("class","nodes")
              .append("circle")
              .attr("r", function(d) {return d.frequency * 5 + 5})
    .attr("fill", d => colorscale(d.frequency*10 + 5))
              .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))
                    .on("click",connectedNodes);

//fill in labels
text = svg.selectAll(".nodes")
    .data(nodes)
    .append("text")
    .attr("dx",10)
    .attr("dy", ".35em")
    .text(function(d) { return d.word})


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
    d3.selectAll("text").attr("x", function (d) {
        return d.x;
    })
        .attr("y", function (d) {
        return d.y;
    });

  }

  
/////////// click to highlight function
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

//---End Insert---

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


////////Searchbox
var optArray = [];
for (var i = 0; i < nodes.length - 1; i++) {
    optArray.push(nodes[i].word);
}
optArray = optArray.sort();
console.log("optArray");
console.log(optArray);

$(function () {
    $("#search2").select2({
  data: optArray,
  //placeholder: "Select a state",
  //allowClear: true
});
    
});






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
//// end search box






