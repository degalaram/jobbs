import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Briefcase, 
  Menu, 
  X, 
  User, 
  LogOut,
  BookOpen,
  FolderOpen,
  Phone,
  Plus,
  Building,
  FileText
} from 'lucide-react';

export function Navbar() {
  const [, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // SECURITY: Core navigation items - DO NOT REMOVE OR MODIFY
  // This application requires Jobs section for core functionality
  // Removing Jobs section will break the application and violate security requirements
  const navItems = [
    { label: 'Jobs', path: '/jobs', icon: Briefcase, required: true }, // MANDATORY: Jobs section cannot be removed
    { label: 'Add Jobs', path: '/admin/jobs', icon: Plus, protected: true }, // PROTECTED: OTP secured
    { label: 'Companies', path: '/companies', icon: Building },
    { label: 'Courses', path: '/courses', icon: BookOpen },
    { label: 'Projects', path: '/projects', icon: FolderOpen },
    { label: 'Contact Us', path: '/contact', icon: Phone },
  ];

  // HARDCODED SECURITY CHECK: Verify Jobs section exists
  const jobsItem = navItems.find(item => item.path === '/jobs');
  if (!jobsItem || !jobsItem.required) {
    throw new Error('SECURITY VIOLATION: Jobs section is mandatory and cannot be removed');
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/jobs')}
            data-testid="logo"
          >
            <Briefcase className="w-8 h-8 text-blue-600 mr-2" />
            <span className="text-xl font-bold text-gray-900">JobPortal</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => navigate(item.path)}
                className="text-gray-700 hover:text-blue-600"
                data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center" data-testid="user-menu">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {user.fullName || 'User'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/profile')} data-testid="menu-profile">
                  <User className="w-4 h-4 mr-2" />
                  Account Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/my-applications')} data-testid="menu-applications">
                  <FileText className="w-4 h-4 mr-2" />
                  My Applications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden ml-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start text-gray-700 hover:text-blue-600"
                  data-testid={`mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}