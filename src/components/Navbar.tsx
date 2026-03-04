import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun, Menu, X, BookOpen, LogIn, LogOut, User } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

const links = [
  { to: '/', label: 'Home' },
  { to: '/search', label: 'Search' },
  { to: '/genres', label: 'Genres' },
];

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/50 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <BookOpen className="h-6 w-6 text-blue-600 dark:text-purple-500" />
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">MangaVerse</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === l.to
                  ? 'bg-blue-500/10 text-blue-600 dark:bg-purple-500/20 dark:text-purple-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Auth buttons - Desktop */}
          {!loading && (
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600 dark:text-red-400 cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <LogIn className="h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm" className="gap-2">
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}

          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200/50 dark:border-white/5 bg-white/95 dark:bg-black/95 px-4 pb-4">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === l.to
                  ? 'bg-blue-500/10 text-blue-600 dark:bg-purple-500/20 dark:text-purple-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
          
          {/* Mobile auth links */}
          <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-white/5">
            {user ? (
              <>
                <div className="px-4 py-2 text-sm text-muted-foreground truncate">
                  {user.email}
                </div>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Login
                  </span>
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-center mt-2"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
