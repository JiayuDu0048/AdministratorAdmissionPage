import React, { useEffect, useState } from 'react';
import axiosProvider from '../../../utils/axiosConfig';

const AreaProgressChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchStatusCompletion = async () => {
      try {
        const response = await axiosProvider.get('/api/status-completion');
        setData(response.data.data); // Assuming the endpoint returns an object with a 'data' array
      } catch (error) {
        console.error('Error fetching status completion data:', error);
      }
    };

    fetchStatusCompletion();
  }, []);

  return (
    <div className="progress-bar">
      <div className="progress-bar-info">
        <h4 className="progress-bar-title">Student Checklist Status</h4>
      </div>
      <div className="progress-bar-list">
        {data?.map((progressbar) => (
          <div className="progress-bar-item" key={progressbar.id}>
            <div className="bar-item-info">
              <p className="bar-item-info-name">{progressbar.name}</p>
              <p className="bar-item-info-value">{progressbar.percentValues.toFixed(2)}%</p>
            </div>
            <div className="bar-item-full">
              <div className="bar-item-filled" style={{ width: `${progressbar.percentValues}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AreaProgressChart;
