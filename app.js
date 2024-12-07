document.addEventListener('DOMContentLoaded', () => {
    
    // Fetch CSV data and generate the chart
    fetch('downtown-scores.csv')
    .then(response => response.text())
    .then(csvData => {
      const parsedData = Papa.parse(csvData, { header: true }).data; // Parse CSV with headers
      const labels = parsedData.map(row => row.Downtown.trim());
      const scores = parsedData.map(row => Number(row['Score Personal']));

      // Generate the chart
      const ctx = document.getElementById('downtownChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Downtown Scores',
            data: scores,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            barThickness: 20, // Increase the thickness of the bars
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true, // Ensure it resizes properly
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                font: {
                  size: 18, // Increase the font size for the x-axis labels
                }
              }
            },
            y: {
              ticks: {
                font: {
                  size: 16, // Increase the font size for the y-axis labels
                }
              }
            }
          },
          plugins: {
            legend: {
              labels: {
                font: {
                  size: 20 // Increase the font size for the legend label
                }
              }
            }
          }
        }
      });
    })
    .catch(error => console.error('Error fetching data:', error));

});
