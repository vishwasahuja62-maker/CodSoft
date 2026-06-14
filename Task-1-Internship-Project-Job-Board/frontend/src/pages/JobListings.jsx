import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiGet } from '../utils/api';
import JobCard from '../components/JobCard';
import { SkeletonJobCard } from '../components/SkeletonLoader';
import { Search, MapPin, SlidersHorizontal, RefreshCcw, Briefcase, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function JobListings() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [selectedExperience, setSelectedExperience] = useState(searchParams.get('experience_level') || '');
  
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      setError('');
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (location) queryParams.append('location', location);
        if (selectedType) queryParams.append('type', selectedType);
        if (selectedExperience) queryParams.append('experience_level', selectedExperience);

        const data = await apiGet(`/jobs?${queryParams.toString()}`);
        setJobs(data);
      } catch (err) {
        setError('Failed to fetch job openings. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    const urlParams = {};
    if (search) urlParams.search = search;
    if (location) urlParams.location = location;
    if (selectedType) urlParams.type = selectedType;
    if (selectedExperience) urlParams.experience_level = selectedExperience;
    if (sortBy !== 'newest') urlParams.sort = sortBy;
    setSearchParams(urlParams);

    const delayDebounce = setTimeout(() => {
      fetchJobs();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, location, selectedType, selectedExperience, sortBy, setSearchParams]);

  const handleResetFilters = () => {
    setSearch('');
    setLocation('');
    setSelectedType('');
    setSelectedExperience('');
    setSortBy('newest');
  };

  const removeFilter = (key) => {
    if (key === 'search') setSearch('');
    if (key === 'location') setLocation('');
    if (key === 'type') setSelectedType('');
    if (key === 'experience') setSelectedExperience('');
  };

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote'];
  const experienceLevels = ['Entry', 'Mid-Level', 'Senior', 'Lead'];
  const hasActiveFilters = search || location || selectedType || selectedExperience;

  const sortedJobs = [...jobs].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
    
    const extractMinSalary = (salaryStr) => {
      if (!salaryStr) return 0;
      const numbers = salaryStr.match(/[\d,]+/g);
      if (numbers) {
        return parseInt(numbers[0].replace(/,/g, ''));
      }
      return 0;
    };

    if (sortBy === 'salary_high') return extractMinSalary(b.salary_range) - extractMinSalary(a.salary_range);
    if (sortBy === 'salary_low') return extractMinSalary(a.salary_range) - extractMinSalary(b.salary_range);
    
    return 0;
  });

  const FilterContent = () => (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '1rem' }}>
          <SlidersHorizontal size={18} /> Filters
        </span>
        {hasActiveFilters && (
          <button className="btn btn-outline btn-sm" onClick={handleResetFilters} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderRadius: '8px', borderColor: 'rgba(248, 113, 113, 0.3)', color: '#f87171' }}>
            <RefreshCcw size={12} /> Reset
          </button>
        )}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Search size={14} /> Search Keyword
        </h4>
        <div className="filter-input-wrapper">
          <input type="text" placeholder="Role title or company..." value={search} onChange={(e) => setSearch(e.target.value)} className="filter-input" />
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={14} /> Location
        </h4>
        <div className="filter-input-wrapper">
          <input type="text" placeholder="City, state, or Remote..." value={location} onChange={(e) => setLocation(e.target.value)} className="filter-input" />
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>Employment Type</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {jobTypes.map((type) => (
            <label key={type} className={`filter-radio-label ${selectedType === type ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: selectedType === type ? '#818cf8' : '#cbd5e1', fontSize: '0.95rem', fontWeight: selectedType === type ? 600 : 400, transition: 'all 0.2s', padding: '0.5rem 0.75rem', borderRadius: '8px', background: selectedType === type ? 'rgba(129, 140, 248, 0.08)' : 'transparent' }}>
              <input type="radio" name="jobType" checked={selectedType === type} onChange={() => setSelectedType(selectedType === type ? '' : type)} onClick={() => { if (selectedType === type) setSelectedType(''); }} style={{ accentColor: '#818cf8', width: '16px', height: '16px' }} />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>Experience Level</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {experienceLevels.map((lvl) => (
            <label key={lvl} className={`filter-radio-label ${selectedExperience === lvl ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: selectedExperience === lvl ? '#c084fc' : '#cbd5e1', fontSize: '0.95rem', fontWeight: selectedExperience === lvl ? 600 : 400, transition: 'all 0.2s', padding: '0.5rem 0.75rem', borderRadius: '8px', background: selectedExperience === lvl ? 'rgba(192, 132, 252, 0.08)' : 'transparent' }}>
              <input type="radio" name="expLevel" checked={selectedExperience === lvl} onChange={() => setSelectedExperience(selectedExperience === lvl ? '' : lvl)} onClick={() => { if (selectedExperience === lvl) setSelectedExperience(''); }} style={{ accentColor: '#c084fc', width: '16px', height: '16px' }} />
              <span>{lvl}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="landing-container" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <div className="bg-blobs">
          <div className="bg-glow-1"></div>
          <div className="bg-glow-2"></div>
          <div className="bg-glow-3"></div>
          <div className="bg-noise"></div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 2rem', position: 'relative', zIndex: 10, width: '100%' }}>
        
        <div style={{ marginBottom: '3rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto 3rem auto' }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
              Discover Your Next Opportunity
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1.15rem', lineHeight: 1.6 }}>
              Browse thousands of premium job openings from top companies globally. Use the filters to find roles that match your expertise and ambitions.
            </p>
          </motion.div>
        </div>

        <div className="mobile-only" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <button className="btn btn-outline" onClick={() => setIsMobileFiltersOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px' }}>
             <SlidersHorizontal size={18} /> Open Filters
           </button>
        </div>

        <div className="listings-grid" style={{ gap: '2rem' }}>
          <aside className="glass desktop-only filter-sidebar" style={{ padding: '2rem', height: 'fit-content', position: 'sticky', top: '100px', borderRadius: '24px' }}>
            <FilterContent />
          </aside>

          <AnimatePresence>
            {isMobileFiltersOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setIsMobileFiltersOpen(false)}
                  style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 998 }}
                />
                <motion.aside
                  initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '300px', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', zIndex: 999, padding: '2rem', borderRight: '1px solid rgba(255,255,255,0.1)', overflowY: 'auto' }}
                >
                  <button onClick={() => setIsMobileFiltersOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '0.5rem' }}>
                     <X size={24} />
                  </button>
                  <FilterContent />
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                {hasActiveFilters ? (
                  <>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', marginRight: '8px' }}>Active Filters:</span>
                    {search && (
                      <span className="badge" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(129, 140, 248, 0.1)', color: '#818cf8', border: '1px solid rgba(129, 140, 248, 0.2)' }}>
                        Search: {search} <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeFilter('search')} />
                      </span>
                    )}
                    {location && (
                      <span className="badge" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                        Loc: {location} <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeFilter('location')} />
                      </span>
                    )}
                    {selectedType && (
                      <span className="badge" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                        {selectedType} <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeFilter('type')} />
                      </span>
                    )}
                    {selectedExperience && (
                      <span className="badge" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(192, 132, 252, 0.1)', color: '#c084fc', border: '1px solid rgba(192, 132, 252, 0.2)' }}>
                        {selectedExperience} <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeFilter('experience')} />
                      </span>
                    )}
                    <button onClick={handleResetFilters} style={{ background: 'transparent', border: 'none', color: '#f87171', fontSize: '0.8rem', cursor: 'pointer', padding: '4px 8px', marginLeft: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Clear All
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Showing <strong style={{ color: 'white' }}>{sortedJobs.length}</strong> available roles</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Sort by:</span>
                <div style={{ position: 'relative' }}>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)} 
                    style={{ appearance: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 2rem 0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer', outline: 'none' }}
                  >
                    <option value="newest" style={{ background: 'var(--color-surface)' }}>Newest First</option>
                    <option value="oldest" style={{ background: 'var(--color-surface)' }}>Oldest First</option>
                    <option value="salary_high" style={{ background: 'var(--color-surface)' }}>Salary (High to Low)</option>
                    <option value="salary_low" style={{ background: 'var(--color-surface)' }}>Salary (Low to High)</option>
                  </select>
                  <ChevronDown size={14} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[1,2,3,4,5].map(i => <SkeletonJobCard key={i} />)}
              </div>
            ) : error ? (
              <div className="glass" style={{ padding: '40px', textAlign: 'center', border: '1px solid rgba(248, 113, 113, 0.3)', borderRadius: '16px' }}>
                <p style={{ color: '#f87171' }}>{error}</p>
                <button className="btn btn-outline" style={{ marginTop: '1rem', borderColor: 'rgba(248, 113, 113, 0.5)', color: '#f87171' }} onClick={() => window.location.reload()}>Retry</button>
              </div>
            ) : sortedJobs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <AnimatePresence>
                  {sortedJobs.map((job, idx) => (
                    <motion.div 
                      key={job.id} 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                    >
                      <JobCard job={job} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ padding: '80px 40px', textAlign: 'center', borderRadius: '24px' }}>
                <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                  <Briefcase size={36} style={{ color: '#64748b' }} />
                </div>
                <h3 style={{ marginBottom: '12px', fontSize: '1.6rem', color: 'white' }}>No exact matches found</h3>
                <p style={{ color: '#94a3b8', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px auto', lineHeight: 1.6 }}>
                  We couldn't find any job openings matching all your current filter settings. Try broadening your search.
                </p>
                <button className="btn btn-primary" onClick={handleResetFilters} style={{ padding: '0.8rem 2rem', borderRadius: '12px' }}>
                  Clear All Filters
                </button>
              </motion.div>
            )}
          </main>
        </div>
      </div>
      <style>{`
        .filter-input-wrapper {
          display: flex;
          align-items: center;
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 0.75rem;
          border-radius: 12px;
          gap: 0.5rem;
          transition: all 0.2s;
        }
        .filter-input-wrapper:focus-within {
          border-color: rgba(129, 140, 248, 0.4);
          box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.08);
        }
        .filter-input {
          background: transparent;
          border: none;
          color: white;
          outline: none;
          width: 100%;
          font-family: inherit;
        }
        .filter-input::placeholder { color: #64748b; }
      `}</style>
    </div>
  );
}
