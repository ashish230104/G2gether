// Data for CO₂ saved by each user
const co2Data = {
  labels: ['Jane Smith', 'John Doe', 'Michael Brown', 'Linda Johnson', 'Robert Wilson', 'Emily Davis', 'David Miller', 'Sarah Wilson', 'Chris Anderson', 'Amy Thomas'],
  datasets: [{
    label: 'Total CO₂ Saved (kg)',
    data: [150, 120, 90, 80, 70, 60, 50, 40, 30, 20],
    backgroundColor: [
      'rgba(75, 192, 192, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(231, 233, 237, 0.6)',
      'rgba(255, 99, 132, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(201, 203, 207, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(75, 192, 192, 0.6)'
    ],
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1
  }]
};

// Configuration options
const config = {
  type: 'bar',
  data: co2Data,
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
};

// Initialize the chart
window.addEventListener('load', () => {
  const ctx = document.getElementById('co2Chart').getContext('2d');
  new Chart(ctx, config);
});