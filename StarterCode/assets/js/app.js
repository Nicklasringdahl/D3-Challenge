// Set up our chart
// ================================
var svgWidth = 960;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 50,
  bottom: 70,
  left: 100,
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper,
// append an SVG group that will hold our chart,
// =================================
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import data from the data.csv file
// =================================
d3.csv("data.csv").then(function (stateData) {
  // Parse the data
  stateData.forEach(function (data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.incomeMoe = +data.healthcare;
    data.healthcare = +data.healthcare;
  });

  var chosenXAxis = "healthcare";

  function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d[chosenXAxis]) * 0.8,
        d3.max(data, (d) => d[chosenXAxis]) * 1.2,
      ])
      .range([0, width]);

    return xLinearScale;
  }

  // Create x and y axis
  var xAxis = d3
    .scaleLinear()
    .domain([
      d3.min(stateData, (d) => d.poverty) * 0.8,
      d3.max(stateData, (d) => d.poverty) * 1.2,
    ])
    .range([0, width]);
  svg
    .append("g")
    .attr("class", "myXaxis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xAxis))
    .attr("opacity", "1");

  var yAxis = d3
    .scaleLinear()
    .domain([0, d3.max(stateData, (d) => d.healthcare)])
    .range([height, 0]);
  svg.append("g").call(d3.axisLeft(yAxis));

  var circlesGroup = chartGroup
    .selectAll("circle")
    .data(stateData)
    .enter()
    .append("circle")
    .attr("cx", (d) => xAxis(d.poverty))
    .attr("cy", (d) => yAxis(d.healthcare))
    .attr("r", 10)
    .attr("fill", "lightblue")
    .attr("opacity", ".5")
    .attr("stroke", "white")
    .style("fill", "#83ba31");

  chartGroup
    .append("text")
    .style("text-anchor", "middle")
    .style("font-family", "sans-serif")
    .style("font-size", "7px")
    .selectAll("tspan")
    .data(stateData)
    .enter()
    .append("tspan")
    .attr("x", function (data) {
      return xAxis(data.poverty);
    })
    .attr("y", function (data) {
      return yAxis(data.healthcare - 0.02);
    })
    .text(function (data) {
      return data.abbr;
    });

  // Add Tooltips
  var Ttip = d3
    .tip()
    .attr("class", "tooltip")
    .offset([80, -70])
    .style("position", "absolute")
    .style("background", "lightsteelblue")
    .style("pointer-events", "none")
    .html(function (d) {
      return `${d.state}<br>Population In Poverty (%): ${d.poverty}<br>Lacks Healthcare (%): ${d.healthcare}`;
    });

  //
  chartGroup.call(Ttip);

  // Display the Tooltip when hovering with the mouse and hide when moving mouse.
  circlesGroup
    .on("mouseover", function (data) {
      Ttip.show(data, this);
    })

    .on("mouseout", function (data, index) {
      Ttip.hide(data);
    });

  // Create axes labels
  chartGroup
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Lacks Healthcare (%)");

  chartGroup
    .append("text")
    .attr("transform", `translate(${width / 2.5}, ${height + margin.top + 30})`)
    .attr("class", "axisText")
    .text("In Poverty (%)");
});
