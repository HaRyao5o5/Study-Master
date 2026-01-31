import { render, screen, fireEvent } from '@testing-library/react';
import SettingsView from './SettingsView';
import { describe, it, expect, vi } from 'vitest';
import { exportToFile } from '../../utils/fileIO';

// Mock useToast
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
const mockShowConfirm = vi.fn();

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
    showConfirm: mockShowConfirm
  })
}));

// Mock Firebase helpers and Utils
vi.mock('../../utils/fileIO', () => ({
  exportToFile: vi.fn(),
  importFromFile: vi.fn()
}));
vi.mock('../../lib/firebase', () => ({
  updateUserProfile: vi.fn(),
  auth: {}
}));
vi.mock('../../data/changelog', () => ({
  CHANGELOG_DATA: [{ version: '1.0.0', date: '2023-01-01', title: 'v1.0.0', details: [] }]
}));

describe('SettingsView', () => {
  const defaultProps = {
    theme: 'light',
    changeTheme: vi.fn(),
    onBack: vi.fn(),
    courses: [],
    onImportData: vi.fn(),
    onResetStats: vi.fn(),
    onDebugYesterday: vi.fn(),
    onDebugBroken: vi.fn(),
    onDebugResetToday: vi.fn(),
    user: { displayName: 'Test User', email: 'test@example.com', uid: '123' } as any,
    onLogin: vi.fn(),
    onLogout: vi.fn(),
    onEditProfile: vi.fn()
  };

  it('renders settings sections', () => {
    render(<SettingsView {...defaultProps} />);
    expect(screen.getByText('アカウント')).toBeDefined();
    expect(screen.getByText('外観')).toBeDefined();
    expect(screen.getByText('データ管理')).toBeDefined();
    expect(screen.getByText('リセット操作')).toBeDefined();
  });

  it('displays user info when logged in', () => {
    render(<SettingsView {...defaultProps} />);
    expect(screen.getByText('Test User')).toBeDefined();
    expect(screen.getByText('test@example.com')).toBeDefined();
  });

  it('calls onBack when back button is clicked', () => {
    render(<SettingsView {...defaultProps} />);
    const backBtn = screen.getByLabelText('戻る');
    fireEvent.click(backBtn);
    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('calls changeTheme when theme buttons are clicked', () => {
    render(<SettingsView {...defaultProps} />);
    const darkBtn = screen.getByText('ダーク');
    fireEvent.click(darkBtn);
    expect(defaultProps.changeTheme).toHaveBeenCalledWith('dark');
  });

  it('calls exportToFile when backup button is clicked', () => {
    render(<SettingsView {...defaultProps} />);
    const exportBtn = screen.getByText('バックアップを作成').closest('button');
    if (exportBtn) {
      fireEvent.click(exportBtn);
      expect(exportToFile).toHaveBeenCalled();
    } else {
        throw new Error("Export button not found");
    }
  });
});
