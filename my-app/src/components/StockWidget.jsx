import { useState, useMemo, useEffect } from 'react';
import { useStockHistory } from '../hooks/useStockHistory';
import { useWatchlist } from '../hooks/useWatchlist';
import { StockChart } from './StockChart';
import { calculateSMA, calculateRSI, calculateEMA, calculateMACD, calculateBollingerBands } from '../utils/indicators';

// MUI Components
import {
  Typography,
  Box,
  Paper,
  CircularProgress,  Alert, 
  TextField,
  InputAdornment,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Stack,
  Button, 
  Tooltip,
} from '@mui/material';

// MUI Icons
import SearchIcon from '@mui/icons-material/Search';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';


export const StockWidget = ({ symbol, onSymbolChange }) => {
  // --- STATE ---
  const [inputVal, setInputVal] = useState(symbol);
  
  // Interval: 1day, 1week, 1month
  const [interval, setInterval] = useState('1day');
  
  // Output Size (Range): Number of data points to fetch
  // Mapping: 1M=30, 3M=90, 1Y=260, 5Y=1300, Max=5000
  const [range, setRange] = useState(260); 

  // Chart Type: 'candlestick' or 'line'
  const [chartType, setChartType] = useState('candlestick');

  // Indicator: 'SMA', 'RSI', or null
  const [indicator, setIndicator] = useState(null);

  // --- API HOOK ---
  const { data, loading, error } = useStockHistory(symbol, interval, range);
  
  // --- WATCHLIST HOOK ---
  const { watchlist, addSymbol, removeSymbol } = useWatchlist();
  const isFavorited = watchlist.includes(symbol);

  // --- EFFECTS ---
  // When the symbol prop changes (e.g. from watchlist), update the input field
  useEffect(() => {
    setInputVal(symbol);
  }, [symbol]);


  // --- DERIVED DATA (Calculations) ---
  
  // 1. Current Price & Change
  const currentPriceData = useMemo(() => {
    if (!data || data.length === 0) return null;
    const latest = data[data.length - 1]; // Last item is newest
    const previous = data.length > 1 ? data[data.length - 2] : null;
    
    const prevClose = previous ? previous.close : latest.open;
    const change = latest.close - prevClose;
    const percentChange = (change / prevClose) * 100;

    return {
      price: latest.close,
      change,
      percentChange,
      isPositive: change >= 0
    };
  }, [data]);

  // 2. Indicator Data
  const indicatorData = useMemo(() => {
    if (!data || data.length === 0 || !indicator) return [];

    if (indicator === 'SMA') {
      return calculateSMA(data, 20); // 20-period SMA
    }
    if (indicator === 'EMA') {
      return calculateEMA(data, 20); // 20-period EMA
    }
    if (indicator === 'RSI') {
      return calculateRSI(data, 14); // 14-period RSI
    }
    if (indicator === 'MACD') {
        return calculateMACD(data);
    }
    if (indicator === 'BollingerBands') {
        return calculateBollingerBands(data);
    }
    return [];
  }, [data, indicator]);


  // --- HANDLERS ---

  const handleSearch = () => {
    if (inputVal.trim()) {
      onSymbolChange(inputVal.toUpperCase());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleIntervalChange = (event, newInterval) => {
    if (newInterval !== null) {
      setInterval(newInterval);
    }
  };

  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  const handleIndicatorToggle = (ind) => {
    setIndicator((prev) => (prev === ind ? null : ind));
  };

  const handleFavoriteToggle = () => {
      if (isFavorited) {
          removeSymbol(symbol);
      } else {
          addSymbol(symbol);
      }
  }


  // --- RENDER ---

  return (
    <Box elevation={3} sx={{ p: 0, overflow: 'hidden', borderRadius: 2, bgcolor: 'background.paper' }}>
      
      {/* ZONE A: HEADER (Search & Price) */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        
        {/* Search Box */}
        <Box sx={{ display: 'flex', alignItems: 'center', width: '300px' }}>
          <TextField 
            variant="outlined" 
            size="small"
            fullWidth 
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Symbol (e.g. AAPL)"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2, fontSize: '1.1rem', fontWeight: 500 }
            }}
          />
          <Tooltip title={isFavorited ? "Remove from favorites" : "Add to favorites"}>
            <IconButton onClick={handleFavoriteToggle} sx={{ ml: 1 }}>
                {isFavorited ? <StarIcon color="warning" /> : <StarBorderIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Price Display */}
        {currentPriceData && (
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h4" fontWeight="700" sx={{ lineHeight: 1 }}>
              ${currentPriceData.price.toFixed(2)}
            </Typography>
            <Typography 
              variant="body1" 
              fontWeight="500"
              sx={{ 
                color: currentPriceData.isPositive ? 'success.main' : 'error.main' 
              }}
            >
              {currentPriceData.isPositive ? '+' : ''}{currentPriceData.change.toFixed(2)} ({currentPriceData.percentChange.toFixed(2)}%)
            </Typography>
          </Box>
        )}
      </Box>

      {/* ZONE B: TOOLBAR (Intervals & Indicators) */}
      <Box sx={{ p: 2, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* Interval Selection */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="overline" color="text.secondary" fontWeight="bold">TIME</Typography>
                <ToggleButtonGroup
                value={interval}
                exclusive
                onChange={handleIntervalChange}
                size="small"
                sx={{ bgcolor: 'white' }}
                >
                <ToggleButton value="1day">1D</ToggleButton>
                <ToggleButton value="1week">1W</ToggleButton>
                <ToggleButton value="1month">1M</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Chart Type Selection */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="overline" color="text.secondary" fontWeight="bold">STYLE</Typography>
                <ToggleButtonGroup
                    value={chartType}
                    exclusive
                    onChange={handleChartTypeChange}
                    size="small"
                    sx={{ bgcolor: 'white' }}
                >
                    <ToggleButton value="candlestick" title="Candlestick">
                        <CandlestickChartIcon />
                    </ToggleButton>
                    <ToggleButton value="line" title="Line Chart">
                        <ShowChartIcon />
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>
        </Box>

        {/* Indicators */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <Typography variant="overline" color="text.secondary" fontWeight="bold">INDICATORS</Typography>
             <Chip
                label="SMA (20)"
                clickable
                color={indicator === 'SMA' ? "primary" : "default"}
                variant={indicator === 'SMA' ? "filled" : "outlined"}
                onClick={() => handleIndicatorToggle('SMA')}
             />
             <Chip
                label="EMA (20)"
                clickable
                color={indicator === 'EMA' ? "primary" : "default"}
                variant={indicator === 'EMA' ? "filled" : "outlined"}
                onClick={() => handleIndicatorToggle('EMA')}
             />
             <Chip
                label="RSI (14)"
                clickable
                color={indicator === 'RSI' ? "secondary" : "default"}
                variant={indicator === 'RSI' ? "filled" : "outlined"}
                onClick={() => handleIndicatorToggle('RSI')}
             />
             <Chip
                label="MACD"
                clickable
                color={indicator === 'MACD' ? "secondary" : "default"}
                variant={indicator === 'MACD' ? "filled" : "outlined"}
                onClick={() => handleIndicatorToggle('MACD')}
             />
             <Chip
                label="Bollinger Bands"
                clickable
                color={indicator === 'BollingerBands' ? "secondary" : "default"}
                variant={indicator === 'BollingerBands' ? "filled" : "outlined"}
                onClick={() => handleIndicatorToggle('BollingerBands')}
             />
        </Box>
      </Box>

      {/* ZONE C: CHART AREA */}
      <Box sx={{ position: 'relative', height: '400px', bgcolor: 'background.paper' }}>
        
        {/* Loading Overlay */}
        {loading && (
          <Box sx={{ 
            position: 'absolute', inset: 0, zIndex: 10, 
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
            bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(2px)' 
          }}>
            <CircularProgress />
            <Typography sx={{ mt: 2, fontWeight: 500 }}>Updating Chart...</Typography>
          </Box>
        )}

        {/* Error Overlay */}
        {error && (
           <Box sx={{ 
            position: 'absolute', inset: 0, zIndex: 10, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            bgcolor: 'rgba(255,255,255,0.9)' 
          }}>
            <Alert severity="error" variant="outlined" sx={{ maxWidth: '80%' }}>
              {error}
            </Alert>
          </Box>
        )}
        
        {/* Chart or Empty State */}
        {!loading && !error && (
          <>
            {data && data.length > 0 ? (
              <StockChart 
                data={data} 
                indicatorData={indicatorData}
                indicatorType={indicator}
                indicatorColor={indicator === 'RSI' ? '#0d9488' : '#0f172a'} // Teal and Slate
                chartType={chartType}
              />
            ) : (
              <Box sx={{ 
                  position: 'absolute', inset: 0, zIndex: 5, 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                  opacity: 0.5 
                }}>
                  <ShowChartIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
                  <Typography variant="h6" color="text.secondary">No stock data available</Typography>
                </Box>
            )}
          </>
        )}

      </Box>

      {/* ZONE D: FOOTER (Range / Zoom) */}
      <Box sx={{ p: 1, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
         <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            <Typography variant="overline" color="text.secondary" sx={{ mr: 2 }}>RANGE</Typography>
            
            {[
                { label: '1M', val: 30 },
                { label: '3M', val: 92 },
                { label: '1Y', val: 355 },
                { label: '5Y', val: 355 * 5 },
                { label: 'Max', val: 5000 }
            ].map((opt) => (
                <Button 
                    key={opt.label} 
                    size="small" 
                    variant={range === opt.val ? "contained" : "text"}
                    onClick={() => setRange(opt.val)}
                    disableElevation
                    sx={{ minWidth: '50px' }}
                >
                    {opt.label}
                </Button>
            ))}
         </Stack>
      </Box>

    </Box>
  );
};
