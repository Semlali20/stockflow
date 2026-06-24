import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/glass_card.dart';
import '../data/sales_models.dart';
import '../data/sales_repository.dart';
import '../providers/sales_provider.dart';

class CreateQuoteScreen extends ConsumerStatefulWidget {
  const CreateQuoteScreen({super.key});

  @override
  ConsumerState<CreateQuoteScreen> createState() => _CreateQuoteScreenState();
}

class _CreateQuoteScreenState extends ConsumerState<CreateQuoteScreen> {
  final _formKey = GlobalKey<FormState>();
  Customer? _selectedCustomer;
  final _validUntilCtrl = TextEditingController();
  final _discountCtrl = TextEditingController(text: '0');
  final _notesCtrl = TextEditingController();
  final List<_QuoteLine> _lines = [_QuoteLine()];
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _validUntilCtrl.dispose(); _discountCtrl.dispose(); _notesCtrl.dispose();
    for (final l in _lines) { l.dispose(); }
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    if (_selectedCustomer == null) { setState(() => _error = 'Please select a customer'); return; }
    setState(() { _loading = true; _error = null; });
    try {
      final request = QuoteRequest(
        customerId: _selectedCustomer!.id,
        validUntil: _validUntilCtrl.text.trim().isEmpty ? null : _validUntilCtrl.text.trim(),
        notes: _notesCtrl.text.trim().isEmpty ? null : _notesCtrl.text.trim(),
        discountPercent: double.tryParse(_discountCtrl.text),
        lines: _lines.where((l) => l.itemIdCtrl.text.trim().isNotEmpty).map((l) => QuoteLineRequest(
          itemId: l.itemIdCtrl.text.trim(),
          quantity: int.tryParse(l.qtyCtrl.text) ?? 1,
          unitPrice: double.tryParse(l.priceCtrl.text) ?? 0,
          discountPercent: double.tryParse(l.discCtrl.text),
        )).toList(),
      );
      await ref.read(salesRepositoryProvider).createQuote(request);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: const Text('Quote created successfully'),
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
    final customersAsync = ref.watch(activeCustomersProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(onPressed: () => context.pop(), icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20)),
        title: Text('New Quote', style: AppTextStyles.headingMd),
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
                    Text('Customer', style: AppTextStyles.headingMd),
                    const SizedBox(height: 14),
                    customersAsync.when(
                      loading: () => const Center(child: CircularProgressIndicator(color: AppColors.teal)),
                      error: (e, _) => Text(e.toString(), style: AppTextStyles.bodySm.copyWith(color: AppColors.danger)),
                      data: (customers) => DropdownButtonFormField<Customer>(
                        value: _selectedCustomer,
                        dropdownColor: context.colorSurface,
                        style: AppTextStyles.bodyMd,
                        decoration: const InputDecoration(labelText: 'Select Customer *', prefixIcon: Icon(Icons.person_outline_rounded)),
                        items: customers.map((c) => DropdownMenuItem(value: c, child: Text(c.name, style: AppTextStyles.bodyMd))).toList(),
                        onChanged: (v) => setState(() => _selectedCustomer = v),
                        validator: (_) => _selectedCustomer == null ? 'Required' : null,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(children: [
                      Expanded(child: TextFormField(controller: _validUntilCtrl, style: AppTextStyles.bodyMd,
                          decoration: const InputDecoration(labelText: 'Valid Until (YYYY-MM-DD)', prefixIcon: Icon(Icons.calendar_today_outlined)))),
                      const SizedBox(width: 12),
                      Expanded(child: TextFormField(controller: _discountCtrl, keyboardType: TextInputType.number, style: AppTextStyles.bodyMd,
                          decoration: const InputDecoration(labelText: 'Discount %', prefixIcon: Icon(Icons.percent_rounded)))),
                    ]),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(children: [
                      Expanded(child: Text('Quote Lines', style: AppTextStyles.headingMd)),
                      TextButton.icon(
                        onPressed: () => setState(() => _lines.add(_QuoteLine())),
                        icon: const Icon(Icons.add_rounded, size: 18, color: AppColors.teal),
                        label: Text('Add Line', style: AppTextStyles.labelSm.copyWith(color: AppColors.teal)),
                      ),
                    ]),
                    const SizedBox(height: 12),
                    ...List.generate(_lines.length, (i) => _QuoteLineWidget(
                      entry: _lines[i], index: i,
                      onRemove: _lines.length > 1
                          ? () => setState(() { _lines[i].dispose(); _lines.removeAt(i); })
                          : null,
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
                    gradient: _loading ? null : const LinearGradient(colors: [AppColors.teal, AppColors.primary], begin: Alignment.topLeft, end: Alignment.bottomRight),
                    color: _loading ? AppColors.teal.withOpacity(0.4) : null,
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: _loading ? null : [BoxShadow(color: AppColors.teal.withOpacity(0.35), blurRadius: 16, offset: const Offset(0, 6))],
                  ),
                  child: ElevatedButton(
                    onPressed: _loading ? null : _submit,
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent, shadowColor: Colors.transparent, disabledBackgroundColor: Colors.transparent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                    child: _loading
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : Text('Create Quote', style: AppTextStyles.button.copyWith(color: Colors.white)),
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

class _QuoteLine {
  final itemIdCtrl = TextEditingController();
  final qtyCtrl = TextEditingController(text: '1');
  final priceCtrl = TextEditingController();
  final discCtrl = TextEditingController(text: '0');
  void dispose() { itemIdCtrl.dispose(); qtyCtrl.dispose(); priceCtrl.dispose(); discCtrl.dispose(); }
}

class _QuoteLineWidget extends StatelessWidget {
  final _QuoteLine entry;
  final int index;
  final VoidCallback? onRemove;

  const _QuoteLineWidget({required this.entry, required this.index, this.onRemove});

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
                decoration: const InputDecoration(labelText: 'Qty *'),
                validator: (v) { if (v == null || v.isEmpty) return 'Required'; if (int.tryParse(v) == null || int.parse(v) < 1) return 'Invalid'; return null; })),
            const SizedBox(width: 8),
            Expanded(child: TextFormField(controller: entry.priceCtrl, keyboardType: TextInputType.number, style: AppTextStyles.bodyMd,
                decoration: const InputDecoration(labelText: 'Price *'),
                validator: (v) { if (v == null || v.isEmpty) return 'Required'; if (double.tryParse(v) == null) return 'Invalid'; return null; })),
            const SizedBox(width: 8),
            Expanded(child: TextFormField(controller: entry.discCtrl, keyboardType: TextInputType.number, style: AppTextStyles.bodyMd,
                decoration: const InputDecoration(labelText: 'Disc %'))),
          ]),
        ],
      ),
    );
  }
}
