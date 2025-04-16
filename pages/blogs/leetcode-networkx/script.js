// Function to create the heatmap
function createHeatmap(data) {
    console.log('Creating heatmap with data:', data);
    
    // Clear any existing content
    d3.select("#heatmap-container").html("");
    
    // Extract unique solution tags
    const solutionTags = Object.keys(data);
    console.log('Solution tags:', solutionTags);
    
    // Create the heatmap data array
    const heatmapData = [];
    solutionTags.forEach(tag1 => {
        solutionTags.forEach(tag2 => {
            heatmapData.push({
                x: tag1,
                y: tag2,
                value: data[tag1][tag2]
            });
        });
    });
    console.log('Heatmap data array:', heatmapData);

    // Set up the dimensions and margins
    const margin = {top: 100, right: 100, bottom: 100, left: 100};
    const width = 800 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#heatmap-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleBand()
        .range([0, width])
        .domain(solutionTags)
        .padding(0.05);

    const y = d3.scaleBand()
        .range([height, 0])
        .domain(solutionTags)
        .padding(0.05);

    // Create color scale
    const colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateBlues)
        .domain([0, 1]);

    // Add the rectangles
    svg.selectAll()
        .data(heatmapData)
        .enter()
        .append("rect")
        .attr("x", d => x(d.x))
        .attr("y", d => y(d.y))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("rx", 3)
        .attr("ry", 3)
        .style("fill", d => colorScale(d.value))
        .style("stroke", "white")
        .style("stroke-width", 1)
        .on("mouseover", function(event, d) {
            d3.select(this)
                .style("stroke", "black")
                .style("stroke-width", 2);

            const tooltip = d3.select("#heatmap-container")
                .append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px")
                .style("background-color", "white")
                .style("padding", "8px")
                .style("border-radius", "4px")
                .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
                .html(`
                    <strong>${d.x}</strong> ↔ <strong>${d.y}</strong><br>
                    Correlation: ${d.value.toFixed(3)}
                `);
        })
        .on("mouseout", function() {
            d3.select(this)
                .style("stroke", "white")
                .style("stroke-width", 1);
            
            d3.select(".tooltip").remove();
        });

    // Add the x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "12px");

    // Add the y-axis
    svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "12px");

    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "white")
        .text("Solution Tags Correlation Heatmap");

    // Add color legend
    const legendWidth = 200;
    const legendHeight = 20;
    const legend = svg.append("g")
        .attr("transform", `translate(${width - legendWidth},${-80})`);

    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient");

    linearGradient.selectAll("stop")
        .data(colorScale.ticks(10).map((t, i, arr) => ({
            offset: `${100 * i / arr.length}%`,
            color: colorScale(t)
        })))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#linear-gradient)");

    legend.append("text")
        .attr("x", 0)
        .attr("y", -5)
        .style("font-size", "12px")
        .style("fill", "white")
        .text("Correlation Strength");
}

