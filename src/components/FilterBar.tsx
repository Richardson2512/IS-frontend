import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface PlatformOption {
  id: string;
  name: string;
  logo?: string;
  icon?: React.ReactNode;
}

interface FilterBarProps {
  platforms: PlatformOption[];
  selectedPlatforms: string[];
  onTogglePlatform: (id: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  timeFilter: string;
  onTimeFilterChange: (value: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  platforms,
  selectedPlatforms,
  onTogglePlatform,
  language,
  onLanguageChange,
  timeFilter,
  onTimeFilterChange
}) => {
  const [openPlatform, setOpenPlatform] = useState(false);
  const [openLang, setOpenLang] = useState(false);
  const [openTime, setOpenTime] = useState(false);
  const [brokenLogos, setBrokenLogos] = useState<Record<string, boolean>>({});
  
  // Refs for dropdown containers
  const platformRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (platformRef.current && !platformRef.current.contains(target)) {
        setOpenPlatform(false);
      }
      if (langRef.current && !langRef.current.contains(target)) {
        setOpenLang(false);
      }
      if (timeRef.current && !timeRef.current.contains(target)) {
        setOpenTime(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' }
  ];

  const timeFilters = [
    { value: 'hour', label: 'Past Hour' },
    { value: 'day', label: 'Past 24 Hours' },
    { value: 'week', label: 'Past Week' },
    { value: 'month', label: 'Past Month' },
    { value: 'year', label: 'Past Year' }
  ];

  const dropdownBtn =
    'inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-indigo-300 transition-colors text-sm';

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
      {/* Platforms */}
      <div className="relative" ref={platformRef}>
        <button className={dropdownBtn} onClick={() => setOpenPlatform(!openPlatform)}>
          Platforms <ChevronDown className="w-4 h-4" />
        </button>
        {openPlatform && (
          <div className="absolute z-20 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
            {platforms.map(p => (
              <button
                key={p.id}
                onClick={() => onTogglePlatform(p.id)}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-left text-sm ${
                  selectedPlatforms.includes(p.id)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {p.icon ? (
                  p.icon
                ) : p.logo && !brokenLogos[p.id] ? (
                  <img
                    src={p.logo}
                    alt={p.name}
                    className="w-5 h-5 rounded"
                    onError={() => setBrokenLogos(prev => ({ ...prev, [p.id]: true }))}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="w-5 h-5 rounded bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-semibold">
                    {p.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                )}
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Language */}
      <div className="relative" ref={langRef}>
        <button className={dropdownBtn} onClick={() => setOpenLang(!openLang)}>
          Language <ChevronDown className="w-4 h-4" />
        </button>
        {openLang && (
          <div className="absolute z-20 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
            {languages.map(l => (
              <button
                key={l.code}
                onClick={() => { onLanguageChange(l.code); setOpenLang(false); }}
                className={`w-full px-2 py-2 rounded-md text-left text-sm ${
                  language === l.code
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Time Filter */}
      <div className="relative" ref={timeRef}>
        <button className={dropdownBtn} onClick={() => setOpenTime(!openTime)}>
          Time Filter <ChevronDown className="w-4 h-4" />
        </button>
        {openTime && (
          <div className="absolute z-20 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
            {timeFilters.map(t => (
              <button
                key={t.value}
                onClick={() => { onTimeFilterChange(t.value); setOpenTime(false); }}
                className={`w-full px-2 py-2 rounded-md text-left text-sm ${
                  timeFilter === t.value
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


