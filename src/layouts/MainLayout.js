import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Profile dropdown state
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Get user info from localStorage
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {}
  const displayName = user?.full_name || user?.username || user?.email || 'User';
  const role = user?.role;

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky, modern header */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-white shadow-sm flex items-center justify-between px-4 md:px-8 h-16">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xl md:text-2xl text-purple-700 tracking-tight select-none">AI-Powered POS</span>
        </div>
        <div className="profile-dropdown relative flex items-center ml-auto">
          <button
            className="flex items-center gap-2 p-2 bg-purple-50 hover:bg-purple-100 rounded-full focus:outline-none transition"
            onClick={() => setProfileDropdownOpen((v) => !v)}
          >
            <span className="text-2xl bg-purple-200 text-purple-700 rounded-full w-10 h-10 flex items-center justify-center font-bold">
              {displayName.charAt(0).toUpperCase()}
            </span>
            <span className="font-semibold text-purple-800 text-base leading-tight hidden sm:block">{displayName}</span>
            <svg className={`w-4 h-4 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg z-50 animate-fade-in">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </header>
      <div className="flex-1 flex flex-row w-full">
        {/* Sidebar for non-cashier roles */}
        {role !== 'cashier' && (
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        <main className="flex-1 p-2 sm:p-4 md:p-6 w-full max-w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
