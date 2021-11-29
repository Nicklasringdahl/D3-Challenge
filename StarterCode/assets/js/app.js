// Set up our chart
// ================================
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 50,
  bottom: 60,
  left: 50,
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
  // Format the data
  stateData.forEach(function (data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
  });

  // Create scaling functions
  var xLinearScale = d3
    .scaleLinear()
    .domain([9, d3.max(stateData, (d) => d.poverty)])
    .range([0, width]);

  var yLinearScale = d3
    .scaleLinear()
    .domain([4, d3.max(stateData, (d) => d.healthcare)])
    .range([height, 0]);

  // Create axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Add axis
  chartGroup
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  chartGroup.append("g").call(leftAxis);

  var circlesGroup = chartGroup
    .selectAll("circle")
    .data(stateData)
    .enter()
    .append("circle")
    .attr("cx", (d) => xLinearScale(d.poverty))
    .attr("cy", (d) => yLinearScale(d.healthcare))
    .attr("r", 10)
    .attr("fill", "lightblue")
    .attr("opacity", ".5")
    .attr("stroke", "white");

  chartGroup
    .append("text")
    .style("text-anchor", "middle")
    .style("font-family", "sans-serif")
    .style("font-size", "8px")
    .selectAll("tspan")
    .data(stateData)
    .enter()
    .append("tspan")
    .attr("x", function (data) {
      return xLinearScale(data.poverty);
    })
    .attr("y", function (data) {
      return yLinearScale(data.healthcare - 0.02);
    })
    .text(function (data) {
      return data.abbr;
    });

  // Initalize Tooltip
  var toolTip = d3
    .tip()
    .attr("class", "tooltip")
    .offset([80, -70])
    .style("position", "absolute")
    .style("background", "lightsteelblue")
    .style("pointer-events", "none")
    .html(function (d) {
      return `${d.state}<br>Population In Poverty (%): ${d.poverty}<br>Lacks Healthcare (%): ${d.healthcare}`;
    });

  // tooltip in the chart
  chartGroup.call(toolTip);

  // Add an onmouseover event to display a tooltip
  circlesGroup
    .on("mouseover", function (data) {
      toolTip.show(data, this);
    })

    // Add an on mouseout
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  // Create axes labels
  chartGroup
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left - 5)
    .attr("x", 0 - height / 1.3)
    .attr("dy", "1em")
    .attr("class", "axisText")
    .text("Lacks Healthcare (%)");

  chartGroup
    .append("text")
    .attr("transform", `translate(${width / 2.5}, ${height + margin.top + 30})`)
    .attr("class", "axisText")
    .text("In Poverty (%)");
});
