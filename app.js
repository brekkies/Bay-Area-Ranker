document.addEventListener('DOMContentLoaded', () => {
    
    // Fetch CSV data and generate the chart
    fetch('RawScores.csv')
      .then(response => response.text())
      .then(csvData => {
        const parsedData = Papa.parse(csvData, { header: true }).data; // Parse CSV with headers
        
        // Extract data from CSV
        const rawData = parsedData.map(row => ({
          location: row.Downtown.trim().replace(/"/g, ''),
          scores: {
            CafeScore: +row.CafeScore || 0,
            BookScore: +row.BookScore || 0,
            ParkScore: +row.Parkscore || 0,
            BikeScore: +row.Bikescore || 0,
            TransitScore: +row.Transitscore || 0,
            TreeScore: +row.Treescore || 0,
            Library: +row.Library || 0,
            MovieTheater: +row["Movie Theater"] || 0,
          },
        }));

        initializeChart(rawData);
        setupWeightControls(rawData);
      });


      // Select all filter buttons
      const filterButtons = document.querySelectorAll('.filter-btn');

      // Add event listeners to toggle selected state
      filterButtons.forEach(button => {
        button.addEventListener('click', () => {
          // Toggle selected class
          button.classList.toggle('selected');
          
          // Implement your filtering logic here
          console.log(`Filter toggled: ${button.textContent}`);
        });
      });

      


      const filterRows = document.querySelectorAll('.filter-row');
      const descriptionTitle = document.getElementById('description-title');
      const descriptionText = document.getElementById('description-text');

      // Function to update the description
      function updateDescription(title, description) {
        descriptionTitle.textContent = title;
        descriptionText.textContent = description;
      }

      // Add hover listeners to update the description
      filterRows.forEach(row => {
        row.addEventListener('mouseover', () => {
          const title = row.getAttribute('data-title');
          const description = row.getAttribute('data-description');
          updateDescription(title, description);
        });
      });

      const weights = {
        CafeScore: 0,
        BookScore: 0,
        ParkScore: 0,
        BikeScore: 0,
        TransitScore: 0,
        TreeScore: 0,
        Library: 0,
        MovieTheater: 0,
      };

      function calculateFinalScores(data) {
        // Calculate the maximum possible score
        const maxPossibleScore = Object.keys(weights).reduce((sum, component) => {
          return sum + (weights[component] / 100) * 100; // Normalize each weight to a max of 100
        }, 0);
      
        // Calculate normalized scores for each downtown
        const scores = data.map(row => {
          const rawScore = Object.keys(row.scores).reduce((sum, component) => {
            return sum + row.scores[component] * (weights[component] / 100);
          }, 0);
      
          // Normalize the raw score to a 0-100 scale
          const normalizedScore = (rawScore / maxPossibleScore) * 100;
      
          return { location: row.location, score: normalizedScore };
        });
      
        // Sort scores in descending order
        return scores.sort((a, b) => b.score - a.score);
      }
      
      
      
      let chart;

      function initializeChart(data) {
        const ctx = document.getElementById('downtownChart').getContext('2d');
        
        const finalScores = calculateFinalScores(data);
        const labels = finalScores.map(item => item.location);
        const scores = finalScores.map(item => item.score);

        chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Downtown Scores',
              data: scores,
              backgroundColor: 'rgba(75, 100, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              barThickness: 20,
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: false,
            scales: {
              x: { beginAtZero: true },
              y: {}
            
            },
            onHover: (event, chartElement) => {
              if (chartElement.length > 0) {
                const index = chartElement[0].index; // Get the bar index
                const downtown = chart.data.labels[index]; // Get the bar label (Downtown)
                showDetails(downtown); // Call the function to show details
              } else {
                hideDetails(); // Hide details when not hovering
              }
            },
          }
        });
      }

      function updateChart(data) {
        const finalScores = calculateFinalScores(data);
        const labels = finalScores.map(item => item.location);
        const scores = finalScores.map(item => item.score);
        const colors = generateColors(scores);
      
        chart.data.labels = labels;
        chart.data.datasets[0].data = scores;
        chart.data.datasets[0].backgroundColor = colors;
        chart.update();
      }
      

      function setupWeightControls(data) {
        document.querySelectorAll('input[type="range"]').forEach(slider => {
          slider.addEventListener('input', e => {
            const component = e.target.id.split('-')[1];
            weights[component] = +e.target.value;
            updateChart(data);
          });
        });
      }      

      function generateColors(scores) {
        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);
      
        return scores.map(score => {
          // Map score to a 0-1 range
          const normalized = 1.2 - (score - minScore) / (maxScore - minScore);
          // Generate a color (e.g., blue hue with varying saturation)
          return `hsl(150, 100%, ${normalized * 100}%)`;
        });
      }

      function showDetails(downtownName) {
        console.log(downtownName.trim())
        const details = detailsData.find(row => row['Downtown Name'].trim() === downtownName.trim());
      
        if (details) {
          document.getElementById('details-title').textContent = `Details for ${downtownName}`;
          document.getElementById('details-info').innerHTML = `
            <strong>Population:</strong> ${details.Population}<br>
            <strong>Median Income:</strong> $${details['Median Income']}<br>
            <strong>Points of Interest:</strong> ${details['Points of Interest']}
          `;
          document.getElementById('details-container').style.display = 'block';
        }
      }
      
      function hideDetails() {
        document.getElementById('details-container').style.display = 'none';
      }
      
      
    })
    .catch(error => console.error('Error fetching data:', error));