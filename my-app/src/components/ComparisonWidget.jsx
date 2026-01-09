import React, { useState } from 'react';
import { 
    Box, 
    TextField, 
    Button, 
    Paper, 
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import { SingleStockComparisonView } from './SingleStockComparisonView';

export function ComparisonWidget() {
    const [symbols, setSymbols] = useState(['AAPL', 'GOOGL']);
    const [newSymbol, setNewSymbol] = useState('');
    const [interval, setInterval] = useState('1day');
    const [outputsize, setOutputsize] = useState(252); // Default to 1 Year

    const addSymbol = () => {
        if (newSymbol && !symbols.includes(newSymbol.toUpperCase())) {
            setSymbols([...symbols, newSymbol.toUpperCase()]);
            setNewSymbol('');
        }
    };

    const removeSymbol = (symbolToRemove) => {
        setSymbols(symbols.filter(symbol => symbol !== symbolToRemove));
    };

    return (
        <Box sx={{ p: 0 }}>
            {/* Control Bar */}
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 2, 
                    mb: 3, 
                    bgcolor: 'grey.50', 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                {/* Left: Add Symbol */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexGrow: 1,  maxWidth: { xs: '100%', md: '400px' } }}>
                    <TextField
                        placeholder="Add stock symbol (e.g. MSFT)"
                        variant="outlined"
                        value={newSymbol}
                        onChange={(e) => setNewSymbol(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSymbol()}
                        size="small"
                        fullWidth
                        sx={{ bgcolor: 'white' }}
                    />
                    <Button 
                        variant="contained" 
                        onClick={addSymbol} 
                        disableElevation
                        sx={{ px: 3, whiteSpace: 'nowrap' }}
                    >
                        Add Stock
                    </Button>
                </Box>

                {/* Right: View Controls */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Interval</InputLabel>
                        <Select
                            value={interval}
                            label="Interval"
                            onChange={(e) => setInterval(e.target.value)}
                            sx={{ bgcolor: 'white' }}
                        >
                            <MenuItem value="1day">Daily</MenuItem>
                            <MenuItem value="1week">Weekly</MenuItem>
                            <MenuItem value="1month">Monthly</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Range</InputLabel>
                        <Select
                            value={outputsize}
                            label="Range"
                            onChange={(e) => setOutputsize(e.target.value)}
                            sx={{ bgcolor: 'white' }}
                        >
                            <MenuItem value={30}>1 Month</MenuItem>
                            <MenuItem value={90}>3 Months</MenuItem>
                            <MenuItem value={252}>1 Year</MenuItem>
                            <MenuItem value={1260}>5 Years</MenuItem>
                            <MenuItem value={5000}>Max</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {/* Empty State Hint */}
            {symbols.length === 0 && (
               <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                   <Typography variant="h6">No stocks to compare</Typography>
                   <Typography variant="body2">Add symbols above to see their performance side-by-side.</Typography>
               </Box>
            )}

            {/* Stock Comparison Cards */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {symbols.map(symbol => (
                    <Box 
                        key={`${symbol}-${interval}-${outputsize}`}
                        sx={{ 
                            width: { xs: '100%', md: 'calc(50% - 12px)' } // Full width on mobile, half on tablet+
                        }}
                    >
                        <SingleStockComparisonView 
                            symbol={symbol} 
                            interval={interval} 
                            outputsize={outputsize}
                            onRemove={removeSymbol}
                        />
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
