import { useWatchlist } from '../hooks/useWatchlist';

// MUI Components
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';

// MUI Icons
import DeleteIcon from '@mui/icons-material/Delete';
import StarBorderIcon from '@mui/icons-material/StarBorder';


export const Watchlist = ({ onSelectSymbol }) => {
  const { watchlist, removeSymbol } = useWatchlist();

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        Favorites
      </Typography>
      {watchlist.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%', color: 'text.secondary' }}>
            <StarBorderIcon sx={{ fontSize: 50, mb: 1 }} />
            <Typography>Your watchlist is empty.</Typography>
            <Typography variant="caption">Add symbols from the main widget.</Typography>
        </Box>
      ) : (
        <List>
          {watchlist.map((symbol) => (
            <ListItem
              key={symbol}
              disablePadding
              secondaryAction={
                <Tooltip title="Remove from watchlist">
                    <IconButton edge="end" aria-label="delete" onClick={() => removeSymbol(symbol)}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
              }
              sx={{ 
                  '&:hover': { 
                      backgroundColor: 'action.hover',
                      cursor: 'pointer'
                    },
                    borderRadius: 1
                }}
              onClick={() => onSelectSymbol(symbol)}
            >
              <ListItemText primary={symbol} primaryTypographyProps={{ fontWeight: 500 }} />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};
