import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { LineChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const SimpleLineChart = ({ data }) => {
  useEffect(() => {
    const handleResize = () => {
      setChartWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const [chartWidth, setChartWidth] = React.useState(window.innerWidth);
  const formatDate = (date) => format(new Date(date), 'EEE, MMM dd');
  const formatDate2 = (date) => format(new Date(date), 'dd MMMM yyyy');

  return (
    <LineChart width={chartWidth} height={300} data={data} margin={{ left: 16, right: 16 }}>
      <CartesianGrid stroke="#ccc" />
      <XAxis dataKey="date" tickFormatter={formatDate} />
      <YAxis type="number" domain={[0, 'dataMax']} />

      <Tooltip
        labelFormatter={(value) => formatDate2(value)}
        formatter={(value, name, props) => [`${value.toLocaleString()} users`]}
      />
      <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" yAxisId="nonZeroStart" />
      <Line type="monotone" dataKey="userCount" stroke="#8884d8" />
    </LineChart>
  );
};

export default SimpleLineChart;
