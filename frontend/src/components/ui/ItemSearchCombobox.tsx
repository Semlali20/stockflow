import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Package, ChevronDown, Check } from 'lucide-react';

interface Item {
  id: string;
  name: string;
  sku: string;
  categoryId?: string;
  categoryName?: string;
  unitCost?: number;
  [key: string]: any;
}

interface ItemSearchComboboxProps {
  items: Item[];
  value: string;
  onChange: (item: Item | null) => void;
  placeholder?: string;
  categoryFilter?: string;
  disabled?: boolean;
  className?: string;
}

const CAT_COLORS = [
  { bg: '#EEF2FF', text: '#4F46E5', dot: '#6366F1' },
  { bg: '#FDF4FF', text: '#9333EA', dot: '#A855F7' },
  { bg: '#FFF7ED', text: '#EA580C', dot: '#F97316' },
  { bg: '#F0FDF4', text: '#16A34A', dot: '#22C55E' },
  { bg: '#FFF1F2', text: '#E11D48', dot: '#F43F5E' },
  { bg: '#F0F9FF', text: '#0284C7', dot: '#0EA5E9' },
  { bg: '#FEFCE8', text: '#CA8A04', dot: '#EAB308' },
  { bg: '#F7FEE7', text: '#65A30D', dot: '#84CC16' },
  { bg: '#FFF5F5', text: '#DC2626', dot: '#EF4444' },
  { bg: '#F5F3FF', text: '#7C3AED', dot: '#8B5CF6' },
];

function getCatColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return CAT_COLORS[Math.abs(hash) % CAT_COLORS.length];
}

