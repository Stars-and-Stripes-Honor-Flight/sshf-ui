import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { QueryEditor } from '../query-editor';

describe('QueryEditor', () => {
  const mockOnChange = jest.fn();
  const mockOnRun = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render editor with placeholder', () => {
    render(<QueryEditor value={{}} onChange={mockOnChange} onRun={mockOnRun} isLoading={false} />);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('Run Query')).toBeInTheDocument();
  });

  it('should display initial value as formatted JSON', () => {
    const initialValue = { selector: { type: 'Veteran' }, limit: 25 };
    render(<QueryEditor value={initialValue} onChange={mockOnChange} onRun={mockOnRun} isLoading={false} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea.value).toContain('"type": "Veteran"');
  });

  it('should call onChange with parsed JSON on valid input', async () => {
    render(<QueryEditor value={{}} onChange={mockOnChange} onRun={mockOnRun} isLoading={false} />);
    
    const textarea = screen.getByRole('textbox');
    const validJson = '{"selector":{"type":"Veteran"},"limit":25}';
    
    fireEvent.change(textarea, { target: { value: validJson } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  it('should show error for invalid JSON', () => {
    render(<QueryEditor value={{}} onChange={mockOnChange} onRun={mockOnRun} isLoading={false} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '{invalid json}' } });

    // Check for error by finding an Alert with error severity
    const alerts = screen.getAllByRole('alert');
    const errorAlert = alerts.find(alert => alert.textContent.includes('Invalid JSON'));
    expect(errorAlert).toBeInTheDocument();
  });

  it('should reject skip parameter', () => {
    render(<QueryEditor value={{}} onChange={mockOnChange} onRun={mockOnRun} isLoading={false} />);
    
    const textarea = screen.getByRole('textbox');
    const withSkip = '{"selector":{},"skip":10}';
    
    fireEvent.change(textarea, { target: { value: withSkip } });

    expect(screen.getByText(/skip.*not allowed/i)).toBeInTheDocument();
  });

  it('should reject mutation operators at top level', () => {
    render(<QueryEditor value={{}} onChange={mockOnChange} onRun={mockOnRun} isLoading={false} />);
    
    const textarea = screen.getByRole('textbox');
    const withMutation = '{"$set":{"field":"value"},"selector":{}}';
    
    fireEvent.change(textarea, { target: { value: withMutation } });

    expect(screen.getByText(/Mutation operations.*not allowed/i)).toBeInTheDocument();
  });

  it('should reject mutation operators in selector', () => {
    render(<QueryEditor value={{}} onChange={mockOnChange} onRun={mockOnRun} isLoading={false} />);
    
    const textarea = screen.getByRole('textbox');
    const withMutation = '{"selector":{"$set":{"field":"value"}}}';
    
    fireEvent.change(textarea, { target: { value: withMutation } });

    expect(screen.getByText(/Mutation operator.*found in selector/i)).toBeInTheDocument();
  });

  it('should allow type field in selector', async () => {
    render(<QueryEditor value={{}} onChange={mockOnChange} onRun={mockOnRun} isLoading={false} />);
    
    const textarea = screen.getByRole('textbox');
    const validQuery = '{"selector":{"type":"Veteran"},"limit":25}';
    
    fireEvent.change(textarea, { target: { value: validQuery } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          selector: expect.objectContaining({ type: 'Veteran' })
        })
      );
    });

    // Should not show any error
    expect(screen.queryByText(/not allowed/i)).not.toBeInTheDocument();
  });

  it('should call onRun with parsed query when Run button clicked', async () => {
    const user = userEvent.setup();
    render(<QueryEditor value={{ selector: { type: 'Veteran' }, limit: 25 }} onChange={mockOnChange} onRun={mockOnRun} isLoading={false} />);
    
    const runButton = screen.getByText('Run Query');
    await user.click(runButton);

    expect(mockOnRun).toHaveBeenCalledWith({
      selector: { type: 'Veteran' },
      limit: 25
    });
  });

  it('should include execution_stats when checkbox is checked', async () => {
    const user = userEvent.setup();
    render(<QueryEditor value={{ selector: {} }} onChange={mockOnChange} onRun={mockOnRun} isLoading={false} />);
    
    const statsCheckbox = screen.getByRole('checkbox', { name: /execution statistics/i });
    await user.click(statsCheckbox);

    const runButton = screen.getByText('Run Query');
    await user.click(runButton);

    expect(mockOnRun).toHaveBeenCalledWith(
      expect.objectContaining({
        execution_stats: true
      })
    );
  });

  it('should not call onRun if there is a validation error', async () => {
    render(<QueryEditor value={{}} onChange={mockOnChange} onRun={mockOnRun} isLoading={false} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '{invalid}' } });

    await waitFor(() => {
      const runButton = screen.getByText('Run Query');
      expect(runButton).toBeDisabled();
    });
    
    expect(mockOnRun).not.toHaveBeenCalled();
  });

  it('should disable controls when isLoading is true', () => {
    render(<QueryEditor value={{}} onChange={mockOnChange} onRun={mockOnRun} isLoading={true} />);
    
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByText('Run Query')).toBeDisabled();
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('should show tip about document types', () => {
    render(<QueryEditor value={{}} onChange={mockOnChange} onRun={mockOnRun} isLoading={false} />);
    
    expect(screen.getByText(/Documents use capitalized types/i)).toBeInTheDocument();
    expect(screen.getByText(/Veteran/i)).toBeInTheDocument();
    expect(screen.getByText(/Guardian/i)).toBeInTheDocument();
  });

  it('should sync editor when value prop changes', () => {
    const initialValue = { selector: { type: 'Guardian' }, limit: 10 };
    const { rerender } = render(
      <QueryEditor value={initialValue} onChange={mockOnChange} onRun={mockOnRun} isLoading={false} />
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea.value).toContain('"type": "Guardian"');
    expect(textarea.value).toContain('"limit": 10');

    // Update the value prop (simulating loading a saved query)
    const newValue = { selector: { type: 'Veteran' }, limit: 25 };
    rerender(
      <QueryEditor value={newValue} onChange={mockOnChange} onRun={mockOnRun} isLoading={false} />
    );

    // Editor should now show the new value
    expect(textarea.value).toContain('"type": "Veteran"');
    expect(textarea.value).toContain('"limit": 25');
    expect(textarea.value).not.toContain('"type": "Guardian"');
  });
});
