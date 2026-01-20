import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Heart, BarChart3, Plus } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">EmoTrack</span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-700 hover:text-primary-600 transition-colors"
              >
                <BarChart3 className="w-5 h-5 mr-1" />
                Dashboard
              </button>
              <button
                onClick={() => navigate('/emotions')}
                className="flex items-center text-gray-700 hover:text-primary-600 transition-colors"
              >
                <Heart className="w-5 h-5 mr-1" />
                Emotions
              </button>
              <button
                onClick={() => navigate('/emotions/new')}
                className="btn btn-primary flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Emotion
              </button>
              <div className="flex items-center space-x-2 border-l pl-4 ml-4">
                <span className="text-sm text-gray-700">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
