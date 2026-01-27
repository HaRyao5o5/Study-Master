// src/components/common/Toast.test.tsx
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Toast from './Toast';

describe('Toast', () => {
  it('should render toast with message', () => {
    // @ts-ignore: Props id is required in TS but test might omit it if not crucial for rendering, but let's provide dummy
    render(<Toast id="1" message="Test message" type="success" onClose={vi.fn()} />);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should render success toast with green styling', () => {
    const { container } = render(<Toast id="1" message="Success!" type="success" onClose={vi.fn()} />);
    
    // Note: Tailwind classes might be on child
    const toast = container.querySelector('.bg-green-50');
    expect(toast).toBeInTheDocument();
  });

  it('should render error toast with red styling', () => {
    const { container } = render(<Toast id="1" message="Error!" type="error" onClose={vi.fn()} />);
    
    const toast = container.querySelector('.bg-red-50');
    expect(toast).toBeInTheDocument();
  });

  it('should render warning toast with yellow styling', () => {
    const { container } = render(<Toast id="1" message="Warning!" type="warning" onClose={vi.fn()} />);
    
    const toast = container.querySelector('.bg-yellow-50');
    expect(toast).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Toast id="1" message="Test" type="success" onClose={onClose} />);
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith("1");
  });

  it('should auto-dismiss after duration', async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    
    render(<Toast id="1" message="Test" type="success" onClose={onClose} duration={3000} />);
    
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
    
    render(<Toast id="1" message="Test" type="success" onClose={vi.fn()} action={action} />);
    
    const actionButton = screen.getByText('Undo');
    expect(actionButton).toBeInTheDocument();
    
    fireEvent.click(actionButton);
    expect(action.onClick).toHaveBeenCalledTimes(1);
  });
});
