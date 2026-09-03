'use client'

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Play as PlayIcon } from '@phosphor-icons/react/dist/ssr/Play';

const MUTATION_OPERATORS = ['$set', '$update', '$unset', '$inc', '$push', '$pull', '$addToSet'];
const MUTATION_KEYS = ['docs', 'bulk', 'remove', '_deleted'];

/**
 * JSON editor for Mango queries with client-side validation
 */
export function QueryEditor({ 
  value, 
  onChange, 
  onRun, 
  isLoading 
}) {
  const [editorValue, setEditorValue] = React.useState(() => 
    typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  );
  const [error, setError] = React.useState(null);
  const [includeStats, setIncludeStats] = React.useState(false);

  // Sync editor value when value prop changes (e.g., when loading a saved query)
  React.useEffect(() => {
    const newValue = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    setEditorValue(newValue);
    setError(null);
  }, [value]);

  // Validate JSON and check for forbidden operations
  const validateQuery = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      
      // Check for skip at top level (API rejects it)
      if ('skip' in parsed) {
        return { error: 'The "skip" parameter is not allowed. Use bookmark-based pagination instead.' };
      }

      // Check for mutation operators or keys at top level
      const topLevelKeys = Object.keys(parsed);
      for (const key of topLevelKeys) {
        if (MUTATION_OPERATORS.includes(key) || MUTATION_KEYS.includes(key)) {
          return { error: `Mutation operations are not allowed. Found forbidden key: "${key}"` };
        }
      }

      // Check for mutation operators in selector (deep check)
      if (parsed.selector) {
        const checkForMutations = (obj) => {
          for (const key of Object.keys(obj)) {
            if (MUTATION_OPERATORS.includes(key)) {
              return key;
            }
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
              const found = checkForMutations(obj[key]);
              if (found) return found;
            }
          }
          return null;
        };

        const mutationFound = checkForMutations(parsed.selector);
        if (mutationFound) {
          return { error: `Mutation operator "${mutationFound}" found in selector. Only query operations are allowed.` };
        }
      }

      return { parsed };
    } catch (err) {
      return { error: `Invalid JSON: ${err.message}` };
    }
  };

  const handleEditorChange = (e) => {
    const newValue = e.target.value;
    setEditorValue(newValue);
    setError(null);
    
    // Validate on change
    const validation = validateQuery(newValue);
    if (validation.error) {
      setError(validation.error);
    } else if (onChange) {
      onChange(validation.parsed);
    }
  };

  const handleRun = () => {
    const validation = validateQuery(editorValue);
    
    if (validation.error) {
      setError(validation.error);
      return;
    }

    setError(null);
    
    // Add execution_stats if requested
    const queryBody = { ...validation.parsed };
    if (includeStats) {
      queryBody.execution_stats = true;
    }

    onRun(queryBody);
  };

  const handleKeyDown = (e) => {
    // Support Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = editorValue.substring(0, start) + '  ' + editorValue.substring(end);
      setEditorValue(newValue);
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }

    // Ctrl/Cmd + Enter to run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Query JSON
        </Typography>
        <TextField
          multiline
          fullWidth
          rows={12}
          value={editorValue}
          onChange={handleEditorChange}
          onKeyDown={handleKeyDown}
          placeholder='{\n  "selector": { "type": "Veteran" },\n  "limit": 25\n}'
          disabled={isLoading}
          sx={{
            '& .MuiInputBase-input': {
              fontFamily: 'monospace',
              fontSize: '0.875rem',
            }
          }}
        />
      </Box>

      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={includeStats}
              onChange={(e) => setIncludeStats(e.target.checked)}
              disabled={isLoading}
            />
          }
          label="Include execution statistics"
        />

        <Button
          variant="contained"
          startIcon={<PlayIcon />}
          onClick={handleRun}
          disabled={isLoading || !!error}
        >
          Run Query
        </Button>
      </Box>

      <Alert severity="info">
        <Typography variant="caption">
          <strong>Tips:</strong> Documents use capitalized types like <code>type: "Veteran"</code> or <code>type: "Guardian"</code>.
          Use Tab for indentation. Press Ctrl/Cmd+Enter to run.
        </Typography>
      </Alert>
    </Stack>
  );
}
