'use client'

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { FloppyDisk as SaveIcon } from '@phosphor-icons/react/dist/ssr/FloppyDisk';
import { FolderOpen as LoadIcon } from '@phosphor-icons/react/dist/ssr/FolderOpen';
import { Trash as DeleteIcon } from '@phosphor-icons/react/dist/ssr/Trash';

/**
 * Manage saved queries: save, load, delete
 */
export function SavedQueries({ 
  savedQueries, 
  onLoad, 
  onSave, 
  onDelete 
}) {
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = React.useState(false);
  const [queryName, setQueryName] = React.useState('');

  const handleSaveClick = () => {
    setSaveDialogOpen(true);
    setQueryName('');
  };

  const handleSaveConfirm = () => {
    if (queryName.trim()) {
      onSave(queryName.trim());
      setSaveDialogOpen(false);
      setQueryName('');
    }
  };

  const handleLoadClick = () => {
    setLoadDialogOpen(true);
  };

  const handleLoadQuery = (query) => {
    onLoad(query);
    setLoadDialogOpen(false);
  };

  const handleDeleteQuery = (name, event) => {
    event.stopPropagation();
    if (window.confirm(`Delete saved query "${name}"?`)) {
      onDelete(name);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        variant="outlined"
        startIcon={<SaveIcon />}
        onClick={handleSaveClick}
        size="small"
      >
        Save Query
      </Button>

      <Button
        variant="outlined"
        startIcon={<LoadIcon />}
        onClick={handleLoadClick}
        size="small"
      >
        Load Query
      </Button>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Query</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Query Name"
            type="text"
            fullWidth
            value={queryName}
            onChange={(e) => setQueryName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSaveConfirm();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveConfirm} variant="contained" disabled={!queryName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Load Dialog */}
      <Dialog open={loadDialogOpen} onClose={() => setLoadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Load Saved Query</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {savedQueries.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <Typography>No saved queries</Typography>
            </Box>
          ) : (
            <List>
              {savedQueries.map((query) => (
                <ListItem
                  key={query.name}
                  disablePadding
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={(e) => handleDeleteQuery(query.name, e)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemButton onClick={() => handleLoadQuery(query)}>
                    <ListItemText
                      primary={query.name}
                      secondary={new Date(query.savedAt).toLocaleString()}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoadDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
