import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { Calendar, List, BarChart3, Filter } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: BarChart3,
    },
    {
      href: '/activities',
      label: 'Activities',
      icon: List,
    },
    {
      href: '/activity-logs',
      label: 'Activity Logs',
      icon: Calendar,
    },
    {
      href: '/excluded-intervals',
      label: 'Excluded Intervals',
      icon: Filter,
    },
  ];

  return (
    <nav className="flex space-x-2">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;

        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default Navigation;
