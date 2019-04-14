var url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

d3.json(url).then(function (json) {
  const baseTemp = json.baseTemperature;
  const dataset2 = [];

  json.monthlyVariance.forEach(function (d) {
    dataset2.push([d.year, d.month, d.variance, baseTemp + d.variance]);
  });

  const w = 1000;
  const h = 700;
  const padding = 80;

  const rw = 12 * ((w - padding) / dataset2.length);
  const rectH = (h - 2 * padding) / 12;

  const minX = d3.min(dataset2, (d, i) => d[0]);
  const maxX = d3.max(dataset2, (d, i) => d[0]);

  const minY = d3.min(dataset2, (d, i) => d[1]);
  const maxY = d3.max(dataset2, (d, i) => d[1]);

  const xScale = d3.scaleTime().
  domain([d3.timeParse('%Y')(minX), d3.timeParse("%Y")(maxX)]).
  range([padding, w - padding]);

  const svgC = d3.select("#visual").
  append("svg").
  attr("width", w).
  attr("height", h);

  var myTool = d3.select("#visual").
  append("div").
  attr("class", "myTool").
  attr("id", "tooltip").
  style("opacity", 0);

  //yaxis
  var yScale = d3.scaleBand().
  domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) //months
  .range([padding, h - padding]).
  padding(0);

  const yAxis = d3.axisLeft(yScale).
  tickFormat(function (d) {
    var date = new Date();
    date.setMonth(d);
    return d3.timeFormat('%B')(date);});

  svgC.append("g").
  attr("id", "y-axis").
  attr("transform", "translate(" + padding + ",-0)").
  call(yAxis);

  // text label for the y axis
  svgC.append("text").
  attr("text-anchor", "end").
  attr("y", 1).
  attr('x', -350).
  attr("dy", ".5em").
  attr("transform", "rotate(-90)").
  text("Months");

  svgC.selectAll("rect").
  data(dataset2).
  enter().
  append("rect").
  attr("class", "cell").
  attr("data-month", (d, i) => dataset2[i][1] - 1).
  attr("data-year", (d, i) => dataset2[i][0]).
  attr("data-temp", (d, i) => dataset2[i][3]).
  attr("x", (d, i) => xScale(d3.timeParse("%Y")(dataset2[i][0]))).
  attr("y", (d, i) => yScale(dataset2[i][1] - 1)).
  attr("width", rw).
  attr("height", (d, i) => yScale.bandwidth(dataset2[i][1] - 1)).
  attr("fill", (d, i) => {
    if (dataset2[i][3] > 9.1) {
      return "#CC0000";
    }
    if (dataset2[i][3] > 8.5) {
      return "#FF0000";
    }
    if (dataset2[i][3] > 7.5) {
      return "#FF8000";
    }
    if (dataset2[i][3] > 6.5) {
      return "#66CC00";
    }
    if (dataset2[i][3] > 5.5) {
      return "#FFFF00";
    } else
    {
      return "#3399FF";
    }
  }).
  on("mouseover", function (d, i) {
    //alert(d[0])
    var lcolor = 0;
    var trip = 200;
    if (dataset2[i][3] > 9.1) {
      lcolor = 5;
      trip = 2200;
    } else
    if (dataset2[i][3] > 8.5) {
      lcolor = 4;
      trip = 1800;
    } else
    if (dataset2[i][3] > 7.5) {
      lcolor = 3;
      trip = 1400;
    } else
    if (dataset2[i][3] > 6.5) {
      lcolor = 2;
      trip = 1000;
    } else
    if (dataset2[i][3] > 5.5) {
      lcolor = 1;
      trip = 600;
    } else
    if (dataset2[i][3] <= 5.5) {
      lcolor = 0;
      trip = 200;
    }
    d3.select(".trianglepointer").transition().delay(100).attr("transform", "translate(" + -(trip / colorScale.range().length / 2) + ",0)");
    d3.select(".LegText").select("text").text(colorLText[lcolor]);
    myTool.transition().duration(200).style('opacity', 0.9);
    myTool.
    html("<strong>Year: </strong> " + d[0] +
    " <br/><strong>Month: </strong> " + d3.timeFormat("%B")(d3.timeParse("%m")(d[1])) +
    " <br/><strong>Temp(C): </strong> " + d[3].toFixed(3)).
    attr("data-year", dataset2[i][0]).
    style("left", d3.event.pageX - 40 + "px").
    style("top", d3.event.pageY - 30 + "px").
    style("display", "inline-block").
    style("opacity", 1);
  }).
  on("mouseout", function (d) {
    myTool.style("display", "none");
  });

  const xAxis = d3.axisBottom(xScale);

  //const yAxis =   
  svgC.append("g").
  attr("id", "x-axis").
  attr("transform", "translate(0," + (h - padding) + ")").
  call(xAxis);

  // text label for the x axis
  svgC.append("text").
  attr("transform", "translate(" + w / 2 + " ," + h + ")").
  text("Year");

  // Description of the heat map
  svgC.append("text").
  attr("id", "description").
  attr("transform", "translate(" + w / 1.5 + " ," + (h - 15) + ")").
  text("Heat Map of Temperatures in Celcius");

  // Legends section
  legends = svgC.append("g").attr("class", "legends").
  attr("id", "legend").
  attr("transform", "translate(" + (padding + 100) + "," + 10 + ")");

  // Legend traingle pointer generator
  var symbolGenerator = d3.symbol().
  type(d3.symbolTriangle).
  size(64);

  var colorHold = ['#3399FF', '#FFFF00', '#66CC00', '#FF8000', '#FF0000', '#CC0000'];
  var colorScale = d3.scaleOrdinal().domain([5.5, 6.5, 7.5, 8.5, 9.5]).range(colorHold);

  //alert(colorScale.range().length)
  legends.append("g").attr("transform", "rotate(180)").append("g").attr("class", "trianglepointer").
  attr("transform", "translate(" + -600 / colorScale.range().length / 2 + ")").
  append("path").attr("d", symbolGenerator());

  //Legend Rectangels
  legends.append("g").attr("class", "LegRect").
  attr("transform", "translate(0," + 15 + ")").
  selectAll("rect").data(colorScale.range()).enter().
  append("rect").attr("width", 200 / colorScale.range().length + "px").attr("height", "20px").attr("fill", function (d) {return d;}).
  attr("x", function (d, i) {return i * (200 / colorScale.range().length);});

  // legend text
  var colorLText = ["Below 5.5C", "5.5C to 6.5C", "6.5C to 7.5C", "7.5C to 8.5C", "8.5C to 9.5C", "> 9.5C"];
  legends.append("g").attr("class", "LegText").
  attr("transform", "translate(0,55)").
  append("text").
  attr("x", 45).
  attr('font-weight', 'normal').
  style("text-anchor", "middle").
  text(colorLText[0]);
});