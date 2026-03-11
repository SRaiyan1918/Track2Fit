import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  Sun, 
  Moon, 
  LogOut, 
  User, 
  Settings,
  Droplets,
  Trophy,
  Home,
  Activity,
  Apple,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'water', label: 'Water Tracker', icon: Droplets },
  { id: 'exercise', label: 'Exercise', icon: Activity },
  { id: 'nutrition', label: 'Nutrition', icon: Apple },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'badges', label: 'Badges', icon: Trophy },
];

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const { userProfile, logout } = useAuth();
  const { darkMode, toggleDarkMode, ramadanMode, toggleRamadanMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Track2Fit
            </span>
            {ramadanMode && (
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 ml-2">
                <Moon className="w-3 h-3 mr-1" />
                Ramadan
              </Badge>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'gap-2',
                  activeTab === item.id 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'text-slate-600 dark:text-slate-400'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="hidden sm:flex"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={userProfile?.photoURL || ''} alt={userProfile?.name || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white">
                      {getInitials(userProfile?.name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile?.photoURL || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white text-xs">
                      {getInitials(userProfile?.name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">{userProfile?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{userProfile?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onTabChange('profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTabChange('settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleRamadanMode}>
                  <Moon className="mr-2 h-4 w-4" />
                  {ramadanMode ? 'Disable Ramadan Mode' : 'Enable Ramadan Mode'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                      <Droplets className="w-4 h-4 text-white" />
                    </div>
                    Track2Fit
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-6">
                  {navItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? 'default' : 'ghost'}
                      onClick={() => {
                        onTabChange(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        'justify-start gap-3',
                        activeTab === item.id 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : ''
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Button>
                  ))}
                  <div className="border-t my-2" />
                  <Button
                    variant="ghost"
                    onClick={() => {
                      toggleDarkMode();
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start gap-3"
                  >
                    {darkMode ? (
                      <>
                        <Sun className="w-5 h-5 text-amber-500" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="w-5 h-5" />
                        Dark Mode
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      toggleRamadanMode();
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start gap-3"
                  >
                    <Moon className="w-5 h-5 text-indigo-500" />
                    {ramadanMode ? 'Disable Ramadan Mode' : 'Enable Ramadan Mode'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onTabChange('profile');
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start gap-3"
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onTabChange('settings');
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start gap-3"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="justify-start gap-3 text-red-600"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
