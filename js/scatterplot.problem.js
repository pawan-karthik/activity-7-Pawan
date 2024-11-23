function scatter_plot(data, svgSelector, {
    title = "",
    xCol = "",
    yCol = "",
    rCol = "",
    colorCol = "",
    margin = { top: 60, right: 60, bottom: 60, left: 60 }
} = {}) {
    const svg = d3.select(svgSelector);
    svg.selectAll("*").remove();

    const width = 600 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => +d[xCol]))
        .range([0, width])
        .nice();

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => +d[yCol]))
        .range([height, 0])
        .nice();

    const rScale = d3.scaleLinear()
        .domain(d3.extent(data, d => +d[rCol]))
        .range([3, 15]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(5);
    const yAxis = d3.axisLeft(yScale).ticks(5);

    chart.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    chart.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

    // Axis labels
    chart.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .style("text-anchor", "middle")
        .text(xCol);

    chart.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .style("text-anchor", "middle")
        .text(yCol);

    // Title
    svg.append("text")
        .attr("class", "title")
        .attr("x", 300)
        .attr("y", 30)
        .style("text-anchor", "middle")
        .text(title);

    // Brush
    const brush = d3.brush()
        .extent([[0, 0], [width, height]])
        .on("start brush end", brushed);

    chart.append("g")
        .attr("class", "brush")
        .call(brush);

    // Points
    chart.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("id", (d, i) => `dot-${i}`)
        .attr("cx", d => xScale(+d[xCol]))
        .attr("cy", d => yScale(+d[yCol]))
        .attr("r", d => rScale(+d[rCol]))
        .attr("fill", d => colorScale(d[colorCol]))
        .style("opacity", 0.7);

    // Brush function
    function brushed(event) {
        const selection = event.selection;
        chart.selectAll(".dot").classed("selected", false);

        if (selection) {
            const [[x0, y0], [x1, y1]] = selection;
            chart.selectAll(".dot")
                .classed("selected", function(d) {
                    const cx = xScale(+d[xCol]);
                    const cy = yScale(+d[yCol]);
                    return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
                });
        }
        updateSelectedList();
    }

    function updateSelectedList() {
        const selectedDots = chart.selectAll(".dot.selected").data();
        const listBox = d3.select("#selected-list");
        listBox.selectAll("li").remove();

        if (selectedDots.length > 0) {
            listBox.selectAll("li")
                .data(selectedDots)
                .enter()
                .append("li")
                .text(d => `${d.Model}: MPG ${d.MPG}, Price $${d.Price}, Engine Size ${d.EngineSizeCI}`);
        }
    }
}

// Load and Process Data
d3.csv("./data/car_sample_data.csv")
    .then(data => {
        // First Scatter Plot: MPG vs Price
        scatter_plot(data, "#figure1", {
            title: "MPG vs Price",
            xCol: "Price",
            yCol: "MPG",
            rCol: "Weight",
            colorCol: "Country"
        });

        // Second Scatter Plot: MPG vs Engine Size
        scatter_plot(data, "#figure2", {
            title: "MPG vs Engine Size",
            xCol: "EngineSizeCI",
            yCol: "MPG",
            rCol: "Price",
            colorCol: "Country"
        });
    });