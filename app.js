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
      })

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
        const maxPossibleScore = Object.keys(weights).reduce((sum, component) => {
          return sum + (weights[component] / 100) * 100;
        }, 0);
      
        // Recalculate final scores based on current weights
        const scores = data.map(row => {
          const rawScore = Object.keys(row.scores).reduce((sum, component) => {
            return sum + row.scores[component] * (weights[component] / 100);
          }, 0);
      
          const normalizedScore = (rawScore / maxPossibleScore) * 100;
          return { location: row.location, score: normalizedScore, scores: row.scores };
        });
      
        return scores.sort((a, b) => b.score - a.score); // Sort scores from highest to lowest
      }
      
      
      
      let chart;

      function initializeChart(data) {
        const ctx = document.getElementById('downtownChart').getContext('2d');
        
        const finalScores = calculateFinalScores(data);
        const labels = finalScores.map(item => item.location);
        const scores = finalScores.map(item => item.score);
        sortedRawData = sortedRawData = data.sort((a, b) => b.score - a.score); // Initially calculate and sort

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
            maintainAspectRatio: false,
            tooltips: {
              enabled: false
            },
            scales: {
              x: { beginAtZero: true },
              y: {}
            
            },
            onHover: (event, chartElement) => {
              if (chartElement.length > 0) {
                const index = chartElement[0].index; // Get the hovered bar's index
                const downtownData = sortedRawData[index]; // Use the sorted finalScores array
                showDetails(downtownData);
              } else {
                hideDetails(); // Hide details when not hovering
              }
            },
          }
        });
      }

      function updateChart(data) {
        finalScores = calculateFinalScores(data); // Recalculate and re-sort based on weights
        sortedRawData = finalScores.sort((a, b) => b.score - a.score);
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

      function showDetails(downtownData) {
        const detailsContainer = document.getElementById('details-container');
        detailsContainer.innerHTML = `
          <h3>Details for ${downtownData.location}</h3>
          <p><strong>Cafe Score:</strong> ${downtownData.scores.CafeScore}</p>
          <p><strong>Book Score:</strong> ${downtownData.scores.BookScore}</p>
          <p><strong>Park Score:</strong> ${downtownData.scores.ParkScore}</p>
          <p><strong>Bike Score:</strong> ${downtownData.scores.BikeScore}</p>
          <p><strong>Transit Score:</strong> ${downtownData.scores.TransitScore}</p>
          <p><strong>Tree Score:</strong> ${downtownData.scores.TreeScore}</p>
          <p><strong>Library:</strong> ${downtownData.scores.Library}</p>
          <p><strong>Movie Theater:</strong> ${downtownData.scores.MovieTheater}</p>
        `;
        detailsContainer.style.display = 'block';
      }
      
      function hideDetails() {
        const detailsContainer = document.getElementById('details-container');
        detailsContainer.style.display = 'none';
      }
      
      
    })
    .catch(error => console.error('Error fetching data:', error));