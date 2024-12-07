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

      function applyFilters() {
        const activeFilters = [];
        
        document.querySelectorAll('.filter-btn.selected').forEach(button => {
          activeFilters.push(button.textContent.trim());
        });
      
        // Use `activeFilters` to update your chart data
        console.log("Active filters:", activeFilters);
      }


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
        CafeScore: 20,
        BookScore: 20,
        ParkScore: 20,
        BikeScore: 20,
        TransitScore: 20,
        TreeScore: 20,
        Library: 20,
        MovieTheater: 20,
      };

      function calculateFinalScores(data) {
        return data.map(row => {
          const finalScore = Object.keys(row.scores).reduce((sum, component) => {
            return sum + row.scores[component] * (weights[component] / 100);
          }, 0);
          return { location: row.location, score: finalScore };
        });
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
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
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
            }
          }
        });
      }

      function updateChart(data) {
        const finalScores = calculateFinalScores(data);
        chart.data.labels = finalScores.map(item => item.location);
        chart.data.datasets[0].data = finalScores.map(item => item.score);
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

      
    })
    .catch(error => console.error('Error fetching data:', error));