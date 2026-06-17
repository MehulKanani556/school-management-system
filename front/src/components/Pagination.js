import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage, 
  totalItems 
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end === totalPages) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  const btnClass = (active) => `
    flex items-center justify-center min-w-[40px] h-[40px] rounded-md text-sm font-black transition-all duration-300
    ${active 
      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-110 z-10' 
      : 'bg-brand-surface/40 hover:bg-slate-800 text-slate-400 hover:text-white border border-brand-border/30'}
    disabled:opacity-30 disabled:hover:bg-brand-surface/40 disabled:hover:text-slate-400 disabled:cursor-not-allowed
  `;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-8 px-2">
      <div className="flex flex-col gap-1 items-center sm:items-start text-center sm:text-left">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-outfit">
          Page {currentPage} of {totalPages}
        </p>
        <p className="text-xs font-bold text-slate-400">
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => onPageChange(1)} 
          disabled={currentPage === 1}
          className={btnClass(false)}
          title="First Page"
        >
          <ChevronsLeft size={18} />
        </button>
        
        <button 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
          className={btnClass(false)}
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-2 px-2">
          {getPageNumbers().map(num => (
            <button
              key={num}
              onClick={() => onPageChange(num)}
              className={btnClass(currentPage === num)}
            >
              {num}
            </button>
          ))}
        </div>

        <button 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
          className={btnClass(false)}
        >
          <ChevronRight size={18} />
        </button>

        <button 
          onClick={() => onPageChange(totalPages)} 
          disabled={currentPage === totalPages}
          className={btnClass(false)}
          title="Last Page"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
