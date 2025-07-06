import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: '🏠', path: '/' },
  { label: 'Store', icon: '➕', path: '/store' },
  { label: 'Customers', icon: '🧑‍🤝‍🧑', path: '/customers' },
  { label: 'Suppliers', icon: '🚚', path: '/suppliers' },
  { label: 'User', icon: '👥', path: '/user' },
  { label: 'Sale Items', icon: '➕', path: '/sale_items' },
  { label: 'Stock Out (Sales)', icon: '➖', path: '/stock-out' },
  { label: 'Reports', icon: '📊', path: '/reports' },
  { 
    label: 'Settings', 
    icon: '⚙️',
    hasDropdown: true,
    subItems: [
      { label: 'General Settings', icon: '🔧', path: '/settings/general' },
      { label: 'Add Categories', icon: '👥', path: '/categories' },
      { label: 'Add product', icon: '🔒', path: '/product' },
      { label: 'Backup & Restore', icon: '💾', path: '/settings/backup' },
      { label: 'System Updates', icon: '🔄', path: '/settings/updates' },
      { label: 'API Configuration', icon: '🔗', path: '/settings/api' }
    ]
  },
];

function Sidebar({ open, onClose }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get user info from localStorage
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {}
  const displayName = user?.full_name || user?.username || user?.email || 'User';
  const role = user?.role;

  // Filter navItems for cashier, manager, and inventory
  let filteredNavItems;
  if (role === 'cashier') {
    filteredNavItems = navItems.filter(item => item.label === 'Stock Out (Sales)');
  } else if (role === 'manager') {
    filteredNavItems = navItems.filter(item =>
      [
        'Dashboard',
        'Store',
        'Customers',
        'Suppliers',
        'Sale Items',
        'Stock Out (Sales)',
        'Reports',
        'Settings'
      ].includes(item.label)
    ).map(item => {
      if (item.label === 'Settings') {
        // Only allow inventory/product/category-related subitems
        return {
          ...item,
          subItems: item.subItems.filter(sub =>
            ['Add Categories', 'Add product'].includes(sub.label)
          )
        };
      }
      return item;
    });
  } else if (role === 'inventory') {
    filteredNavItems = navItems.filter(item =>
      [
        'Store',
        'Suppliers',
        'Settings'
      ].includes(item.label)
    ).map(item => {
      if (item.label === 'Settings') {
        // Only allow inventory/product/category-related subitems
        return {
          ...item,
          subItems: item.subItems.filter(sub =>
            ['Add Categories', 'Add product'].includes(sub.label)
          )
        };
      }
      return item;
    });
  } else {
    filteredNavItems = navItems;
  }

  // Handle click outside for profile dropdown
  React.useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest('.profile-dropdown')) {
        setProfileDropdownOpen(false);
      }
    }
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClick);
    } else {
      document.removeEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileDropdownOpen]);

  const toggleDropdown = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (open) {
      onClose(); // Close mobile sidebar after navigation
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    if (open) onClose();
  };

  const renderNavItem = (item) => {
    const isDropdownOpen = openDropdown === item.label;
    const isActive = location.pathname === item.path;
    
    return (
      <li key={item.label}>
        <button
          onClick={() => item.hasDropdown ? toggleDropdown(item.label) : handleNavigation(item.path)}
          className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg font-medium transition ${
            isActive 
              ? 'bg-purple-100 text-purple-700' 
              : 'text-gray-700 hover:bg-purple-100 hover:text-purple-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </div>
          {item.hasDropdown && (
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
        
        {item.hasDropdown && isDropdownOpen && (
          <ul className="ml-6 mt-2 space-y-1">
            {item.subItems.map((subItem) => {
              const isSubActive = location.pathname === subItem.path;
              return (
                <li key={subItem.label}>
                  <button
                    onClick={() => handleNavigation(subItem.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                      isSubActive 
                        ? 'bg-purple-50 text-purple-700' 
                        : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                    }`}
                  >
                    <span className="text-sm">{subItem.icon}</span>
                    <span>{subItem.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
      {/* Mobile sidebar (overlay) */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-56 bg-white shadow-lg flex flex-col py-8 px-4 transform transition-transform duration-200 md:hidden
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ willChange: 'transform' }}
      >
        <div className="mb-8 flex items-center justify-between">
          <span className="text-2xl font-bold text-purple-700 tracking-wide">StockMS</span>
          <button onClick={onClose} className="text-gray-500 hover:text-purple-700 text-2xl" aria-label="Close sidebar">
            &times;
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {filteredNavItems.map(renderNavItem)}
          </ul>
        </nav>
      </div>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-white shadow-lg flex-col py-8 px-4 min-h-screen">
        <div className="mb-8 text-2xl font-bold text-purple-700 tracking-wide text-center">AI-Powered POS System</div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {filteredNavItems.map(renderNavItem)}
          </ul>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;