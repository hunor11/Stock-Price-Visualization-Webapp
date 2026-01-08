import { useState } from 'react';
import { StockWidget } from './components/StockWidget';
import { Watchlist } from './components/Watchlist';

// MUI Components
import { 
  Container, 
  Typography, 
  Box,
  Grid
} from '@mui/material';

// MUI Icons
import ShowChartIcon from '@mui/icons-material/ShowChart';

function App() {
  const [symbol, setSymbol] = useState('AAPL');

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      
      {/* Header Section */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <ShowChartIcon fontSize="large" color="primary" />
        <Typography variant="h4" component="h1" fontWeight="bold">
          Stock Viewer
        </Typography>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Main Stock Widget */}
        <Grid item xs={12} md={8} lg={9}>
          <StockWidget 
            key={symbol} // Force re-render when symbol changes
            symbol={symbol} 
            onSymbolChange={setSymbol} 
          />
        </Grid>

        {/* Watchlist */}
        <Grid item xs={12} md={4} lg={3}>
          <Watchlist onSelectSymbol={setSymbol} />
        </Grid>

      </Grid>
      
    </Container>
  );
}

export default App;