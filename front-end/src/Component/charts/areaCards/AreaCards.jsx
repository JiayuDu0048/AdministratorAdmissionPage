import React, { useEffect, useState } from 'react';
import AreaCard from "./AreaCard";
import "./AreaCards.scss";
import axiosProvider from '../../../utils/axiosConfig';
import io from 'socket.io-client';

const serverURL = import.meta.env.VITE_SERVER_URL;
// Establish a connection to the WebSocket server
const socket = io(serverURL, {
  path: '/socket.io' 
});  

const AreaCards = () => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data } = await axiosProvider.get('/api/session-stats');
        setSessions(data);
      } catch (error) {
        console.error('Error fetching session data:', error);
      }
    };

    fetchSessions();

    // Set up WebSocket listener for updates
    socket.on('update sessions', (updatedSessions) => {
      console.log('Received updated session data:', updatedSessions);
      setSessions(updatedSessions);  // Update sessions state with new data
    });

    socket.on('connect_error', (err) => {
      console.log('Connection Error:', err);
    });
    

    // Clean up the effect by removing the event listener
    return () => socket.off('update sessions');

  }, []);

  return (
    <section className="content-area-cards">
      {sessions.map(session => (
        <AreaCard
          key={session._id}
          colors={["#e4e8ef", "#7F00FF"]}
          percentFillValue={(session.count / 30) * 100} // Assuming each session has a capacity of 30
          cardInfo={{
            title: `Session ${session._id}`,
            value: `${session.count}/30`,
            text: `${session.count} Students in Session ${session._id}.`
          }}
        />
      ))}
    </section>
  );
};

export default AreaCards;

