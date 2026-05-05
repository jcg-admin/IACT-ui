/**
 * Mock data for testing
 */

export const mockUserInfo = {
  name: 'John Doe',
  email: 'john@iact.com',
  avatar_url: '/avatar.jpg',
  role: 'admin',
  id: '123',
}

export const mockNavLinks = [
  { id: 1, label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { id: 2, label: 'Transactions', path: '/transactions', icon: 'transactions' },
  { id: 3, label: 'Jobs', path: '/jobs', icon: 'jobs' },
  { id: 4, label: 'Reports', path: '/reports', icon: 'reports' },
  { id: 5, label: 'Settings', path: '/settings', icon: 'settings' },
]

export const mockNotifications = [
  { id: 1, message: 'New transaction', read: false, timestamp: new Date() },
  { id: 2, message: 'Job completed', read: true, timestamp: new Date() },
  { id: 3, message: 'Report ready', read: false, timestamp: new Date() },
]

export const mockHeaderProps = {
  currentPage: 'Dashboard',
  unreadCount: 3,
  userInfo: mockUserInfo,
  onMenuClick: jest.fn(),
  onNavigate: jest.fn(),
  onLogout: jest.fn(),
}

export const mockSidebarProps = {
  isOpen: true,
  onClose: jest.fn(),
  onNavigate: jest.fn(),
  currentPage: 'Dashboard',
  navLinks: mockNavLinks,
}
