import React, { useState } from 'react';
import { 
    Box, 
    TextField, 
    Button, 
    Paper, 
    Typography,
    Chip,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { SingleStockComparisonView } from './SingleStockComparisonView';
import DeleteIcon from '@mui/icons-material/Delete';

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
            <Typography variant="h6" gutterBottom>
                Compare Stocks
            </Typography>

            {/* Controls */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                {/* Symbol Adder */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                        label="Add Stock Symbol"
                        variant="outlined"
                        value={newSymbol}
                        onChange={(e) => setNewSymbol(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSymbol()}
                        size="small"
                    />
                    <Button variant="contained" onClick={addSymbol} size="small">
                        Add
                    </Button>
                </Box>
                {/* Interval and Range Selectors */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Interval</InputLabel>
                        <Select
                            value={interval}
                            label="Interval"
                            onChange={(e) => setInterval(e.target.value)}
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
                        >
                            <MenuItem value={30}>1 Month</MenuItem>
                            <MenuItem value={90}>3 Months</MenuItem>
                            <MenuItem value={252}>1 Year</MenuItem>
                            <MenuItem value={1260}>5 Years</MenuItem>
                            <MenuItem value={5000}>Max</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            {/* Symbol Chips */}
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                {symbols.map(symbol => (
                    <Chip
                        key={symbol}
                        label={symbol}
                        onDelete={() => removeSymbol(symbol)}
                        deleteIcon={<DeleteIcon />}
                        sx={{ mb: 1 }}
                    />
                ))}
            </Stack>
            
            {/* Stock Views */}
            <Stack direction="column" spacing={3}>
                {symbols.map(symbol => (
                    <SingleStockComparisonView 
                        key={`${symbol}-${interval}-${outputsize}`} 
                        symbol={symbol} 
                        interval={interval} 
                        outputsize={outputsize} 
                    />
                ))}
            </Stack>
        </Box>
    );
}
