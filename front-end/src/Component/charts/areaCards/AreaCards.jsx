import React, { useEffect, useState } from 'react';
import AreaCard from "./AreaCard";
import "./AreaCards.scss";
import axiosProvider from '../../../utils/axiosConfig';

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

