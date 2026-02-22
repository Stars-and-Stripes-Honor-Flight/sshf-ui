import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), '.nav-logs.json');

export async function POST(request) {
  try {
    const { message, data, timestamp } = await request.json();
    
    const logEntry = {
      timestamp,
      message,
      data
    };
    
    // Read existing logs
    let logs = [];
    try {
      if (fs.existsSync(LOG_FILE)) {
        const content = fs.readFileSync(LOG_FILE, 'utf-8');
        logs = JSON.parse(content);
      }
    } catch (e) {
      logs = [];
    }
    
    // Add new log and keep only last 100
    logs.push(logEntry);
    if (logs.length > 100) {
      logs = logs.slice(-100);
    }
    
    // Write back to file
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
    
    // Print to terminal
    console.log(`[NAV] ${message} ${JSON.stringify(data)}`);
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to log navigation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return NextResponse.json({ logs: [] });
    }
    
    const content = fs.readFileSync(LOG_FILE, 'utf-8');
    const logs = JSON.parse(content);
    
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Failed to read navigation logs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE to clear logs
export async function DELETE() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      fs.unlinkSync(LOG_FILE);
    }
    console.log('[NAV] Logs cleared');
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to clear logs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
