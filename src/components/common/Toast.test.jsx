// src/components/common/Toast.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Toast from './Toast';

describe('Toast', () => {
  it('should render toast with message', () => {
    render(<Toast message="Test message" type="success" />);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should render success toast with green styling', () => {
    const { container } = render(<Toast message="Success!" type="success" />);
    
    const toast = container.querySelector('.bg-green-50');
    expect(toast).toBeInTheDocument();
  });

  it('should render error toast with red styling', () => {
    const { container } = render(<Toast message="Error!" type="error" />);
    
    const toast = container.querySelector('.bg-red-50');
    expect(toast).toBeInTheDocument();
  });

  it('should render warning toast with yellow styling', () => {
    const { container } = render(<Toast message="Warning!" type="warning" />);
    
    const toast = container.querySelector('.bg-yellow-50');
    expect(toast).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Toast message="Test" type="success" onClose={onClose} />);
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should auto-dismiss after duration', async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    
    render(<Toast message="Test" type="success" onClose={onClose} duration={3000} />);
    
    expect(onClose).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(3000);
    
    expect(onClose).toHaveBeenCalledTimes(1);
    
    vi.useRealTimers();
  });

  it('should render with custom action button', () => {
    const action = {
      label: 'Undo',
      onClick: vi.fn()
    };
    
    render(<Toast message="Test" type="success" action={action} />);
    
    const actionButton = screen.getByText('Undo');
    expect(actionButton).toBeInTheDocument();
    
    fireEvent.click(actionButton);
    expect(action.onClick).toHaveBeenCalledTimes(1);
  });
});
