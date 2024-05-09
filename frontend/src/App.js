import './App.css';
import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ChartDisplay from './components/Charts';

function App() {
  const [showCharts, setShowCharts] = useState(false);
  const [chartPaths, setChartPaths] = useState({
    barChartPath: '',
    pieChartPath: ''
  });

  const handleShowCharts = (paths) => {
    setChartPaths(paths);
    setShowCharts(true);
  };

  return (
    <div className="App">
      <h1>Financial Data Analysis</h1>
      <FileUpload onShowCharts={handleShowCharts} />
      {showCharts && <ChartDisplay barChartPath={chartPaths.barChartPath} pieChartPath={chartPaths.pieChartPath} />}
    </div>
  );
}

export default App;
