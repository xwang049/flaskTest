



import React, { useRef, useEffect,useState  } from 'react';
import Chart from 'chart.js/auto';
import './ChartDisplay.css';

const ChartDisplay = ({ barChartData, pieChartData }) => {
  const [barChartInstance, setBarChartInstance] = useState(null);
  const [pieChartInstance, setPieChartInstance] = useState(null);
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);

  useEffect(() => {
    renderCharts(barChartData, pieChartData);
  }, [barChartData, pieChartData]);
  const renderCharts = (barChartData, pieChartData) => {
    // 銷毀舊的圖表實例
    if (barChartInstance) {
      barChartInstance.destroy();
    }
    if (pieChartInstance) {
      pieChartInstance.destroy();
    }

    // 渲染新的圖表
    renderBarChart(barChartData);
    renderPieChart(pieChartData);
  };
  const renderBarChart = (barChartData) => {
    if (!barChartData) return;

    const years = Array.from(new Set(barChartData.map(data => data['Year']))).sort((a, b) => a - b);
    const ctx = barChartRef.current.getContext('2d');

    const newInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: years,
        datasets: Array.from(new Set(barChartData.map(data => data['Category']))).map(category => ({
          label: category,
          data: barChartData
            .filter(data => data['Category'] === category)
            .map(data => data['Amount']),
          backgroundColor: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.5)`
        }))
      },
      options: {
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true
          }
        }
      }
    });
    setBarChartInstance(newInstance);
  };

  const renderPieChart = (pieChartData) => {
    if (!pieChartData) return;

    const ctx = pieChartRef.current.getContext('2d');
    const totalAmount = pieChartData.reduce((sum, data) => sum + data['Amount'], 0);

    const newInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: pieChartData.map(data => data['Category']),
        datasets: [{
          data: pieChartData.map(data => data['Amount']),
          backgroundColor: pieChartData.map(() =>
            `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.5)`
          )
        }]
      },
      options: {
        maintainAspectRatio: true, // 不维持宽高比
        responsive: true, // 开启响应式
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const dataIndex = context.dataIndex;
                const data = context.dataset.data[dataIndex];
                const label = context.label;
                const percentage = ((data / totalAmount) * 100).toFixed(2);
                return `${label}: ${data} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
    setPieChartInstance(newInstance);
  };

  return (
    <div className="chart-container">
      <div className="chart-wrapper">
        <h2>Bar Chart</h2>
        <canvas ref={barChartRef} width={400} height={300}></canvas>
      </div>
      <div className="chart-wrapper">
        <h2>Pie Chart</h2>
        <canvas ref={pieChartRef} width={400} height={300}></canvas>
      </div>
    </div>
  );
};

export default ChartDisplay;