import React from 'react';
import { useStockHistory } from '../hooks/useStockHistory';
import { StockChart } from './StockChart';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';

export function SingleStockComparisonView({ symbol, interval, outputsize }) {
    const { data, loading, error } = useStockHistory(symbol, interval, outputsize);

    return (
        <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>{symbol}</Typography>
            <Box sx={{ position: 'relative', height: '300px' }}>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                    </Box>
                )}
                {error && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Alert severity="error">{error}</Alert>
                    </Box>
                )}
                {!loading && !error && data.length > 0 && (
                    <StockChart data={data} />
                )}
                 {!loading && !error && data.length === 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Typography>No data available for {symbol}</Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    );
}