export const ItemSearchCombobox: React.FC<ItemSearchComboboxProps> = ({
  items,
  value,
  onChange,
  placeholder = 'Choose an item…',
  categoryFilter,
  disabled = false,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [hovered, setHovered] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedItem = items.find(it => it.id === value) || null;

  const results = useCallback(() => {
    const base = categoryFilter ? items.filter(it => it.categoryId === categoryFilter) : items;
    if (!query.trim()) return base.slice(0, 100);
    const q = query.toLowerCase();
    return base.filter(it =>
      it.name.toLowerCase().includes(q) ||
      it.sku.toLowerCase().includes(q) ||
      (it.categoryName || '').toLowerCase().includes(q)
    ).slice(0, 100);
  }, [items, query, categoryFilter])();

  useEffect(() => {
    if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 60); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [open]);

  const select = (item: Item) => { onChange(item); setOpen(false); };
  const clear = (e: React.MouseEvent) => { e.stopPropagation(); onChange(null); };

  const selColor = selectedItem?.categoryId ? getCatColor(selectedItem.categoryId) : null;

  return (
    <>
      {/* ── Trigger ── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(true)}
        className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left border transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' :
          selectedItem ? 'border-indigo-200 cursor-pointer hover:border-indigo-400' :
          'border-gray-200 bg-white cursor-pointer hover:border-indigo-300'
        } ${className}`}
        style={selectedItem && selColor ? { background: selColor.bg } : {}}
      >
        {selectedItem ? (
          <>
            <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: selColor?.dot, opacity: 0.15 + 0.85 }}>
              <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: selColor?.dot + '22' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: selColor?.dot }} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate" style={{ color: selColor?.text }}>{selectedItem.name}</p>
              <p className="text-[10px] font-mono text-gray-400">{selectedItem.sku}</p>
            </div>
            <span onMouseDown={clear} className="p-1 rounded-md hover:bg-red-100 text-gray-300 hover:text-red-500 transition-colors">
              <X size={10} />
            </span>
          </>
        ) : (
          <>
            <Search size={11} className="text-gray-400 shrink-0" />
            <span className="flex-1 text-[11px] text-gray-400">{placeholder}</span>
            <ChevronDown size={10} className="text-gray-300 shrink-0" />
          </>
        )}
      </button>

      {/* ── Modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(8,8,24,0.6)', backdropFilter: 'blur(6px)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full flex flex-col overflow-hidden"
            style={{
              maxWidth: 560,
              maxHeight: '82vh',
              borderRadius: 20,
              background: '#fff',
              boxShadow: '0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(99,102,241,0.12)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* gradient top bar */}
            <div style={{ height: 4, background: 'linear-gradient(90deg,#6366F1,#8B5CF6,#EC4899)', borderRadius: '20px 20px 0 0' }} />

            {/* ── Header ── */}
            <div className="px-5 pt-4 pb-3">
              <div className="flex items-center gap-3 mb-4">
                <div style={{
                  width: 38, height: 38, borderRadius: 12,
                  background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.35)'
                }}>
                  <Package size={17} color="#fff" />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111', margin: 0, lineHeight: 1.2 }}>Select Item</h3>
                  <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>
                    <span style={{ color: '#6366F1', fontWeight: 600 }}>{items.length}</span> items available
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    marginLeft: 'auto', width: 30, height: 30, borderRadius: 10,
                    border: '1px solid #E5E7EB', background: '#F9FAFB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#9CA3AF'
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Search bar */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#F8F7FF', border: '2px solid transparent',
                borderRadius: 14, padding: '10px 14px',
                boxShadow: '0 0 0 0 transparent',
                transition: 'all 0.15s',
              }}
                onFocus={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.border = '2px solid #6366F1';
                  el.style.background = '#fff';
                  el.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.12)';
                }}
                onBlur={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.border = '2px solid transparent';
                  el.style.background = '#F8F7FF';
                  el.style.boxShadow = 'none';
                }}
              >
                <Search size={16} color="#6366F1" style={{ flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search by name, SKU or category…"
                  style={{
                    flex: 1, border: 'none', background: 'transparent',
                    fontSize: 14, color: '#111', outline: 'none',
                  }}
                />
                {query ? (
                  <button onClick={() => setQuery('')} style={{ color: '#D1D5DB', cursor: 'pointer', border: 'none', background: 'none', padding: 2 }}>
                    <X size={14} />
                  </button>
                ) : (
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: '#9CA3AF',
                    background: '#E5E7EB', borderRadius: 6, padding: '2px 6px', letterSpacing: 0.5
                  }}>ESC</div>
                )}
              </div>
            </div>


            {/* ── Results meta ── */}
            <div style={{ padding: '8px 20px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>
                {results.length === 0 ? 'No results' : (
                  <>{results.length}{results.length === 100 ? '+' : ''} result{results.length !== 1 ? 's' : ''}
                    {query && <span style={{ color: '#6366F1', marginLeft: 4 }}>for "{query}"</span>}
                  </>
                )}
              </span>
              {selectedItem && (
                <span style={{ fontSize: 11, color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={11} /> {selectedItem.name}
                </span>
              )}
            </div>

            {/* ── Items list ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 12px' }}>
              {results.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 8 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={24} color="#D1D5DB" />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#6B7280', margin: 0 }}>No items found</p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>Try a different search or category</p>
                </div>
              ) : (
                results.map(item => {
                  const isSel = item.id === value;
                  const isHov = hovered === item.id;
                  const c = item.categoryId ? getCatColor(item.categoryId) : null;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => select(item)}
                      onMouseEnter={() => setHovered(item.id)}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 12px', borderRadius: 12, border: 'none',
                        textAlign: 'left', cursor: 'pointer', transition: 'all 0.12s',
                        marginBottom: 2,
                        background: isSel
                          ? 'linear-gradient(135deg, #EEF2FF, #F5F3FF)'
                          : isHov ? '#F8F7FF' : 'transparent',
                        boxShadow: isSel
                          ? '0 2px 8px rgba(99,102,241,0.12), inset 0 0 0 1.5px rgba(99,102,241,0.25)'
                          : isHov ? 'inset 0 0 0 1px #E0E7FF' : 'none',
                        transform: isHov && !isSel ? 'translateX(3px)' : 'none',
                      }}
                    >
                      {/* Color dot / icon */}
                      <div style={{
                        width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isSel
                          ? 'linear-gradient(135deg,#6366F1,#8B5CF6)'
                          : c ? c.bg : '#F3F4F6',
                        boxShadow: isSel ? '0 4px 12px rgba(99,102,241,0.35)' : 'none',
                        transition: 'all 0.12s',
                      }}>
                        {isSel
                          ? <Check size={16} color="#fff" />
                          : c
                            ? <div style={{ width: 12, height: 12, borderRadius: '50%', background: c.dot, opacity: isHov ? 1 : 0.7 }} />
                            : <Package size={15} color="#9CA3AF" />
                        }
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          margin: 0, fontSize: 13, fontWeight: 700, lineHeight: 1.3,
                          color: isSel ? '#4F46E5' : '#111',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                          {item.name}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                          <span style={{
                            fontSize: 10, fontFamily: 'monospace', fontWeight: 700,
                            color: isSel ? '#6366F1' : '#9CA3AF',
                            background: isSel ? '#EEF2FF' : '#F3F4F6',
                            padding: '1px 6px', borderRadius: 5,
                          }}>
                            {item.sku}
                          </span>
                          {item.categoryName && c && (
                            <span style={{
                              fontSize: 10, fontWeight: 600,
                              color: isSel ? '#818CF8' : c.text,
                              background: isSel ? '#EEF2FF' : c.bg,
                              padding: '1px 6px', borderRadius: 5,
                            }}>
                              {item.categoryName}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      {item.unitCost != null && item.unitCost > 0 && (
                        <span style={{
                          fontSize: 14, fontWeight: 800, flexShrink: 0,
                          color: isSel ? '#6366F1' : isHov ? '#4F46E5' : '#374151',
                          transition: 'color 0.12s',
                        }}>
                          {item.unitCost.toFixed(2)}
                        </span>
                      )}

                      {/* Check or arrow */}
                      <div style={{
                        width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isSel ? '#6366F1' : isHov ? '#EEF2FF' : 'transparent',
                        transition: 'all 0.12s',
                      }}>
                        {isSel
                          ? <Check size={12} color="#fff" />
                          : <Check size={10} color={isHov ? '#6366F1' : 'transparent'} />
                        }
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* ── Footer ── */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 20px', borderTop: '1px solid #F3F4F6',
              background: '#FAFAFA',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, color: '#D1D5DB' }}>↑↓ navigate</span>
                <span style={{ fontSize: 11, color: '#D1D5DB' }}>↵ select</span>
                <span style={{ fontSize: 11, color: '#D1D5DB' }}>ESC close</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  padding: '6px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                  border: '1.5px solid #E5E7EB', background: '#fff',
                  color: '#6B7280', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
