import React, { useEffect, useState, useContext } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ThemeContext } from '../context/ThemeContext';
import { FaArrowUpLong } from 'react-icons/fa6';
import { LIGHT_THEME } from '../constant/themeConstants';
import './AreaCharts.scss';
import axiosProvider from '../../../utils/axiosConfig';
import io from 'socket.io-client';
const serverURL = import.meta.env.VITE_SERVER_URL;
// Establish a connection to the WebSocket server
const socket = io(serverURL, {
  path: '/socket.io' 
});  


const AreaBarChart = () => {
  const { theme } = useContext(ThemeContext);
  const [data, setData] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [percentageChange, setPercentageChange] = useState(0);
  const [lastMonthStudents, setLastMonthStudents] = useState(0);


  const fetchTotalStudents = async () => {
    try {
      const response = await axiosProvider.get('/api/students/active-students');
      setTotalStudents(response.data.length); // Set the number of active students
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      setLastMonthStudents(response.data.find(m => m._id.month === lastMonth.getMonth() + 1)?.count || 0);
      // console.log("lastMonth", lastMonthStudents)
    } catch (error) {
      console.error('Failed to fetch total number of active students:', error);
    }
  };

  // Set Percentage Increase than the last month
  useEffect(() => {
    if (lastMonthStudents > 0) {
      const change = ((totalStudents - lastMonthStudents) / lastMonthStudents) * 100;
      setPercentageChange(change.toFixed(2)); // rounding to two decimal places
    } else {
      setPercentageChange('N/A'); // Handle case when last month's data is zero
    }
  }, [totalStudents, lastMonthStudents]);

  
  // Set monthly stats in the bar chart
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosProvider.get('/api/monthly-stats', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        // console.log("data received:", response.data)
        if (response.data) {
          setData(formatData(response.data));
        } else {
          throw new Error('No data received');
        }
      } catch (error) {
        console.error('Failed to fetch monthly stats:', error.response || error);
      }
    };

    fetchData();
    fetchTotalStudents();
  }, []);


  // Listen for bar chart updates
  useEffect(() => {
      
      socket.on('update bar chart', (monthlyStats) => {
          setData(formatData(monthlyStats));
      });

      return () => {
          socket.off('update bar chart');
      };
      
  }, []);


  const formatData = (rawData) => {
    const { newAdditions, deletions } = rawData;

    // Initialize data for all months
    const monthsData = Array.from({ length: 12 }, (_, index) => ({
        month: getMonthName(index + 1),
        Increase: 0,
        loss: 0
    }));

    // Populate the data with received values
    newAdditions.forEach(addition => {
        const monthIndex = addition._id.month - 1; // month is 1-indexed, array is 0-indexed
        monthsData[monthIndex].Increase = addition.count;
    });

    deletions.forEach(deletion => {
        const monthIndex = deletion._id.month - 1; // month is 1-indexed, array is 0-indexed
        monthsData[monthIndex].loss = deletion.count || 0; // Use the count or 0 if undefined
    });

    // console.log("monthsdata:", monthsData)
    return monthsData;
};


  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1); // months are zero-indexed in JS
    return date.toLocaleString('default', { month: 'short' });
  };

  const formatTooltipValue = (value) => `${value}`;
  const formatYAxisLabel = (value) => `${value}`;
  const formatLegendValue = (value) => value.charAt(0).toUpperCase() + value.slice(1);
 
  // console.log("Data at render:", data);

  return (
    <div className="bar-chart">
      <div className="bar-chart-info">
        <h5 className="bar-chart-title">Current Student Number</h5>
        <div className="chart-info-data">
          <div className="info-data-value">{totalStudents}</div>
          <div className="info-data-text">
            <FaArrowUpLong />
            <p>{percentageChange !== 'N/A' ? `${percentageChange}% than last month.` : 'No previous data'}</p>
          </div>
        </div>
      </div>
      <div className="bar-chart-wrapper">
      <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <XAxis
              dataKey="month"
              tickSize={0}
              axisLine={false}
              tick={{
                fill: `${theme === LIGHT_THEME ? "#676767" : "#FFFFFF"}`,
                fontSize: 14,
              }}
            />
            <YAxis
              tickFormatter={formatYAxisLabel}
              tickCount={6}
              axisLine={false}
              tickSize={0}
              allowDataOverflow={true}
              tick={{
                fill: `${theme === LIGHT_THEME ? "#676767" : "#FFFFFF"}`,
              }}
            />
            <Bar
              dataKey="Increase"
              fill="#475be8"
              activeBar={false}
              isAnimationActive={false}
              barSize={24}
              radius={[4, 4, 4, 4]}
            />
            <Bar
              dataKey="loss"
              fill="#e3e7fc"
              activeBar={false}
              isAnimationActive={false}
              barSize={24}
              radius={[4, 4, 4, 4]}
            />
            <Tooltip
            formatter={formatTooltipValue}
            cursor={{ fill: "transparent" }}
            contentStyle={{ color: '#FFFFFF' }}
            />
            <Legend
              iconType="circle"
              iconSize={10}
              verticalAlign="top"
              align="right"
              formatter={formatLegendValue}
            />
          </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AreaBarChart;
