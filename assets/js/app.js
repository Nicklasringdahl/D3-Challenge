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
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition().duration(1000).call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition().duration(1000).call(leftAxis);

  return yAxis;
}
//Rendering circles function
function renderCircles(
  circlesGroup,
  newXScale,
  chosenXAxis,
  newYScale,
  chosenYAxis
) {
  circlesGroup
    .transition()
    .duration(1000)
    .attr("cx", (d) => newXScale(d[chosenXAxis]))
    .attr("cy", (d) => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

//Render text function
function renderText(
  circleText,
  newXScale,
  chosenXAxis,
  newYScale,
  chosenYAxis
) {
  circleText
    .transition()
    .duration(1000)
    .attr("x", (d) => newXScale(d[chosenXAxis]))
    .attr("y", (d) => newYScale(d[chosenYAxis]));
  return circleText;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  var label;

  if (chosenXAxis === "poverty") {
    label = "Poverty (%):";
  } else if (chosenXAxis === "income") {
    label = "Median household income:";
  } else if (chosenXAxis === "age") {
    label = "Median Age:";
  }

  if (chosenYAxis === "obesity") {
    ylabel = "Obese(%):";
  } else if (chosenYAxis === "smokes") {
    ylabel = "Smokes (%):";
  } else if (chosenYAxis === "healthcare") {
    ylabel = "Lacks Healtcare (%):";
  }

  var Ttip = d3
    .tip()
    .attr("class", "tooltip")
    .offset([80, -70])
    .style("position", "absolute")
    .style("background", "lightsteelblue")
    .style("pointer-events", "none")
    .html(function (d) {
      return `${ylabel} ${d[chosenYAxis]}<br>${label} ${d[chosenXAxis]}`;
    });

  circlesGroup.call(Ttip);

  circlesGroup
    .on("mouseover", function (data) {
      Ttip.show(data, this);
    })
    // onmouseout event
    .on("mouseout", function (data, index) {
      Ttip.hide(data, this);
    });

  return circlesGroup;
}
// =================================================================
// Import data from the data.csv file

// ==================================================================
d3.csv("data.csv")
  .then(function (stateData) {
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

    var yAxis = chartGroup.append("g").call(leftAxis);

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

    var Obeselabel = labelsGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - (height - 20))
      .attr("x", margin.left * 2.5)
      .attr("value", "obesity")
      .classed("active", false)
      .text("Obesity (%)");

    var Smokeslabel = labelsGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - (height - 40))
      .attr("x", margin.left * 2.5)
      .attr("value", "smokes")
      .classed("active", false)
      .text("Smokes (%)");

    var Healthcarelabel = labelsGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - (height - 60))
      .attr("x", margin.left * 2.5)
      .attr("value", "healthcare")
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    // Add Tooltips
    var circleText = chartGroup
      .selectAll()
      .data(stateData)
      .enter()
      .append("text")
      .text((d) => d.abbr)
      .attr("x", (d) => xLinearScale(d[chosenXAxis]))
      .attr("y", (d) => yLinearScale(d[chosenYAxis]))
      .attr("class", "stateText")
      .attr("font-size", "9");

    // Display the Tooltip when hovering with the mouse and hide when moving mouse.
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    // x axis labels event listener
    labelsGroup.selectAll("text").on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");

      if (true) {
        if (value == "poverty" || value == "income" || value == "age") {
          console.log(value);
          // replaces xProperty with value
          chosenXAxis = value;

          xLinearScale = xScale(stateData, chosenXAxis);

          // updates x axis with transition
          xAxis = renderXAxis(xLinearScale, xAxis);

          // changes classes to change bold text
          if (chosenXAxis === "income") {
            Incomelabel.classed("active", true).classed("inactive", false);
            Povertylabel.classed("active", false).classed("inactive", true);
            Agelabel.classed("active", false).classed("inactive", true);
          } else if (chosenXAxis == "age") {
            Agelabel.classed("active", true).classed("inactive", false);
            Povertylabel.classed("active", false).classed("inactive", true);
            Incomelabel.classed("active", false).classed("inactive", true);
          } else {
            Povertylabel.classed("active", true).classed("inactive", false);
            Incomelabel.classed("active", false).classed("inactive", true);
            Agelabel.classed("active", false).classed("inactive", true);
          }
        }

        // replaces hProperty with value
        else chosenYAxis = value;
        yLinearScale = yScale(stateData, chosenYAxis);

        // changes classes to change bold text
        if (chosenYAxis === "obesity") {
          Obeselabel.classed("active", true).classed("inactive", false);
          Healthcarelabel.classed("active", false).classed("inactive", true);
          Smokeslabel.classed("active", false).classed("inactive", true);
        } else if (chosenYAxis == "healthcare") {
          Healthcarelabel.classed("active", true).classed("inactive", false);
          Obeselabel.classed("active", false).classed("inactive", true);
          Smokeslabel.classed("active", false).classed("inactive", true);
        } else {
          Smokeslabel.classed("active", true).classed("inactive", false);
          Healthcarelabel.classed("active", false).classed("inactive", true);
          Obeselabel.classed("active", false).classed("inactive", true);
        }

        // updates circles with new x values
        circlesGroup = renderCircles(
          circlesGroup,
          xLinearScale,
          chosenXAxis,
          yLinearScale,
          chosenYAxis
        );
        //  update circle text
        circleText = renderText(
          circleText,
          xLinearScale,
          chosenXAxis,
          yLinearScale,
          chosenYAxis
        );

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
      }
    });
  })
  .catch(function (error) {
    console.log(error);
  });
