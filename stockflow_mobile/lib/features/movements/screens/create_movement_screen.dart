import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/glass_card.dart';
import '../data/movement_model.dart';
import '../data/movements_repository.dart';

class CreateMovementScreen extends ConsumerStatefulWidget {
  const CreateMovementScreen({super.key});

  @override
  ConsumerState<CreateMovementScreen> createState() =>
      _CreateMovementScreenState();
}

class _CreateMovementScreenState extends ConsumerState<CreateMovementScreen> {
  final _formKey = GlobalKey<FormState>();
  String _type = 'TRANSFER';
  final _fromCtrl = TextEditingController();
  final _toCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  final _itemIdCtrl = TextEditingController();
  final _qtyCtrl = TextEditingController();
  final _lotCtrl = TextEditingController();
  bool _isLoading = false;
  String? _error;

  static const _types = ['TRANSFER', 'RECEIPT', 'SHIPMENT', 'ADJUSTMENT'];

  @override
  void dispose() {
    _fromCtrl.dispose();
    _toCtrl.dispose();
    _notesCtrl.dispose();
    _itemIdCtrl.dispose();
    _qtyCtrl.dispose();
    _lotCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final request = CreateMovementRequest(
        type: _type,
        fromWarehouseId: _fromCtrl.text.trim().isEmpty ? null : _fromCtrl.text.trim(),
        toWarehouseId: _toCtrl.text.trim().isEmpty ? null : _toCtrl.text.trim(),
        notes: _notesCtrl.text.trim().isEmpty ? null : _notesCtrl.text.trim(),
        lines: [
          if (_itemIdCtrl.text.trim().isNotEmpty)
            CreateMovementLine(
              itemId: _itemIdCtrl.text.trim(),
              quantity: double.tryParse(_qtyCtrl.text) ?? 1,
              lotNumber: _lotCtrl.text.trim().isEmpty ? null : _lotCtrl.text.trim(),
            ),
        ],
      );

      await ref.read(movementsRepositoryProvider).createMovement(request);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Movement created successfully'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
        context.pop();
      }
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkBg,
      appBar: AppBar(
        backgroundColor: AppColors.darkBg,
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
        ),
        title: Text('New Movement', style: AppTextStyles.headingMd),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Error
              if (_error != null) ...[
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.danger.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.danger.withValues(alpha: 0.3)),
                  ),
                  child: Text(_error!, style: AppTextStyles.bodySm.copyWith(color: AppColors.dangerLight)),
                ),
                const SizedBox(height: 16),
              ],

              // Type selector
              GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Movement Type', style: AppTextStyles.headingMd),
                    const SizedBox(height: 14),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _types.map((t) {
                        final selected = _type == t;
                        return GestureDetector(
                          onTap: () => setState(() => _type = t),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 180),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              color: selected
                                  ? AppColors.primary.withValues(alpha: 0.2)
                                  : AppColors.darkSurfaceAlt,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: selected
                                    ? AppColors.primary.withValues(alpha: 0.5)
                                    : AppColors.darkBorder,
                              ),
                            ),
                            child: Text(
                              t,
                              style: AppTextStyles.labelSm.copyWith(
                                color: selected ? AppColors.primaryLight : AppColors.darkTextMuted,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Warehouses
              GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Locations', style: AppTextStyles.headingMd),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _fromCtrl,
                      style: AppTextStyles.bodyMd,
                      decoration: const InputDecoration(
                        labelText: 'From Warehouse ID',
                        prefixIcon: Icon(Icons.warehouse_outlined),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _toCtrl,
                      style: AppTextStyles.bodyMd,
                      decoration: const InputDecoration(
                        labelText: 'To Warehouse ID',
                        prefixIcon: Icon(Icons.warehouse_rounded),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Line item
              GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Item', style: AppTextStyles.headingMd),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _itemIdCtrl,
                      style: AppTextStyles.bodyMd,
                      decoration: const InputDecoration(
                        labelText: 'Item ID *',
                        prefixIcon: Icon(Icons.inventory_2_outlined),
                      ),
                      validator: (v) =>
                          v == null || v.trim().isEmpty ? 'Item ID is required' : null,
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _qtyCtrl,
                            keyboardType: TextInputType.number,
                            style: AppTextStyles.bodyMd,
                            decoration: const InputDecoration(
                              labelText: 'Quantity *',
                              prefixIcon: Icon(Icons.numbers_rounded),
                            ),
                            validator: (v) {
                              if (v == null || v.isEmpty) return 'Required';
                              if (double.tryParse(v) == null) return 'Invalid';
                              return null;
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextFormField(
                            controller: _lotCtrl,
                            style: AppTextStyles.bodyMd,
                            decoration: const InputDecoration(
                              labelText: 'Lot Number',
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Notes
              GlassCard(
                child: TextFormField(
                  controller: _notesCtrl,
                  maxLines: 3,
                  style: AppTextStyles.bodyMd,
                  decoration: const InputDecoration(
                    labelText: 'Notes (optional)',
                    alignLabelWithHint: true,
                    prefixIcon: Padding(
                      padding: EdgeInsets.only(bottom: 40),
                      child: Icon(Icons.notes_rounded),
                    ),
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                  ),
                ),
              ),

              const SizedBox(height: 28),

              // Submit
              SizedBox(
                width: double.infinity,
                height: 52,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: _isLoading ? null : AppColors.gradientPrimary,
                    color: _isLoading ? AppColors.primary.withValues(alpha: 0.4) : null,
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: _isLoading ? null : AppColors.shadowMdDark,
                  ),
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      disabledBackgroundColor: Colors.transparent,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            width: 20, height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : Text('Create Movement', style: AppTextStyles.button.copyWith(color: Colors.white)),
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
