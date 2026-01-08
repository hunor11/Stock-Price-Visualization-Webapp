import React, { useState } from 'react';
import { 
    Box, 
    TextField, 
    Button, 
    Paper, 
    Typography,
    Chip,
    Stack
} from '@mui/material';
import { SingleStockComparisonView } from './SingleStockComparisonView';
import DeleteIcon from '@mui/icons-material/Delete';

export function ComparisonWidget() {
    const [symbols, setSymbols] = useState(['AAPL', 'GOOGL']);
    const [newSymbol, setNewSymbol] = useState('');

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
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Compare Stocks
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                    label="Add Stock Symbol"
                    variant="outlined"
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSymbol()}
                    size="small"
                />
                <Button variant="contained" onClick={addSymbol}>
                    Add
                </Button>
            </Box>
            <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
                {symbols.map(symbol => (
                    <Chip
                        key={symbol}
                        label={symbol}
                        onDelete={() => removeSymbol(symbol)}
                        deleteIcon={<DeleteIcon />}
                    />
                ))}
            </Stack>
            
            <Stack direction="column" spacing={3}>
                {symbols.map(symbol => (
                    <SingleStockComparisonView key={symbol} symbol={symbol} />
                ))}
            </Stack>
        </Paper>
    );
}
