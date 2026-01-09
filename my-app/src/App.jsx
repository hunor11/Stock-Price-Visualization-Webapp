import { useState } from 'react';
import { StockWidget } from './components/StockWidget';
import { Watchlist } from './components/Watchlist';
import { ComparisonWidget } from './components/ComparisonWidget';
import { useWatchlistContext } from './context/WatchlistContext'; 

import { 
  CssBaseline,
  Container, 
  Typography, 
  Box, 
  AppBar, 
  Toolbar, 
  Paper, 
  IconButton, 
  Drawer, 
  Button, 
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme
} from '@mui/material';

// Icons
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ListIcon from '@mui/icons-material/List';
import CloseIcon from '@mui/icons-material/Close';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';

function App() {
  const [symbol, setSymbol] = useState('AAPL');
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'compare'
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const { watchlist } = useWatchlistContext(); 
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleViewChange = (event, newView) => {
    // Prevent unselecting the current view (enforce one selection)
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: '#f5f5f5', overflowX: 'hidden' }}>
      <CssBaseline />
      {/* 1. TOP NAVIGATION BAR */}
      <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0', bgcolor: 'white' }}>
        <Toolbar>
          
          {/* LEFT: Brand Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
            <Box sx={{ p: 0.8, bgcolor: 'primary.main', borderRadius: 1.5, display: 'flex' }}>
                <ShowChartIcon sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            {!isMobile && (
              <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ fontSize: '1.1rem' }}>
                StockViewer
              </Typography>
            )}
          </Box>

          {/* CENTER: Compact View Switcher */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewChange}
              size="small"
              aria-label="view mode"
              sx={{ 
                bgcolor: '#f5f5f5', 
                '& .MuiToggleButton-root': { 
                   px: 3, 
                   py: 0.5,
                   border: 'none',
                   borderRadius: 1,
                   textTransform: 'none',
                   fontWeight: 600,
                   color: 'text.secondary',
                   '&.Mui-selected': {
                     bgcolor: 'white',
                     color: 'primary.main',
                     boxShadow: '0px 1px 3px rgba(0,0,0,0.1)'
                   }
                }
              }}
            >
              <ToggleButton value="single" aria-label="single stock view">
                <ShowChartIcon fontSize="small" sx={{ mr: 1 }} />
                Single
              </ToggleButton>
              <ToggleButton value="compare" aria-label="comparison view">
                <CompareArrowsIcon fontSize="small" sx={{ mr: 1 }} />
                Compare
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* RIGHT: Watchlist Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', flex: 1 }}>
            <Button 
              variant="text" 
              color="inherit"
              onClick={() => setIsDrawerOpen(true)}
              sx={{ minWidth: 40 }}
            >
              <Badge badgeContent={watchlist.length} color="error" variant="dot">
                <ListIcon color="action" />
              </Badge>
              {!isMobile && <Typography variant="body2" fontWeight={600} sx={{ ml: 1 }}>Watchlist</Typography>}
            </Button>
          </Box>

        </Toolbar>
      </AppBar>
      
      {/* 2. SIDE DRAWER */}
      <Drawer anchor="right" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <Box sx={{ width: 320, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">Watchlist</Typography>
                <IconButton onClick={() => setIsDrawerOpen(false)} size="small">
                  <CloseIcon />
                </IconButton>
            </Box>
            <Watchlist onSelectSymbol={(s) => { setSymbol(s); setIsDrawerOpen(false); }} />
        </Box>
      </Drawer>

      {/* 3. MAIN CONTENT AREA */}
      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            border: '1px solid #e0e0e0', 
            borderRadius: 3, 
            bgcolor: 'white',
            minHeight: '600px' // Keeps layout stable
          }}
        >
          {viewMode === 'single' ? (
            <StockWidget
              key={symbol} 
              symbol={symbol}
              onSymbolChange={setSymbol}
            />
          ) : (
            <ComparisonWidget />
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default App;