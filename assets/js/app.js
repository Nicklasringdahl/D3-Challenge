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
var label;

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

//Set starting axises
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

//Create a function to change x data
function xScale(stateData, chosenXAxis) {
  // create scales
  var xLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(stateData, (d) => d[chosenXAxis]) * 0.8,
      d3.max(stateData, (d) => d[chosenXAxis]) * 1.2,
    ])
    .range([0, width]);

  return xLinearScale;
}

function yScale(stateData, chosenYAxis) {
  // create scales
  var yLinearScale = d3
    .scaleLinear()
    .domain([
      d3.max(stateData, (d) => d[chosenYAxis]) * 1.2,
      d3.min(stateData, (d) => d[chosenYAxis]) * 0.8,
    ])
    .range([0, height]);

  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition().duration(1000).call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition().duration(1000).call(leftAxis);

  return yAxis;
}

function renderCircles(circlesGroup, newXScale, chosenXAxis) {
  circlesGroup
    .transition()
    .duration(1000)
    .attr("cx", (d) => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
  var label;

  if (chosenXAxis == "poverty") {
    label = "peeps in poverty:";
  } else if (chosenXAxis == "income") {
    label = "Median household income:";
  } else if (chosenXAxis == "age") {
    label = "Median Age:";
  }

  var Ttip = d3
    .tip()
    .attr("class", "tooltip")
    .offset([80, -70])
    .style("position", "absolute")
    .style("background", "lightsteelblue")
    .style("pointer-events", "none")
    .html(function (d) {
      return `${d[chosenYAxis]}<br>${label} ${d[chosenXAxis]}`;
    });

  circlesGroup.call(Ttip);

  circlesGroup
    .on("mouseover", function (data) {
      Ttip.show(data);
    })
    // onmouseout event
    .on("mouseout", function (data, index) {
      Ttip.hide(data);
    });

  return circlesGroup;
}
// =================================================================
// Import data from the data.csv file

// ==================================================================
d3.csv("data.csv").then(function (stateData) {
  // Parse the data
  stateData.forEach(function (data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.incomeMoe = +data.incomeMoe;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
  });

  var xLinearScale = xScale(stateData, chosenXAxis);
  var yLinearScale = yScale(stateData, chosenYAxis);

  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  var xAxis = chartGroup
    .append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  var yAxis = chartGroup.append("g").classed("y-axis", true).call(leftAxis);

  //chartGroup.append("g").call(leftAxis);

  var circlesGroup = chartGroup
    .selectAll("circle")
    .data(stateData)
    .enter()
    .append("circle")
    .attr("cx", (d) => xLinearScale(d[chosenXAxis]))
    .attr("cy", (d) => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("fill", "lightblue")
    .attr("opacity", ".5")
    .attr("stroke", "white")
    .style("fill", "#83ba31");

  // Create group for three x-axis labels
  var labelsGroup = chartGroup
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  // Create group for three y-axis labels
  var ylabelsGroup = chartGroup.append("g");

  var Povertylabel = labelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 10)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var Incomelabel = labelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 25)
    .attr("value", "income") // value to grab for event listener
    .classed("active", false)
    .text("Household Income (Median)");

  var Agelabel = labelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("active", false)
    .text("Age (Median)");

  var Obeselabel = ylabelsGroup
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 10 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("yvalue", "obese")
    .classed("active", false)
    .text("Obese (%)");

  var Smokeslabel = ylabelsGroup
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 25 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("yvalue", "smokes")
    .classed("active", false)
    .text("Smokes (%)");

  var Healthcarelabel = ylabelsGroup
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 40 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("yvalue", "healthcare")
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  // Add Tooltips

  // Display the Tooltip when hovering with the mouse and hide when moving mouse.
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text").on("click", function () {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {
      // replaces chosenXAxis with value
      chosenXAxis = value;

      console.log(chosenXAxis);

      // functions here found above csv import
      // updates x scale for new data
      xLinearScale = xScale(stateData, chosenXAxis);

      // updates x axis with transition
      xAxis = renderXAxes(xLinearScale, xAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenXAxis === "poverty") {
        Povertylabel.classed("active", true).classed("inactive", false);
        Incomelabel.classed("active", false).classed("inactive", true);
        Agelabel.classed("active", false).classed("inactive", true);
      } else if (chosenXAxis === "income") {
        Povertylabel.classed("active", false).classed("inactive", true);
        Incomelabel.classed("active", true).classed("inactive", false);
        Agelabel.classed("active", false).classed("inactive", true);
      } else if (chosenXAxis === "age") {
        Povertylabel.classed("active", false).classed("inactive", true);
        Incomelabel.classed("active", false).classed("inactive", true);
        Agelabel.classed("active", true).classed("inactive", false);
      }
    }
  });

  ylabelsGroup.selectAll("text").on("click", function () {
    // get value of selection
    var yvalue = d3.select(this).attr("yvalue");
    if (yvalue !== chosenYAxis) {
      // replaces chosenXAxis with value
      chosenYAxis = yvalue;

      console.log(chosenYAxis);

      // functions here found above csv import
      // updates x scale for new data
      yLinearScale = yScale(stateData, chosenYAxis);

      // updates x axis with transition
      yAxis = renderYAxes(yLinearScale, yAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenYAxis === "obese") {
        Obeselabel.classed("active", true).classed("inactive", false);
        Smokeslabel.classed("active", false).classed("inactive", true);
        Healthcarelabel.classed("active", false).classed("inactive", true);
      } else if (chosenYAxis === "smokes") {
        Obeselabel.classed("active", false).classed("inactive", true);
        Smokeslabel.classed("active", true).classed("inactive", false);
        Healthcarelabel.classed("active", false).classed("inactive", true);
      } else if (chosenYAxis === "healthcare") {
        Obeselabel.classed("active", false).classed("inactive", true);
        Smokeslabel.classed("active", false).classed("inactive", true);
        Healthcarelabel.classed("active", true).classed("inactive", false);
      }
    }
  });
});
