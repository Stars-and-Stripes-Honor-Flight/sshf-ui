'use client';

import React from 'react';

export default function NavigationLogsPage() {
  const [logs, setLogs] = React.useState([]);
  const [autoRefresh, setAutoRefresh] = React.useState(true);

  React.useEffect(() => {
    const updateLogs = () => {
      try {
        const logsJson = sessionStorage.getItem('navigationLogs');
        const parsed = logsJson ? JSON.parse(logsJson) : [];
        setLogs(parsed);
      } catch (error) {
        console.error('Failed to read logs:', error);
      }
    };

    updateLogs();

    if (autoRefresh) {
      const interval = setInterval(updateLogs, 500);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleClearLogs = () => {
    sessionStorage.removeItem('navigationLogs');
    setLogs([]);
  };

  const handleCopyToClipboard = () => {
    const text = logs.join('\n');
    navigator.clipboard.writeText(text);
    alert('Logs copied to clipboard!');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '12px' }}>
      <h1>Navigation Logs</h1>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleCopyToClipboard} style={{ marginRight: '10px', padding: '8px 16px' }}>
          📋 Copy Logs
        </button>
        <button onClick={handleClearLogs} style={{ marginRight: '10px', padding: '8px 16px' }}>
          🗑️ Clear Logs
        </button>
        <label style={{ marginLeft: '20px' }}>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          {' '}Auto Refresh
        </label>
      </div>
      
      <div style={{
        border: '1px solid #ccc',
        padding: '10px',
        height: '600px',
        overflowY: 'auto',
        backgroundColor: '#f5f5f5',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}>
        {logs.length === 0 ? (
          <div style={{ color: '#999' }}>No logs yet. Try navigating around the app...</div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} style={{ marginBottom: '4px', color: '#333' }}>
              {log}
            </div>
          ))
        )}
      </div>
      
      <div style={{ marginTop: '20px', color: '#666', fontSize: '11px' }}>
        <p>📊 Total logs: {logs.length}</p>
        <p>💡 Open this page in one tab/window, then navigate in another and watch the logs update in real-time.</p>
      </div>
    </div>
  );
}
