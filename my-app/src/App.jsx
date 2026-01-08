import { useState } from 'react';
import { StockWidget } from './components/StockWidget';
import { Watchlist } from './components/Watchlist';
import { ComparisonWidget } from './components/ComparisonWidget';

// MUI Components
import { 
  Container, 
  Typography, 
  Box,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Paper
} from '@mui/material';

// MUI Icons
import ShowChartIcon from '@mui/icons-material/ShowChart';

function App() {
  const [symbol, setSymbol] = useState('AAPL');
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ flexDirection: 'column', alignItems: 'stretch', p: 2 }}>
          {/* Header Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <ShowChartIcon fontSize="large" color="primary" />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Stock Viewer
            </Typography>
          </Box>

          {/* Watchlist */}
          <Watchlist onSelectSymbol={setSymbol} />
        </Toolbar>
      </AppBar>
      
      <Container maxWidth={false} sx={{ mt: 4, mb: 4 }}>
        {/* Tabs for Stock and Comparison */}
        <Box sx={{ width: '100%' }}>
          <AppBar position="static" color="default" sx={{ borderRadius: 1 }}>
            <Tabs 
              value={tabIndex} 
              onChange={handleTabChange} 
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Single Stock View" sx={{ fontWeight: 'bold' }} />
              <Tab label="Comparison View" sx={{ fontWeight: 'bold' }} />
            </Tabs>
          </AppBar>
          
          <Paper elevation={3} sx={{ mt: 3, p: 3 }}>
            {tabIndex === 0 && (
              <StockWidget
                key={symbol} // Force re-render when symbol changes
                symbol={symbol}
                onSymbolChange={setSymbol}
              />
            )}
            {tabIndex === 1 && (
              <ComparisonWidget />
            )}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

export default App;