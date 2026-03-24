// src/pages/sales/QuoteFormPage.tsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Send, ArrowLeft, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { salesService } from '@/services/sales.service';
import { inventoryService } from '@/services/inventory.service';
import { locationService } from '@/services/location.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Customer, Warehouse, Inventory } from '@/types';

interface QuoteLine {
  itemId: string;
  itemName: string;
  itemSku: string;
  availableQty: number;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  totalPrice: number;
  notes: string;
}

export const QuoteFormPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Form fields
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [notes, setNotes] = useState('');
  const [inventoryId, setInventoryId] = useState('');

  // Data
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [inventoryItems, setInventoryItems] = useState<Inventory[]>([]);
  const [lines, setLines] = useState<QuoteLine[]>([]);

  // UI state
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [saving, setSaving] = useState(false);

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
      toast.error(t('quoteForm.errorLoadingItems'));
    } finally {
      setLoadingItems(false);
    }
  }, [t]);

  const handleWarehouseChange = (warehouseId: string) => {
    setInventoryId(warehouseId);
    setLines([]);
    loadInventoryItems(warehouseId);
  };

  const addItem = (inv: Inventory) => {
    const already = lines.find(l => l.itemId === inv.itemId);
    if (already) { toast.error(t('quoteForm.itemAlreadyAdded')); return; }
    const newLine: QuoteLine = {
      itemId: inv.itemId,
      itemName: (inv as any).itemName || inv.item?.name || inv.itemId,
      itemSku: (inv as any).itemSku || inv.item?.sku || '',
      availableQty: inv.quantityAvailable,
      quantity: 1,
      unitPrice: inv.unitCost || 0,
      discountPercent: 0,
      totalPrice: inv.unitCost || 0,
      notes: '',
    };
    setLines(prev => [...prev, newLine]);
  };

  const updateLine = (idx: number, field: keyof QuoteLine, value: any) => {
    setLines(prev => prev.map((l, i) => {
      if (i !== idx) return l;
      const updated = { ...l, [field]: value };
      const qty = field === 'quantity' ? Number(value) : Number(updated.quantity);
      const price = field === 'unitPrice' ? Number(value) : Number(updated.unitPrice);
      const disc = field === 'discountPercent' ? Number(value) : Number(updated.discountPercent);
      const gross = qty * price;
      updated.totalPrice = gross - (gross * disc / 100);
      return updated;
    }));
  };

  const removeLine = (idx: number) => setLines(prev => prev.filter((_, i) => i !== idx));

  const subtotal = lines.reduce((s, l) => s + l.totalPrice, 0);
  const totalDiscount = subtotal * discountPercent / 100;
  const total = subtotal - totalDiscount;

  const buildPayload = () => ({
    customerId,
    customerName,
    validUntil: validUntil || undefined,
    discountPercent,
    notes,
    inventoryId,
    lines: lines.map(l => ({
      itemId: l.itemId,
      itemName: l.itemName,
      itemSku: l.itemSku,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      discountPercent: l.discountPercent,
      notes: l.notes,
    })),
  });

  const handleSaveDraft = async () => {
    if (!customerId) { toast.error(t('quoteForm.selectCustomer')); return; }
    if (lines.length === 0) { toast.error(t('quoteForm.addItems')); return; }
    setSaving(true);
    try {
      await salesService.createQuote(buildPayload());
      toast.success(t('sales.quotes.created'));
      navigate('/sales/quotes');
    } catch {
      toast.error(t('sales.quotes.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleSendQuote = async () => {
    if (!customerId) { toast.error(t('quoteForm.selectCustomer')); return; }
    if (lines.length === 0) { toast.error(t('quoteForm.addItems')); return; }
    setSaving(true);
    try {
      const created: any = await salesService.createQuote(buildPayload());
      const quoteId = created?.data?.id || created?.id;
      if (quoteId) await salesService.sendQuote(quoteId);
      toast.success(t('sales.quotes.sent'));
      navigate('/sales/quotes');
    } catch {
      toast.error(t('sales.quotes.actionFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/sales/quotes')} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('quoteForm.title')}</h1>
            <p className="text-gray-500 text-sm">{t('quoteForm.subtitle')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button icon={<Send size={16} />} onClick={handleSendQuote} loading={saving} disabled={saving}>
            {t('quoteForm.sendQuote')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">{t('quoteForm.basicInfo')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('sales.quotes.customer')} *</label>
                <Select
                  value={customerId}
                  onChange={e => {
                    setCustomerId(e.target.value);
                    const c = customers.find(c => c.id === e.target.value);
                    setCustomerName(c?.name || '');
                  }}
                  className="w-full"
                  disabled={loadingCustomers}
                >
                  <option value="">{t('sales.quotes.selectCustomer')}</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('sales.quotes.validUntil')}</label>
                <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('sales.quotes.discount')}</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={discountPercent}
                  onChange={e => setDiscountPercent(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('quoteForm.warehouse')}</label>
                <Select
                  value={inventoryId}
                  onChange={e => handleWarehouseChange(e.target.value)}
                  className="w-full"
                  disabled={loadingWarehouses}
                >
                  <option value="">{t('quoteForm.selectWarehouse')}</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.notes')}</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('quoteForm.notesPlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* Inventory Items Selection */}
          {inventoryId && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package size={18} />
                {t('quoteForm.availableItems')}
              </h2>
              {loadingItems ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : inventoryItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">{t('quoteForm.noItemsInWarehouse')}</p>
              ) : (
                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('quoteForm.item')}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('quoteForm.availableQty')}</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('common.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {inventoryItems.map(inv => {
                        const isAdded = lines.some(l => l.itemId === inv.itemId);
                        return (
                          <tr key={inv.id} className={isAdded ? 'bg-green-50' : 'hover:bg-gray-50'}>
                            <td className="px-3 py-2">
                              <div className="font-medium">{(inv as any).itemName || inv.item?.name || inv.itemId}</div>
                              <div className="text-xs text-gray-400">{(inv as any).itemSku || inv.item?.sku}</div>
                            </td>
                            <td className="px-3 py-2">
                              <span className={`font-medium ${inv.quantityAvailable <= 0 ? 'text-red-600' : 'text-green-700'}`}>
                                {inv.quantityAvailable}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right">
                              {isAdded ? (
                                <span className="text-xs text-green-600 font-medium">{t('quoteForm.added')}</span>
                              ) : (
                                <button
                                  onClick={() => addItem(inv)}
                                  disabled={inv.quantityAvailable <= 0}
                                  className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
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

          {/* Quote Lines */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">{t('quoteForm.quoteLines')}</h2>
            {lines.length === 0 ? (
              <p className="text-gray-400 text-center py-6 text-sm">{t('quoteForm.noLines')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('quoteForm.item')}</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('sales.quotes.qty')}</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('quoteForm.unitPrice')}</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('sales.quotes.discountPct')}</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('sales.quotes.lineTotal')}</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lines.map((line, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2">
                          <div className="font-medium">{line.itemName}</div>
                          <div className="text-xs text-gray-400">{line.itemSku}</div>
                          <div className="text-xs text-gray-400">{t('quoteForm.avail')}: {line.availableQty}</div>
                        </td>
                        <td className="px-3 py-2 w-24">
                          <Input
                            type="number"
                            min="1"
                            max={line.availableQty}
                            value={line.quantity}
                            onChange={e => updateLine(idx, 'quantity', e.target.value)}
                            className={`w-20 text-sm ${line.quantity > line.availableQty ? 'border-red-500' : ''}`}
                          />
                          {line.quantity > line.availableQty && (
                            <p className="text-red-500 text-xs mt-1">{t('quoteForm.exceedsStock')}</p>
                          )}
                        </td>
                        <td className="px-3 py-2 w-28">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.unitPrice}
                            onChange={e => updateLine(idx, 'unitPrice', e.target.value)}
                            className="w-24 text-sm"
                          />
                        </td>
                        <td className="px-3 py-2 w-24">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={line.discountPercent}
                            onChange={e => updateLine(idx, 'discountPercent', e.target.value)}
                            className="w-20 text-sm"
                          />
                        </td>
                        <td className="px-3 py-2 font-medium text-right">{line.totalPrice.toFixed(2)}</td>
                        <td className="px-3 py-2">
                          <button onClick={() => removeLine(idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Summary Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">{t('quoteForm.summary')}</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('sales.quotes.subtotal')}</span>
                <span className="font-medium">{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-orange-600">
                <span>{t('sales.quotes.discount')} ({discountPercent}%)</span>
                <span>-{totalDiscount.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-base font-bold">
                <span>{t('sales.quotes.total')}</span>
                <span className="text-blue-600">{total.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 text-xs text-gray-400">
                <p>{t('quoteForm.linesCount', { count: lines.length })}</p>
                {lines.some(l => l.quantity > l.availableQty) && (
                  <p className="text-red-500 mt-1">{t('quoteForm.stockWarning')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteFormPage;
