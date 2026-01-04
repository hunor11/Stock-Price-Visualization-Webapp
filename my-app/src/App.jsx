import { StockWidget } from './components/StockWidget';

// MUI Components
import { 
  Container, 
  Typography, 
  Box
} from '@mui/material';

// MUI Icons
import ShowChartIcon from '@mui/icons-material/ShowChart';

function App() {
  return (
    // Container limits width and centers content automatically
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      
      {/* Header Section */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <ShowChartIcon fontSize="large" color="primary" />
        <Typography variant="h4" component="h1" fontWeight="bold">
          Stock Viewer
        </Typography>
      </Box>

      {/* Reusable Stock Widget */}
      <StockWidget defaultSymbol="AAPL" />
      
    </Container>
  );
}

export default App;