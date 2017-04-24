
var svg_width  = 800;
var svg_height = 600;

var svg = d3.select('body').append('svg')
            .attr('width', svg_width)
            .attr('height', svg_height)

var manyBody = d3.forceManyBody()
             .strength(-5);
var collide = d3.forceCollide([1]);
var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.word))
        .force("charge", manyBody)
        .force("center", d3.forceCenter(svg_width/2, svg_height/2));

var colorscale = d3.scaleLog()
                     .domain([Math.min(...nonEmptyCounts), Math.max(...nonEmptyCounts)])
                     .range(["#e5f5f9", "#2ca25f"]);
var nodes = []
var links = []
   
d3.queue()
.defer(d3.json, 'MOCK_DATA.json')
.await(function(error,data){
   //  var n = 1;
    
    //var mock = {nodes, links};
    for(row of data) {
        
        nodes.push({//"id": n,
            "word": row.Word, "frequency":parseFloat(row.Frequency)});
       links.push({"source": "Test", "target":row.Word, "value":parseFloat(row.Similarity)});
     //   n  = n + 1;
    }
    nodes.push({"word": "Test", "frequency": 0.6});
   // console.log(mock);
  //  console.log(nodes);
    //console.log(links);*/
    
    var link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("stroke-width", function(d){return 2*d.value})
            .attr("fill", "blue"); 

    var node = svg.append("g")
                .attr("class", "nodes")
                .selectAll("circle")
                .data(nodes)
                .enter().append("circle")
                .attr("r", function(d) {return d.frequency * 5})
                .attr("fill", function(d) {return colorscale(d.frequency).darker})
                    .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));
    simulation.nodes(nodes)
    .on("tick", ticked);

    simulation.force("link")
    .links(links);

    //forceCollide(1);
    
    function ticked() {
    link
      .attr("x1", d => d.source.x )
      .attr("y1", d => d.source.y )
      .attr("x2", d => d.target.x )
      .attr("y2", d => d.target.y );

    node
      .attr("cx", d => d.x )
      .attr("cy", d => d.y );
        
        //node.each(collide(0.5));
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
