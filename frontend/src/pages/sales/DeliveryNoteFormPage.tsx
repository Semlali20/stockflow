// src/pages/sales/DeliveryNoteFormPage.tsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, Link, PenLine } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { salesService } from '@/services/sales.service';
import { inventoryService } from '@/services/inventory.service';
import { locationService } from '@/services/location.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Customer, Warehouse, Inventory, Quote } from '@/types';

interface DeliveryLine {
  itemId: string;
  itemName: string;
  itemSku: string;
  orderedQuantity: number;
  deliveredQuantity: number;
  availableQty?: number;
  lotId?: string;
  serialId?: string;
  notes: string;
  isManualRow?: boolean; // true = user typed item, false = from inventory or quote
}

export const DeliveryNoteFormPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Form fields
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [quoteId, setQuoteId] = useState('');
  const [quoteSearch, setQuoteSearch] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [inventoryId, setInventoryId] = useState('');

  // Data
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [inventoryItems, setInventoryItems] = useState<Inventory[]>([]);
  const [linkedQuote, setLinkedQuote] = useState<Quote | null>(null);
  const [linkedWarehouseName, setLinkedWarehouseName] = useState('');
  const [lines, setLines] = useState<DeliveryLine[]>([]);

  // When inventory items load (after quote link), resolve warehouse name from first item's warehouseId
  useEffect(() => {
    if (linkedQuote && inventoryItems.length > 0 && !linkedWarehouseName) {
      const wid = inventoryItems[0].warehouseId;
      if (wid) {
        const wh = warehouses.find(w => w.id === wid);
        if (wh) {
          setLinkedWarehouseName(wh.name);
        } else {
          locationService.getWarehouseById(wid)
            .then(w => setLinkedWarehouseName(w?.name || ''))
            .catch(() => {});
        }
      }
    }
  }, [inventoryItems]);

  // UI state
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isManualMode, setIsManualMode] = useState(true);
  const [useQuote, setUseQuote] = useState(false); // toggle: link to quote or not

  useEffect(() => {
    setLoadingCustomers(true);
    salesService.getCustomers({ size: 1000 })
      .then((res: any) => {
        const data = res.data;
        setCustomers(Array.isArray(data) ? data : (data?.content || []));
      })
      .catch(() => setCustomers([]))
      .finally(() => setLoadingCustomers(false));

    setLoadingWarehouses(true);
    locationService.getWarehouses({ size: 1000 })
      .then((data: any) => {
        setWarehouses(Array.isArray(data) ? data : (data?.content || []));
      })
      .catch(() => setWarehouses([]))
      .finally(() => setLoadingWarehouses(false));
  }, []);

  const loadInventoryItems = useCallback(async (warehouseId: string) => {
    if (!warehouseId) { setInventoryItems([]); return; }
    setLoadingItems(true);
    try {
      const data = await inventoryService.getInventoriesByWarehouse(warehouseId);
      setInventoryItems(Array.isArray(data) ? data : (data?.content || []));
    } catch {
      setInventoryItems([]);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  const handleWarehouseChange = (wid: string) => {
    setInventoryId(wid);
    loadInventoryItems(wid);
  };

  const linkQuote = async () => {
    if (!quoteSearch.trim()) return;
    setLoadingQuote(true);
    try {
      const res = await salesService.getQuotes({ size: 200 });
      const data = (res as any).data;
      const all: Quote[] = Array.isArray(data) ? data : (data?.content || []);
      const found = all.find(q =>
        q.reference.toLowerCase().includes(quoteSearch.toLowerCase()) ||
        q.id === quoteSearch
      );
      if (!found) { toast.error(t('deliveryForm.quoteNotFound')); return; }
      if (found.status !== 'ACCEPTED') { toast.error(t('deliveryForm.quoteNotAccepted')); return; }

      setLinkedQuote(found);
      setQuoteId(found.id);
      setCustomerId(found.customerId);
      setCustomerName(found.customerName);
      // Auto-set warehouse from quote if present
      if (found.inventoryId) {
        setInventoryId(found.inventoryId);
        loadInventoryItems(found.inventoryId);
        // warehouse name resolved reactively via useEffect on inventoryItems
        const local = warehouses.find(w => w.id === found.inventoryId);
        if (local) setLinkedWarehouseName(local.name);
      }
      setLines(found.lines.map(l => ({
        itemId: l.itemId,
        itemName: l.itemName,
        itemSku: l.itemSku || '',
        orderedQuantity: l.quantity,
        deliveredQuantity: l.quantity,
        notes: '',
        isManualRow: false,
      })));
      setIsManualMode(false);
      toast.success(t('deliveryForm.quoteLinkSuccess'));
    } catch {
      toast.error(t('deliveryForm.quoteLinkError'));
    } finally {
      setLoadingQuote(false);
    }
  };

  const unlinkQuote = () => {
    setLinkedQuote(null);
    setQuoteId('');
    setQuoteSearch('');
    setInventoryId('');
    setInventoryItems([]);
    setLinkedWarehouseName('');
    setLines([]);
    setIsManualMode(true);
  };

  const handleToggleQuote = (enabled: boolean) => {
    setUseQuote(enabled);
    if (!enabled) unlinkQuote();
  };

  /** Add item from inventory panel (manual mode only) */
  const addInventoryItem = (inv: Inventory) => {
    const already = lines.find(l => l.itemId === inv.itemId);
    if (already) { toast.error(t('quoteForm.itemAlreadyAdded')); return; }
    setLines(prev => [...prev, {
      itemId: inv.itemId,
      itemName: (inv as any).itemName || inv.item?.name || inv.itemId,
      itemSku: (inv as any).itemSku || inv.item?.sku || '',
      orderedQuantity: 1,
      deliveredQuantity: 1,
      availableQty: inv.quantityAvailable,
      notes: '',
      isManualRow: false,
    }]);
  };

  /** Add a blank manually-typed row (manual mode only, no quote required) */
  const addManualLine = () => {
    setLines(prev => [...prev, {
      itemId: `manual-${Date.now()}`,
      itemName: '',
      itemSku: '',
      orderedQuantity: 1,
      deliveredQuantity: 1,
      notes: '',
      isManualRow: true,
    }]);
  };

  const updateLine = (idx: number, field: keyof DeliveryLine, value: any) => {
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  };

  const removeLine = (idx: number) => setLines(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!customerId) { toast.error(t('quoteForm.selectCustomer')); return; }
    if (lines.length === 0) { toast.error(t('quoteForm.addItems')); return; }
    setSaving(true);
    try {
      await salesService.createDeliveryNote({
        customerId,
        customerName,
        quoteId: quoteId || undefined,
        inventoryId: inventoryId || undefined,
        deliveryDate: deliveryDate || undefined,
        deliveryAddress,
        notes,
        lines: lines.map(l => ({
          itemId: l.isManualRow ? undefined : l.itemId,
          itemName: l.itemName,
          itemSku: l.itemSku,
          orderedQuantity: l.orderedQuantity,
          deliveredQuantity: l.deliveredQuantity,
          lotId: l.lotId,
          serialId: l.serialId,
          notes: l.notes,
        })),
      });
      toast.success(t('sales.deliveryNotes.created'));
      navigate('/sales/delivery-notes');
    } catch {
      toast.error(t('sales.deliveryNotes.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/sales/delivery-notes')} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('deliveryForm.title')}</h1>
            <p className="text-gray-500 text-sm">{t('deliveryForm.subtitle')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button icon={<Save size={16} />} onClick={handleSave} loading={saving} disabled={saving}>
            {t('deliveryForm.save')}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Step 1 — Quote Toggle */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link size={18} className="text-gray-500" />
              <div>
                <h2 className="text-base font-semibold text-gray-800">{t('deliveryForm.linkQuote')}</h2>
                <p className="text-xs text-gray-400">{t('deliveryForm.linkHint')}</p>
              </div>
            </div>
            {/* iOS-style toggle switch */}
            <button
              type="button"
              onClick={() => handleToggleQuote(!useQuote)}
              className={`relative inline-flex h-7 w-13 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                useQuote ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              style={{ width: '52px', height: '28px' }}
              aria-label={t('deliveryForm.linkQuote')}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                  useQuote ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Quote search — shown only when toggle is ON */}
          {useQuote && (
            <div className="mt-4">
              {linkedQuote ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                  <div>
                    <span className="font-medium text-green-800">{linkedQuote.reference}</span>
                    <span className="text-sm text-green-600 ml-2">— {linkedQuote.customerName}</span>
                    <span className="ml-3 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      {t('deliveryForm.autoLoadedItems', { count: lines.length })}
                    </span>
                  </div>
                  <button onClick={unlinkQuote} className="text-red-500 hover:text-red-700 text-sm font-medium">
                    {t('deliveryForm.unlinkQuote')}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder={t('deliveryForm.searchQuotePlaceholder')}
                    value={quoteSearch}
                    onChange={e => setQuoteSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && linkQuote()}
                    className="flex-1"
                    autoFocus
                  />
                  <Button variant="outline" onClick={linkQuote} loading={loadingQuote}>
                    {t('deliveryForm.linkButton')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2 — Basic Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">{t('quoteForm.basicInfo')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Customer — select dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('sales.deliveryNotes.customer')} *
              </label>
              {linkedQuote ? (
                <div className="flex items-center gap-2 border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-700">
                  <span>{customerName}</span>
                  <span className="text-xs text-gray-400 ml-auto">{t('deliveryForm.lockedByQuote')}</span>
                </div>
              ) : (
                <Select
                  value={customerId}
                  onChange={e => {
                    const c = customers.find(c => c.id === e.target.value);
                    setCustomerId(e.target.value);
                    setCustomerName(c?.name || '');
                  }}
                  className="w-full"
                  disabled={loadingCustomers}
                >
                  <option value="">{t('sales.quotes.selectCustomer')}</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              )}
            </div>

            {/* Delivery Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('sales.deliveryNotes.deliveryDate')}
              </label>
              <Input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
            </div>

            {/* Inventory Dropdown — ACTIVE when no quote, locked when quote linked */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('quoteForm.warehouse')}
              </label>
              {linkedQuote ? (
                <div className="flex items-center gap-2 border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-700">
                  <span>{linkedWarehouseName || '—'}</span>
                  <span className="text-xs text-amber-500 ml-auto">{t('deliveryForm.lockedByQuote')}</span>
                </div>
              ) : (
                <Select
                  value={inventoryId}
                  onChange={e => handleWarehouseChange(e.target.value)}
                  className="w-full"
                  disabled={loadingWarehouses}
                >
                  <option value="">{t('quoteForm.selectWarehouse')}</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </Select>
              )}
            </div>

            {/* Delivery Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('sales.deliveryNotes.deliveryAddress')}
              </label>
              <Input
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                placeholder={t('deliveryForm.addressPlaceholder')}
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.notes')}</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Step 3 — Inventory Items Panel (manual mode + warehouse selected) */}
        {isManualMode && inventoryId && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">{t('quoteForm.availableItems')}</h2>
            {loadingItems ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : inventoryItems.length === 0 ? (
              <p className="text-gray-400 text-center py-4 text-sm">{t('quoteForm.noInventoryItems')}</p>
            ) : (
              <div className="overflow-x-auto max-h-48 overflow-y-auto">
                <table className="min-w-full text-sm divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('quoteForm.item')}</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('quoteForm.availableQty')}</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inventoryItems.map(inv => {
                      const isAdded = lines.some(l => l.itemId === inv.itemId);
                      return (
                        <tr key={inv.id} className={isAdded ? 'bg-green-50' : 'hover:bg-gray-50'}>
                          <td className="px-3 py-2">
                            <div className="font-medium">{(inv as any).itemName || inv.item?.name || inv.itemId}</div>
                            <div className="text-xs text-gray-400">{(inv as any).itemSku || inv.item?.sku}</div>
                          </td>
                          <td className="px-3 py-2 font-medium">
                            <span className={inv.quantityAvailable <= 0 ? 'text-red-500' : 'text-green-600'}>
                              {inv.quantityAvailable}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            {isAdded ? (
                              <span className="text-xs text-green-600">{t('quoteForm.added')}</span>
                            ) : (
                              <button
                                onClick={() => addInventoryItem(inv)}
                                disabled={inv.quantityAvailable <= 0}
                                className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                                title={t('common.add')}
                              >
                                <Plus size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Step 4 — Delivery Lines */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('deliveryForm.deliveryLines')}</h2>
            {/* Manual entry button — only available when NO quote is linked */}
            {isManualMode && (
              <Button
                variant="outline"
                size="sm"
                icon={<PenLine size={15} />}
                onClick={addManualLine}
              >
                {t('deliveryForm.addItemManually')}
              </Button>
            )}
          </div>

          {lines.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm mb-3">{t('quoteForm.noLines')}</p>
              {isManualMode && (
                <p className="text-xs text-gray-400">
                  {inventoryId
                    ? t('deliveryForm.hintSelectFromAbove')
                    : t('deliveryForm.hintManualOrInventory')}
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('quoteForm.item')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('deliveryForm.orderedQty')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('deliveryForm.deliveredQty')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('common.notes')}</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lines.map((line, idx) => (
                    <tr key={idx} className={line.isManualRow ? 'bg-yellow-50' : ''}>
                      <td className="px-3 py-2">
                        {line.isManualRow ? (
                          // Editable item name/sku for manually-typed rows
                          <div className="space-y-1">
                            <Input
                              value={line.itemName}
                              onChange={e => updateLine(idx, 'itemName', e.target.value)}
                              placeholder={t('deliveryForm.itemNamePlaceholder')}
                              className="text-sm font-medium"
                            />
                            <Input
                              value={line.itemSku}
                              onChange={e => updateLine(idx, 'itemSku', e.target.value)}
                              placeholder={t('deliveryForm.itemSkuPlaceholder')}
                              className="text-xs text-gray-400"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium">{line.itemName}</div>
                            <div className="text-xs text-gray-400">{line.itemSku}</div>
                            {line.availableQty !== undefined && (
                              <div className="text-xs text-gray-400">
                                {t('quoteForm.availableQty')}: {line.availableQty}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 w-28">
                        <Input
                          type="number"
                          min="1"
                          value={line.orderedQuantity}
                          onChange={e => updateLine(idx, 'orderedQuantity', Number(e.target.value))}
                          className="w-20 text-sm"
                          disabled={!!linkedQuote} // locked when quote is linked
                        />
                      </td>
                      <td className="px-3 py-2 w-28">
                        <Input
                          type="number"
                          min="0"
                          max={line.orderedQuantity}
                          value={line.deliveredQuantity}
                          onChange={e => updateLine(idx, 'deliveredQuantity', Number(e.target.value))}
                          className="w-20 text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          value={line.notes}
                          onChange={e => updateLine(idx, 'notes', e.target.value)}
                          className="text-sm"
                          placeholder={t('deliveryForm.lineNotesPlaceholder')}
                        />
                      </td>
                      <td className="px-3 py-2">
                        {/* Delete only available in manual mode (no quote linked) */}
                        {isManualMode && (
                          <button onClick={() => removeLine(idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryNoteFormPage;
