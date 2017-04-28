var svg_width  = 800;
var svg_height = 600;

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
                     
var nodes = []
var links = []
   
d3.queue()
.defer(d3.json, 'MOCK_DATA2.json')
.await(function(error,data){
d3.json("MOCK_DATA2.json", function(data){
   for(row of data) {
        
        nodes.push({
            "word": row.Word, "frequency":parseFloat(row.Frequency)});
       links.push({"source": row.Word, "target":row.Related, "value":parseFloat(row.Similarity)});
    }

    
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
                .attr("fill", d => colorscale(d.frequency*10 + 5))
                    .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));
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