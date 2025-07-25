import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, History, LogOut, Trophy, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  first_name: string;
  last_name: string;
  photo_url: string | null;
}

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user?.id) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('first_name, last_name, photo_url')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      setProfile(data);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getUserDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return user?.email || 'User';
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/6b2a3a0f-ee63-46a5-893e-8fdb1833e4f1.png" 
            alt="Scratch Golf Club" 
            className="h-10"
          />
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Button
            variant={isActive('/dashboard') ? 'default' : 'ghost'}
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant={isActive('/leaderboard') ? 'default' : 'ghost'}
            onClick={() => navigate('/leaderboard')}
            className="flex items-center gap-2"
          >
            <Trophy className="h-4 w-4" />
            Leaderboard
          </Button>
        </nav>

        {/* Profile Dropdown */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.photo_url || undefined} alt={getUserDisplayName()} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium">{getUserDisplayName()}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/swing-history')}>
                <History className="mr-2 h-4 w-4" />
                Swing History
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};

export default Header;