// Function to fetch clusters and populate dropdown
async function fetchClusters() {
    const nClusters = parseInt(document.getElementById('n-clusters').value);
    if (nClusters < 2 || nClusters > 10) {
        alert('Number of clusters must be between 2 and 10');
        return;
    }

    try {
        console.log('Fetching clusters...');
        const response = await fetch(`${config.getBaseUrl()}/api/solution-tags-clusters?n_clusters=${nClusters}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Clusters received:', data);

        // Populate dropdown
        const select = d3.select("#cluster-select");
        select.html(""); // Clear existing options
        
        // Add clusters to dropdown
        data.data.forEach((cluster, index) => {
            select.append("option")
                .attr("value", index)
                .text(`Cluster ${index + 1}`);
        });

        // Add event listener for selection change
        select.on("change", function() {
            const selectedIndex = this.value;
            if (selectedIndex !== "") {
                createHeatmap(data.data[selectedIndex]);
            }
        });

        // Select first cluster by default
        if (data.data.length > 0) {
            select.property("value", "0");
            createHeatmap(data.data[0]);
        }

    } catch (error) {
        console.error('Error in fetchClusters:', error);
        const errorDiv = d3.select("#heatmap-container")
            .append("div")
            .style("color", "red")
            .style("padding", "1rem")
            .style("text-align", "center")
            .style("background-color", "rgba(255, 0, 0, 0.1)")
            .style("border-radius", "4px")
            .style("margin", "1rem 0");

        errorDiv.append("p")
            .text("Error loading clusters:");
        
        errorDiv.append("p")
            .style("font-family", "monospace")
            .text(error.message);
    }
}

// Function to display correlation pairs
function displayCorrelationPairs(pairs, startIndex = 0) {
    const container = d3.select("#correlation-pairs-container");
    container.html(""); // Clear existing content

    const endIndex = Math.min(startIndex + 5, pairs.length);
    const currentPairs = pairs.slice(startIndex, endIndex);

    // Update range display
    d3.select("#pairs-range").text(`${startIndex + 1}-${endIndex}`);

    // Update navigation buttons
    d3.select("#prev-pairs").property("disabled", startIndex === 0);
    d3.select("#next-pairs").property("disabled", endIndex >= pairs.length);

    // Create pair elements
    const pairElements = container.selectAll(".correlation-pair")
        .data(currentPairs)
        .enter()
        .append("div")
        .attr("class", "correlation-pair");

    pairElements.append("div")
        .attr("class", "tags")
        .text(d => `${d.tag1} ↔ ${d.tag2}`);

    pairElements.append("div")
        .attr("class", "correlation")
        .style("color", "white")
        .text(d => `Correlation: ${d.correlation.toFixed(3)}`);
}

// Function to fetch correlation pairs
async function fetchCorrelationPairs() {
    try {
        console.log('Fetching correlation pairs...');
        const response = await fetch(`${config.getBaseUrl()}/api/solution-tags-correlation-ordered`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Correlation pairs received:', data);

        // Store pairs globally
        window.correlationPairs = data.data;
        
        // Display first 5 pairs
        displayCorrelationPairs(window.correlationPairs);

        // Add event listeners for navigation
        d3.select("#prev-pairs").on("click", function() {
            const currentStart = Math.max(0, window.currentStartIndex - 5);
            window.currentStartIndex = currentStart;
            displayCorrelationPairs(window.correlationPairs, currentStart);
        });

        d3.select("#next-pairs").on("click", function() {
            const currentStart = window.currentStartIndex + 5;
            window.currentStartIndex = currentStart;
            displayCorrelationPairs(window.correlationPairs, currentStart);
        });

    } catch (error) {
        console.error('Error in fetchCorrelationPairs:', error);
        const errorDiv = d3.select("#correlation-pairs-container")
            .append("div")
            .style("color", "red")
            .style("padding", "1rem")
            .style("text-align", "center")
            .style("background-color", "rgba(255, 0, 0, 0.1)")
            .style("border-radius", "4px");

        errorDiv.append("p")
            .text("Error loading correlation pairs:");
        
        errorDiv.append("p")
            .style("font-family", "monospace")
            .text(error.message);
    }
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log("Page loaded, initializing visualizations...");
    
    // Add event listener for the fetch clusters button
    const fetchClustersBtn = document.getElementById('fetch-clusters-btn');
    if (fetchClustersBtn) {
        fetchClustersBtn.addEventListener('click', fetchClusters);
    }
    
    // Initialize other visualizations
    fetchCorrelationPairs();
    window.currentStartIndex = 0;
    
    // Initialize recursive clustering
    console.log("Initializing recursive clustering...");
    fetchAndCreateRecursiveClustering();
    
    // Add event listener for the paths button
    const fetchButton = document.getElementById('fetch-paths-btn');
    if (fetchButton) {
        console.log('Found fetch button, adding click listener');
        fetchButton.addEventListener('click', fetchAndDisplayPaths);
    } else {
        console.error('Fetch button not found!');
    }
});

// Recursive Clustering Visualization
function createRecursiveClusteringPlot(data, labels, maxSize) {
    const container = d3.select("#recursive-clustering-container");
    container.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleLinear()
        .domain([d3.min(data, d => d[0]), d3.max(data, d => d[0])])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([d3.min(data, d => d[1]), d3.max(data, d => d[1])])
        .range([height, 0]);

    // Create color scale
    const color = d3.scaleOrdinal()
        .domain(Array.from(new Set(labels[maxSize])))
        .range(d3.schemeCategory10);

    // Add points
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d[0]))
        .attr("cy", d => y(d[1]))
        .attr("r", 4)
        .attr("fill", (d, i) => color(labels[maxSize][i]))
        .attr("opacity", 0.7);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(`Recursive Clustering (Max Size: ${maxSize})`);
}

function fetchAndCreateRecursiveClustering() {
    const container = d3.select("#recursive-clustering-container");
    const maxSizeSelect = d3.select("#max-size-select");
    
    console.log("Attempting to fetch recursive clustering data...");
    
    fetch(`${config.getBaseUrl()}/api/recursive-clustering`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    })
        .then(response => {
            console.log("Response status:", response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Received data:", data);
            // Populate dropdown with available max sizes
            const maxSizes = Object.keys(data.labels);
            console.log("Available max sizes:", maxSizes);
            
            // Clear existing options
            maxSizeSelect.selectAll("option").remove();
            
            // Add new options
            maxSizeSelect.selectAll("option")
                .data(maxSizes)
                .enter()
                .append("option")
                .text(d => d)
                .attr("value", d => d);

            // Create initial plot with first max size
            if (maxSizes.length > 0) {
                createRecursiveClusteringPlot(data.data, data.labels, maxSizes[0]);
            }

            // Add event listener for dropdown changes
            maxSizeSelect.on("change", function() {
                const selectedMaxSize = this.value;
                console.log("Selected max size:", selectedMaxSize);
                createRecursiveClusteringPlot(data.data, data.labels, selectedMaxSize);
            });
        })
        .catch(error => {
            console.error("Error fetching recursive clustering data:", error);
            container.html(`
                <div style="color: red; text-align: center; padding: 20px;">
                    Error loading recursive clustering data: ${error.message}
                </div>
            `);
        });
}

// Lowest Weight Path Visualization
function fetchAndDisplayPaths() {
    console.log('Fetching paths...');  // Debug log
    
    const topK = parseInt(document.getElementById('top-k-input').value);
    const maxEntries = parseInt(document.getElementById('max-entries-input').value);
    
    console.log('Input values:', { topK, maxEntries });  // Debug log
    
    // Validate inputs
    if (topK < 1 || topK > 5) {
        alert('Top K must be between 1 and 5');
        return;
    }
    if (maxEntries < 3 || maxEntries > 15) {
        alert('Max entries must be between 3 and 15');
        return;
    }

    const container = d3.select("#paths-table-body");
    container.html('<tr><td colspan="5" style="text-align: center;">Loading...</td></tr>');

    console.log('Making API request...');  // Debug log
    
    const baseUrl = config.getBaseUrl();
    console.log('Using API base URL:', baseUrl);
    
    // First, try a simple GET request to check if the server is accessible
    fetch(`${baseUrl}/`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        console.log('Server response status:', response.status);
        if (!response.ok) {
            throw new Error(`Server is not responding. Status: ${response.status}`);
        }
        return response.text();
    })
    .then(text => {
        console.log('Server response:', text);
        
        // If server is accessible, proceed with the actual API call
        const url = new URL(`${baseUrl}/api/lowest-weight-path`);
        url.searchParams.append('top_k', topK);
        url.searchParams.append('max_entries', maxEntries);
        
        console.log('Making API request to:', url.toString());
        
        return fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
    })
    .then(response => {
        console.log('API response status:', response.status);
        if (!response.ok) {
            throw new Error(`API error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Received data:', data);
        container.selectAll("*").remove();
        
        if (!data || !data.path) {
            throw new Error('Invalid data format received from server');
        }
        
        data.path.forEach(node => {
            const row = container.append("tr");
            row.append("td").text(node.problem_id);
            row.append("td").text(node.title);
            row.append("td").text(node.rating);
            row.append("td").text(node.tags);
            row.append("td").html(`<a href="${node.link}" target="_blank">View Problem</a>`);
        });
    })
    .catch(error => {
        console.error("Error details:", error);
        container.html(`
            <tr>
                <td colspan="5" style="color: red; text-align: center;">
                    Error loading paths: ${error.message}<br>
                    Please check:<br>
                    1. Is the Flask server running?<br>
                    2. Is the server accessible at ${baseUrl}?<br>
                    3. Check browser console for detailed error messages
                </td>
            </tr>
        `);
    });
}
