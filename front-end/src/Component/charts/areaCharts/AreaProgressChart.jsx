import React, { useEffect, useState } from 'react';
import axiosProvider from '../../../utils/axiosConfig';
import io from 'socket.io-client';

const serverURL = import.meta.env.VITE_SERVER_URL;
// Establish a connection to the WebSocket server
const socket = io(serverURL, {
  path: '/socket.io' 
});  

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

    // Set up WebSocket listener for updates: 
    // socket.on(eventName, ...): eventName must match with where socket is received in backend: req.io.emit('status update', statusCompletion)
    socket.on('status update', (updatedStatus) => {
      console.log('Received updated status data:', updatedStatus);
      setData(updatedStatus);  
    });
    
    // Clean up the effect by removing the event listener
    return () => socket.off('status update');

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
