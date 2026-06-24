import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/glass_card.dart';
import '../data/purchase_models.dart';
import '../data/purchases_repository.dart';
import '../providers/purchases_provider.dart';

class CreatePurchaseOrderScreen extends ConsumerStatefulWidget {
  const CreatePurchaseOrderScreen({super.key});

  @override
  ConsumerState<CreatePurchaseOrderScreen> createState() => _CreatePurchaseOrderScreenState();
}

class _CreatePurchaseOrderScreenState extends ConsumerState<CreatePurchaseOrderScreen> {
  final _formKey = GlobalKey<FormState>();
  Supplier? _selectedSupplier;
  final _deliveryDateCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  final List<_LineEntry> _lines = [_LineEntry()];
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _deliveryDateCtrl.dispose(); _notesCtrl.dispose();
    for (final l in _lines) { l.dispose(); }
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    if (_selectedSupplier == null) { setState(() => _error = 'Please select a supplier'); return; }
    setState(() { _loading = true; _error = null; });
    try {
      final request = PurchaseOrderRequest(
        supplierId: _selectedSupplier!.id,
        expectedDeliveryDate: _deliveryDateCtrl.text.trim().isEmpty ? null : _deliveryDateCtrl.text.trim(),
        notes: _notesCtrl.text.trim().isEmpty ? null : _notesCtrl.text.trim(),
        lines: _lines.where((l) => l.itemIdCtrl.text.trim().isNotEmpty).map((l) => PurchaseOrderLineRequest(
          itemId: l.itemIdCtrl.text.trim(),
          quantity: int.tryParse(l.qtyCtrl.text) ?? 1,
          unitPrice: double.tryParse(l.priceCtrl.text) ?? 0,
        )).toList(),
      );
      await ref.read(purchasesRepositoryProvider).createPurchaseOrder(request);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: const Text('Purchase order created'),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ));
        context.pop();
      }
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final suppliersAsync = ref.watch(suppliersProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(onPressed: () => context.pop(), icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20)),
        title: Text('New Purchase Order', style: AppTextStyles.headingMd),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (_error != null) ...[
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.danger.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.danger.withOpacity(0.3)),
                  ),
                  child: Text(_error!, style: AppTextStyles.bodySm.copyWith(color: AppColors.dangerLight)),
                ),
                const SizedBox(height: 16),
              ],

              GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Supplier', style: AppTextStyles.headingMd),
                    const SizedBox(height: 14),
                    suppliersAsync.when(
                      loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
                      error: (e, _) => Text(e.toString(), style: AppTextStyles.bodySm.copyWith(color: AppColors.danger)),
                      data: (suppliers) => DropdownButtonFormField<Supplier>(
                        value: _selectedSupplier,
                        dropdownColor: context.colorSurface,
                        style: AppTextStyles.bodyMd,
                        decoration: const InputDecoration(labelText: 'Select Supplier *', prefixIcon: Icon(Icons.business_outlined)),
                        items: suppliers.map((s) => DropdownMenuItem(value: s, child: Text(s.name, style: AppTextStyles.bodyMd))).toList(),
                        onChanged: (v) => setState(() => _selectedSupplier = v),
                        validator: (_) => _selectedSupplier == null ? 'Required' : null,
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _deliveryDateCtrl, style: AppTextStyles.bodyMd,
                      decoration: const InputDecoration(labelText: 'Expected Delivery (YYYY-MM-DD)', prefixIcon: Icon(Icons.calendar_today_outlined)),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(children: [
                      Expanded(child: Text('Order Lines', style: AppTextStyles.headingMd)),
                      TextButton.icon(
                        onPressed: () => setState(() => _lines.add(_LineEntry())),
                        icon: const Icon(Icons.add_rounded, size: 18, color: AppColors.primary),
                        label: Text('Add Line', style: AppTextStyles.labelSm.copyWith(color: AppColors.primary)),
                      ),
                    ]),
                    const SizedBox(height: 12),
                    ...List.generate(_lines.length, (i) => _LineWidget(
                      entry: _lines[i], index: i,
                      onRemove: _lines.length > 1 ? () => setState(() { _lines[i].dispose(); _lines.removeAt(i); }) : null,
                    )),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              GlassCard(
                child: TextFormField(
                  controller: _notesCtrl, maxLines: 3, style: AppTextStyles.bodyMd,
                  decoration: const InputDecoration(
                    labelText: 'Notes (optional)', alignLabelWithHint: true,
                    prefixIcon: Padding(padding: EdgeInsets.only(bottom: 40), child: Icon(Icons.notes_rounded)),
                    border: InputBorder.none, enabledBorder: InputBorder.none, focusedBorder: InputBorder.none,
                  ),
                ),
              ),

              const SizedBox(height: 28),

              SizedBox(
                width: double.infinity, height: 52,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: _loading ? null : AppColors.gradientPrimary,
                    color: _loading ? AppColors.primary.withOpacity(0.4) : null,
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: _loading ? null : AppColors.shadowMdDark,
                  ),
                  child: ElevatedButton(
                    onPressed: _loading ? null : _submit,
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent, shadowColor: Colors.transparent, disabledBackgroundColor: Colors.transparent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                    child: _loading
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : Text('Create Purchase Order', style: AppTextStyles.button.copyWith(color: Colors.white)),
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

class _LineEntry {
  final itemIdCtrl = TextEditingController();
  final qtyCtrl = TextEditingController(text: '1');
  final priceCtrl = TextEditingController();
  void dispose() { itemIdCtrl.dispose(); qtyCtrl.dispose(); priceCtrl.dispose(); }
}

class _LineWidget extends StatelessWidget {
  final _LineEntry entry;
  final int index;
  final VoidCallback? onRemove;

  const _LineWidget({required this.entry, required this.index, this.onRemove});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: context.colorSurfaceAlt,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: context.colorBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Text('Line ${index + 1}', style: AppTextStyles.labelSm.copyWith(color: context.colorTextSubtle)),
            const Spacer(),
            if (onRemove != null)
              GestureDetector(onTap: onRemove, child: const Icon(Icons.remove_circle_outline_rounded, size: 18, color: AppColors.danger)),
          ]),
          const SizedBox(height: 10),
          TextFormField(
            controller: entry.itemIdCtrl, style: AppTextStyles.bodyMd,
            decoration: const InputDecoration(labelText: 'Item ID *', prefixIcon: Icon(Icons.inventory_2_outlined)),
            validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
          ),
          const SizedBox(height: 10),
          Row(children: [
            Expanded(child: TextFormField(controller: entry.qtyCtrl, keyboardType: TextInputType.number, style: AppTextStyles.bodyMd,
                decoration: const InputDecoration(labelText: 'Qty *', prefixIcon: Icon(Icons.numbers_rounded)),
                validator: (v) { if (v == null || v.isEmpty) return 'Required'; if (int.tryParse(v) == null || int.parse(v) < 1) return 'Invalid'; return null; })),
            const SizedBox(width: 10),
            Expanded(child: TextFormField(controller: entry.priceCtrl, keyboardType: TextInputType.number, style: AppTextStyles.bodyMd,
                decoration: const InputDecoration(labelText: 'Unit Price *', prefixIcon: Icon(Icons.attach_money_rounded)),
                validator: (v) { if (v == null || v.isEmpty) return 'Required'; if (double.tryParse(v) == null) return 'Invalid'; return null; })),
          ]),
        ],
      ),
    );
  }
}
