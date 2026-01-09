import { useWatchlist } from '../hooks/useWatchlist';

// MUI Components
import {
  Box,
  Typography,
  Paper,
  Chip, // Imported Chip
  Stack
} from '@mui/material';

// MUI Icons
import StarBorderIcon from '@mui/icons-material/StarBorder';

export const Watchlist = ({ onSelectSymbol }) => {
  const { watchlist, removeSymbol } = useWatchlist();

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
      {/* <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        Favorites
      </Typography>
       */}
      {watchlist.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 2, color: 'text.secondary' }}>
            <StarBorderIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body2">Watchlist empty</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {watchlist.map((symbol) => (
            <Chip
              key={symbol}
              label={symbol}
              onClick={() => onSelectSymbol(symbol)}
              onDelete={() => removeSymbol(symbol)}
              color="primary"
              variant="outlined" // or "filled"
              size="small"       // Makes it even more compact
              sx={{ fontWeight: 500 }}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
};