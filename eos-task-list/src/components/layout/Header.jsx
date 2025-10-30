import { User, LogOut } from 'lucide-react';
import { useState } from 'react';

export const Header = ({ userName = 'John Doe', onLogout }) => {
  const [showLogout, setShowLogout] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1"></div>

      <div className="flex items-center gap-4">
        <div className="relative border-l border-gray-200 pl-4">
          <button
            onClick={() => setShowLogout(!showLogout)}
            className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors relative"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {userName.charAt(0)}
            </div>
            <span className="text-sm text-gray-600">{userName}</span>
          </button>

          {showLogout && (
            <button
              onClick={() => {
                setShowLogout(false);
                onLogout();
              }}
              className="absolute top-full right-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 whitespace-nowrap z-50"
            >
              <LogOut size={18} />
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
