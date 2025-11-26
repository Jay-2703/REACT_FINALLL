import React, { useState } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

/**
 * UserSearchFilter Component
 * Provides search functionality with filter dropdown
 */
const UserSearchFilter = ({ 
  onSearch, 
  onFilterChange,
  onScopeChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState('All Fields');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState(0);

  const scopes = ['All Fields', 'Name', 'Email', 'Phone', 'User ID'];
  const filters = [
    { label: 'Show All Users', value: 'all', count: '524' },
    { label: 'Only Students', value: 'students', count: '342' },
    { label: 'Only Instructors', value: 'instructors', count: '28' },
    { label: 'Only Admins', value: 'admins', count: '4' },
    { label: 'Only Active', value: 'active', count: '287' }
  ];

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Simulate search results
    const resultCount = query.length > 0 ? Math.floor(Math.random() * 50) + 1 : 0;
    setSearchResults(resultCount);
    onSearch?.(query, searchScope);
  };

  const handleScopeChange = (scope) => {
    setSearchScope(scope);
    onScopeChange?.(scope);
    if (searchQuery) {
      onSearch?.(searchQuery, scope);
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter.value);
    setShowFilterDropdown(false);
    onFilterChange?.(filter.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(0);
    onSearch?.('', searchScope);
  };

  const activeFilterLabel = filters.find(f => f.value === activeFilter)?.label || 'Show All Users';

  return (
    <div className="bg-[#2a2a2a] border border-[#444] rounded-2xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 mb-6">
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-white">Search & Filter Users</h4>
        
        <div className="flex gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or user ID..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-[#1b1b1b] border border-[#444] rounded-lg pl-10 pr-10 py-2.5 text-gray-300 placeholder-gray-600 focus:border-[#bfa45b] focus:outline-none transition duration-200"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition duration-200"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Search Scope Dropdown */}
          <select
            value={searchScope}
            onChange={(e) => handleScopeChange(e.target.value)}
            className="bg-[#1b1b1b] border border-[#444] rounded-lg px-4 py-2.5 text-gray-300 focus:border-[#bfa45b] focus:outline-none transition duration-200 whitespace-nowrap"
          >
            {scopes.map((scope) => (
              <option key={scope} value={scope}>
                {scope}
              </option>
            ))}
          </select>

          {/* Filter Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1b1b1b] border border-[#444] rounded-lg text-gray-300 hover:border-[#bfa45b] hover:text-[#bfa45b] transition duration-200 whitespace-nowrap"
            >
              <span className="text-sm font-medium">Filter</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${showFilterDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Filter Dropdown Menu */}
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-[#2a2a2a] border border-[#444] rounded-lg shadow-xl z-50">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => handleFilterChange(filter)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition duration-200 flex items-center justify-between hover:bg-[#bfa45b]/10 ${
                      activeFilter === filter.value ? 'bg-[#bfa45b]/20 text-[#bfa45b] font-semibold' : 'text-gray-300 hover:text-[#bfa45b]'
                    } ${filter !== filters[filters.length - 1] ? 'border-b border-[#444]/50' : ''}`}
                  >
                    <span>{filter.label}</span>
                    <span className="text-xs opacity-75">({filter.count})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Results Counter */}
        {searchQuery && (
          <p className="text-xs text-gray-400">
            Found <span className="text-[#bfa45b] font-semibold">{searchResults}</span> result{searchResults !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserSearchFilter;
