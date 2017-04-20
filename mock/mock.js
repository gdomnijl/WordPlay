
var svg_width  = 800;
var svg_height = 600;

var svg = d3.select('body').append('svg')
            .attr('width', svg_width)
            .attr('height', svg_height)

manyBody = d3.forceManyBody()
             .strength(-5);

var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.id))
        .force("charge", manyBody)
        .force("center", d3.forceCenter(svg_width/2, svg_height/2));

  var nodes = []
    var links = []
    
d3.json('MOCK_DATA.json', function(data) {
  
    for(row of data) {
        nodes.push({"word": row.Word, "frequency":row.Frequency});
        links.push({"source": "test", "target": row.Word, "value": row.Similarity});
        
    }
    console.log(nodes);
    console.log(links);
})


var link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("stroke-width", function(d){return 2*d.value}); 

var node = svg.append("g")
                .attr("class", "nodes")
                .selectAll("rect")
                .data(nodes)
                .enter().append("rect")
                .attr("width", function(d) {return d.frequency*10;})
                .attr("height", function(d) {return d.frequency*10;})
                .attr("fill", "red")
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

  

  
  simulation.nodes(nodes)
    .on("tick", ticked);

  simulation.force("link")
    .links(links);

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
