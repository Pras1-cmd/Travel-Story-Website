import { useState, useEffect } from 'react';

function FilterSidebar({ filters, onFilterChange, onReset }) {
  const [localFilters, setLocalFilters] = useState({
    category: filters.category || '',
    destination: filters.destination || '',
    reachableBy: filters.reachableBy || [],
    familyFriendly: filters.familyFriendly || false
  });

  useEffect(() => {
    setLocalFilters({
      category: filters.category || '',
      destination: filters.destination || '',
      reachableBy: filters.reachableBy ? filters.reachableBy.split(',') : [],
      familyFriendly: filters.familyFriendly === 'true' || filters.familyFriendly === true
    });
  }, [filters]);

  const categories = [
    'adventure', 'culture', 'food', 'nature', 'city',
    'budget', 'luxury', 'solo', 'family', 'other'
  ];

  const transportModes = ['train', 'bus', 'vehicle', 'flight'];

  const handleCategoryChange = (cat) => {
    const newCategory = localFilters.category === cat ? '' : cat;
    setLocalFilters(prev => ({ ...prev, category: newCategory }));
    onFilterChange({ ...localFilters, category: newCategory });
  };

  const handleDestinationChange = (e) => {
    const val = e.target.value;
    setLocalFilters(prev => ({ ...prev, destination: val }));
    onFilterChange({ ...localFilters, destination: val });
  };

  const handleTransportChange = (mode) => {
    const updated = localFilters.reachableBy.includes(mode)
      ? localFilters.reachableBy.filter(m => m !== mode)
      : [...localFilters.reachableBy, mode];

    setLocalFilters(prev => ({ ...prev, reachableBy: updated }));
    onFilterChange({ ...localFilters, reachableBy: updated });
  };

  const handleFamilyFriendlyChange = (e) => {
    const checked = e.target.checked;
    setLocalFilters(prev => ({ ...prev, familyFriendly: checked }));
    onFilterChange({ ...localFilters, familyFriendly: checked });
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        <button
          onClick={onReset}
          className="text-sm text-blue-600 hover:underline"
        >
          Reset All
        </button>
      </div>

      {/* Destination Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
        <input
          type="text"
          value={localFilters.destination}
          onChange={handleDestinationChange}
          placeholder="City or Country..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                localFilters.category === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Reachable By */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Reachable By</label>
        <div className="space-y-2">
          {transportModes.map(mode => (
            <label key={mode} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.reachableBy.includes(mode)}
                onChange={() => handleTransportChange(mode)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="capitalize">{mode}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Family Friendly */}
      <div>
        <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={localFilters.familyFriendly}
            onChange={handleFamilyFriendlyChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="font-medium">Family Friendly Only</span>
        </label>
      </div>
    </div>
  );
}

export default FilterSidebar;
