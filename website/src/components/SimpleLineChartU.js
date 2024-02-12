import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { LineChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const SimpleLineChartU = ({ data }) => {
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
      <XAxis dataKey="date" tickFormatter={(date) => formatDate(new Date(date))} />
      <YAxis type="number" domain={[0, 'dataMax']} />

      <Tooltip
        labelFormatter={(value) => formatDate2(value)}
        formatter={(value) => [`${value} users`]}
      />
      <Area type="monotone" dataKey="total_unique_user" stroke="#8884d8" fill="#8884d8" yAxisId="nonZeroStart" />
      <Line type="monotone" dataKey="total_unique_user" stroke="#8884d8" />
    </LineChart>
  );
};

export default SimpleLineChartU;
