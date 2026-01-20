import React from 'react';
import { Home, ChevronRight } from 'lucide-react';

const Breadcrumbs = ({ path, onNavigate }) => (
  <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6 overflow-x-auto whitespace-nowrap pb-2">
    <button onClick={() => onNavigate('home')} className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center transition-colors">
      <Home size={16} className="mr-1" /> Home
    </button>
    {path.map((item, index) => (
      <React.Fragment key={`crumb-${item.type}-${item.id}-${index}`}>
        <ChevronRight size={16} className="mx-2" />
        <button 
          onClick={() => onNavigate(item.type, item.id)}
          className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${index === path.length - 1 ? 'font-bold text-gray-800 dark:text-gray-100' : ''}`}
        >
          {item.title}
        </button>
      </React.Fragment>
    ))}
  </nav>
);

export default Breadcrumbs;