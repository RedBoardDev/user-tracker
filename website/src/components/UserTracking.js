import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import ErrorBanner from './ErrorBanner';
import SimpleLineChart from './SimpleLineChart';
import config from '../config';

const UserTrackingPage = () => {
    const [apiError, setApiError] = useState(false);
    const [userCount, setUserCount] = useState(null);
    const [averageUsers, setAverageUsers] = useState(null);
    const [totalUsers, setTotalUsers] = useState(0);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const apiUrl = `${config.apiUrl}/usercount/all`;
                const response = await Promise.race([
                    fetch(apiUrl),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
                ]);

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setTotalUsers(data.total)

                const dataList = data.data;
                setUserCount(dataList);

                const last30Days = dataList.slice(-30);
                const totalUsers = last30Days.reduce((sum, day) => sum + day.userCount, 0);
                const average = totalUsers / last30Days.length;
                setAverageUsers(average);
            } catch (error) {
                setApiError(true);
            }
        };
        fetchAllData();
    }, []);

    const rootStyle = {
        backgroundColor: '#f0f0f0',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    };

    const paperStyle = {
        width: '100%',
        paddingTop: '15px',
        borderRadius: '8px',
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#ffffff',
    };

    return (
        <Box style={rootStyle} sx={{ width: '100%', maxWidth: '100%' }}>
            <Paper style={paperStyle} sx={{ width: '100%' }}>
                <Typography variant="h4" gutterBottom>
                    User Tracking
                </Typography>
                {apiError && <ErrorBanner message="Error fetching user count" />}
                {userCount && (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Total users: {totalUsers} users
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                            Average users (Last 30 Days): {averageUsers} users
                        </Typography>
                        <SimpleLineChart data={userCount} />
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default UserTrackingPage;
