import React from 'react';
import { useStockHistory } from '../hooks/useStockHistory';
import { StockChart } from './StockChart';
import { Box, Typography, Paper, CircularProgress, Alert, IconButton, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export function SingleStockComparisonView({ symbol, interval, outputsize, onRemove }) {
    const { data, loading, error } = useStockHistory(symbol, interval, outputsize);
    const theme = useTheme();

    return (
        <Paper 
            elevation={0} 
            sx={{ 
                p: 2, 
                borderRadius: 3, 
                border: `1px solid ${theme.palette.divider}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold">
                        {symbol}
                    </Typography>
                </Box>
                {onRemove && (
                    <IconButton 
                        onClick={() => onRemove(symbol)} 
                        size="small" 
                        aria-label="remove stock"
                        sx={{ 
                            color: 'text.secondary',
                            '&:hover': { color: 'error.main', bgcolor: 'error.lighter' }
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>

            <Box sx={{ position: 'relative', height: '400px' }}>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress size={30} />
                    </Box>
                )}
                {error && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Alert severity="error" variant="outlined" sx={{ width: '100%' }}>{error}</Alert>
                    </Box>
                )}
                {!loading && !error && data.length > 0 && (
                    <StockChart data={data} />
                )}
                 {!loading && !error && data.length === 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Typography color="text.secondary">No data available for {symbol}</Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    );
}
