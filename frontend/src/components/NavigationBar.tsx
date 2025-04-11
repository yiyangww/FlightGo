import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Home, User, ArrowLeft, ArrowRight } from 'lucide-react';

interface NavigationBarProps {
  onBack?: () => void;
  onForward?: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ onBack, onForward }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const username = user?.username || 'User';

  const showBackButton = location.pathname !== '/dashboard';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleForward = () => {
    if (onForward) {
      onForward();
    } else {
      navigate(1);
    }
  };

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <Button
              variant="ghost"
              onClick={handleBack}
              size="icon"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={handleForward}
            size="icon"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <Home className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => user ? navigate('/profile') : navigate('/login')}
          >
            <User className="h-5 w-5" />
            <span>{username}</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar; 