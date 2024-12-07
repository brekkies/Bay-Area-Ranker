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
            label: 'Score Personal',
            data: scores,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y', // Horizontal bar chart
          scales: {
            x: {
              beginAtZero: true
            }
          }
        }
      });
    })
    .catch(error => console.error('Error fetching data:', error));

});
