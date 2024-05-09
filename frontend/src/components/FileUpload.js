import React, { useState } from 'react';
import axios from 'axios';
import ChartDisplay  from './Charts'

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(['Transportation', 'Entertainment', 'Dining Out', 'Utilities', 'Health']);
  const [years, setYears] = useState([2019, 2020, 2021, 2022, 2023]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [chartPaths, setChartPaths] = useState({
    barChartPath: '',
    pieChartPath: ''
  });
  const [chartData, setChartData] = useState({
    barChartData: null,
    pieChartData: null
  });

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(response.data);
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error.response.data.error || 'Upload failed. Please try again later.');
    }
    setLoading(false);
  };

  const handleCategoryChange = (event) => {
    const selectedCategory = event.target.value;
    if (selectedCategories.includes(selectedCategory)) {
      setSelectedCategories(selectedCategories.filter(cat => cat !== selectedCategory));
    } else {
      setSelectedCategories([...selectedCategories, selectedCategory]);
    }
  };

  const handleYearChange = (event) => {
    const selectedYearsArray = Array.from(event.target.selectedOptions, option => parseInt(option.value));
    setSelectedYears(selectedYearsArray);
  };

  const handleGenerateChart = async () => {
    try {
      const requestData = {
        categories: selectedCategories,
        years: selectedYears
      };

      const response = await axios.post('http://localhost:5000/chart', requestData);
      const { bar_chart_data, pie_chart_data } = response.data;

      setChartData({
        barChartData: bar_chart_data,
        pieChartData: pie_chart_data
      });
    } catch (error) {
      console.error('Failed to generate chart:', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}

      <div>
        <h2>Select Category</h2>
        <select multiple value={selectedCategories} onChange={handleCategoryChange}>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div>
        <h2>Select Year</h2>
        <select multiple value={selectedYears} onChange={handleYearChange}>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <button onClick={handleGenerateChart}>Generate Chart</button>
      <ChartDisplay
        barChartData={chartData.barChartData}
        pieChartData={chartData.pieChartData}
      />
    </div>
  );
};

export default FileUpload;