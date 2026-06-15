import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/glass_card.dart';
import '../data/purchase_models.dart';
import '../providers/purchases_provider.dart';

class PurchasesScreen extends ConsumerStatefulWidget {
  const PurchasesScreen({super.key});

  @override
  ConsumerState<PurchasesScreen> createState() => _PurchasesScreenState();
}

class _PurchasesScreenState extends ConsumerState<PurchasesScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _searchCtrl = TextEditingController();
  String _search = '';
  String _poStatus = 'ALL';

  static const _poStatuses = ['ALL', 'DRAFT', 'CONFIRMED', 'SENT', 'RECEIVED', 'CANCELLED'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkBg,
      appBar: AppBar(
        backgroundColor: AppColors.darkBg,
        title: Text('Purchases', style: AppTextStyles.headingMd),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          indicatorWeight: 2,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.darkTextMuted,
          labelStyle: GoogleFonts.plusJakartaSans(fontSize: 13, fontWeight: FontWeight.w600),
          tabs: const [
            Tab(text: 'Suppliers'),
            Tab(text: 'Purchase Orders'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _SuppliersTab(search: _search, searchCtrl: _searchCtrl, onSearch: (v) => setState(() => _search = v)),
          _PurchaseOrdersTab(status: _poStatus, statuses: _poStatuses, onStatus: (v) => setState(() => _poStatus = v)),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        onPressed: () => _tabController.index == 0
            ? _showCreateSupplier(context)
            : context.push('/purchases/create-order'),
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: Text(
          _tabController.index == 0 ? 'New Supplier' : 'New Order',
          style: AppTextStyles.button.copyWith(color: Colors.white),
        ),
      ),
    );
  }

  void _showCreateSupplier(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _CreateSupplierSheet(onCreated: () => setState(() {})),
    );
  }
}

class _SuppliersTab extends ConsumerWidget {
  final String search;
  final TextEditingController searchCtrl;
  final ValueChanged<String> onSearch;

  const _SuppliersTab({required this.search, required this.searchCtrl, required this.onSearch});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(suppliersListProvider(search));

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: TextField(
            controller: searchCtrl,
            onChanged: onSearch,
            style: AppTextStyles.bodyMd,
            decoration: InputDecoration(
              hintText: 'Search suppliers...',
              prefixIcon: const Icon(Icons.search_rounded, size: 20),
              suffixIcon: search.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear_rounded, size: 18),
                      onPressed: () { searchCtrl.clear(); onSearch(''); },
                    )
                  : null,
            ),
          ),
        ),
        Expanded(
          child: async.when(
            loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
            error: (e, _) => Center(child: Text(e.toString(), style: AppTextStyles.bodySm.copyWith(color: AppColors.danger))),
            data: (paged) => paged.content.isEmpty
                ? _empty('No suppliers found')
                : RefreshIndicator(
                    color: AppColors.primary,
                    onRefresh: () async => ref.invalidate(suppliersListProvider(search)),
                    child: ListView.separated(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                      itemCount: paged.content.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (_, i) => _SupplierCard(supplier: paged.content[i]),
                    ),
                  ),
          ),
        ),
      ],
    );
  }
}

class _SupplierCard extends StatelessWidget {
  final Supplier supplier;
  const _SupplierCard({required this.supplier});

  @override
  Widget build(BuildContext context) {
    final isActive = supplier.status == 'ACTIVE';
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primary, AppColors.teal],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(supplier.initials,
                  style: GoogleFonts.syne(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14)),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(supplier.name, style: AppTextStyles.labelMd),
                if (supplier.email != null) ...[
                  const SizedBox(height: 2),
                  Text(supplier.email!, style: AppTextStyles.bodySm.copyWith(color: AppColors.darkTextMuted)),
                ],
                if (supplier.contactPerson != null) ...[
                  const SizedBox(height: 2),
                  Text(supplier.contactPerson!, style: AppTextStyles.caption.copyWith(color: AppColors.darkTextSubtle)),
                ],
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: (isActive ? AppColors.success : AppColors.darkTextSubtle).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(99),
                ),
                child: Text(
                  supplier.status,
                  style: AppTextStyles.caption.copyWith(
                    color: isActive ? AppColors.success : AppColors.darkTextSubtle,
                    fontWeight: FontWeight.w600,
                    fontSize: 10,
                  ),
                ),
              ),
              const SizedBox(height: 4),
              Text('${supplier.leadTimeDays}d lead', style: AppTextStyles.caption.copyWith(color: AppColors.darkTextSubtle)),
            ],
          ),
        ],
      ),
    );
  }
}

class _PurchaseOrdersTab extends ConsumerWidget {
  final String status;
  final List<String> statuses;
  final ValueChanged<String> onStatus;

  const _PurchaseOrdersTab({required this.status, required this.statuses, required this.onStatus});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(purchaseOrdersProvider(status));

    return Column(
      children: [
        SizedBox(
          height: 44,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: statuses.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (_, i) {
              final s = statuses[i];
              final sel = status == s;
              return GestureDetector(
                onTap: () => onStatus(s),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: sel ? AppColors.primary.withOpacity(0.2) : AppColors.darkSurfaceAlt,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: sel ? AppColors.primary.withOpacity(0.5) : AppColors.darkBorder,
                    ),
                  ),
                  child: Text(s,
                      style: AppTextStyles.labelSm.copyWith(
                        color: sel ? AppColors.primaryLight : AppColors.darkTextMuted,
                        fontSize: 12,
                      )),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 8),
        Expanded(
          child: async.when(
            loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
            error: (e, _) => Center(child: Text(e.toString(), style: AppTextStyles.bodySm.copyWith(color: AppColors.danger))),
            data: (paged) => paged.content.isEmpty
                ? _empty('No purchase orders')
                : RefreshIndicator(
                    color: AppColors.primary,
                    onRefresh: () async => ref.invalidate(purchaseOrdersProvider(status)),
                    child: ListView.separated(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                      itemCount: paged.content.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (_, i) => _PurchaseOrderCard(order: paged.content[i]),
                    ),
                  ),
          ),
        ),
      ],
    );
  }
}

class _PurchaseOrderCard extends StatelessWidget {
  final PurchaseOrder order;
  const _PurchaseOrderCard({required this.order});

  Color get _statusColor {
    switch (order.status) {
      case 'CONFIRMED': return AppColors.primary;
      case 'SENT': return AppColors.teal;
      case 'RECEIVED': return AppColors.success;
      case 'CANCELLED': return AppColors.danger;
      default: return AppColors.darkTextSubtle;
    }
  }

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text(order.reference, style: AppTextStyles.labelMd)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: _statusColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(99),
                ),
                child: Text(order.status,
                    style: AppTextStyles.caption.copyWith(color: _statusColor, fontWeight: FontWeight.w600, fontSize: 10)),
              ),
            ],
          ),
          if (order.supplierName != null) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.business_outlined, size: 14, color: AppColors.darkTextSubtle),
                const SizedBox(width: 6),
                Text(order.supplierName!, style: AppTextStyles.bodySm.copyWith(color: AppColors.darkTextMuted)),
              ],
            ),
          ],
          const SizedBox(height: 10),
          Row(
            children: [
              _info(Icons.inventory_2_outlined, '${order.lines.length} items'),
              const SizedBox(width: 16),
              _info(Icons.attach_money_rounded, order.totalAmount.toStringAsFixed(2)),
              if (order.expectedDeliveryDate != null) ...[
                const SizedBox(width: 16),
                _info(Icons.calendar_today_outlined, order.expectedDeliveryDate!),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _info(IconData icon, String text) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Icon(icon, size: 13, color: AppColors.darkTextSubtle),
      const SizedBox(width: 4),
      Text(text, style: AppTextStyles.caption.copyWith(color: AppColors.darkTextSubtle)),
    ],
  );
}

Widget _empty(String msg) => Center(
  child: Column(
    mainAxisSize: MainAxisSize.min,
    children: [
      Icon(Icons.inbox_outlined, size: 48, color: AppColors.darkTextSubtle.withOpacity(0.4)),
      const SizedBox(height: 12),
      Text(msg, style: AppTextStyles.bodySm.copyWith(color: AppColors.darkTextSubtle)),
    ],
  ),
);

// ── Create Supplier Sheet ──────────────────────────────────────────────────

class _CreateSupplierSheet extends ConsumerStatefulWidget {
  final VoidCallback onCreated;
  const _CreateSupplierSheet({required this.onCreated});

  @override
  ConsumerState<_CreateSupplierSheet> createState() => _CreateSupplierSheetState();
}

class _CreateSupplierSheetState extends ConsumerState<_CreateSupplierSheet> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _contactCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _contactCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() { _loading = true; _error = null; });
    try {
      await ref.read(purchasesRepositoryProvider).createSupplier(SupplierRequest(
        name: _nameCtrl.text.trim(),
        email: _emailCtrl.text.trim().isEmpty ? null : _emailCtrl.text.trim(),
        phone: _phoneCtrl.text.trim().isEmpty ? null : _phoneCtrl.text.trim(),
        contactPerson: _contactCtrl.text.trim().isEmpty ? null : _contactCtrl.text.trim(),
        notes: _notesCtrl.text.trim().isEmpty ? null : _notesCtrl.text.trim(),
      ));
      if (mounted) {
        widget.onCreated();
        Navigator.of(context).pop();
      }
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.darkSurface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(context).viewInsets.bottom + 24),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(width: 40, height: 4,
                  decoration: BoxDecoration(color: AppColors.darkBorder, borderRadius: BorderRadius.circular(2))),
            ),
            const SizedBox(height: 20),
            Text('New Supplier', style: AppTextStyles.headingMd),
            const SizedBox(height: 16),
            if (_error != null) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.danger.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.danger.withOpacity(0.3)),
                ),
                child: Text(_error!, style: AppTextStyles.bodySm.copyWith(color: AppColors.dangerLight)),
              ),
              const SizedBox(height: 12),
            ],
            TextFormField(
              controller: _nameCtrl,
              style: AppTextStyles.bodyMd,
              decoration: const InputDecoration(labelText: 'Supplier Name *', prefixIcon: Icon(Icons.business_outlined)),
              validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(
                child: TextFormField(
                  controller: _emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  style: AppTextStyles.bodyMd,
                  decoration: const InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.email_outlined)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextFormField(
                  controller: _phoneCtrl,
                  keyboardType: TextInputType.phone,
                  style: AppTextStyles.bodyMd,
                  decoration: const InputDecoration(labelText: 'Phone', prefixIcon: Icon(Icons.phone_outlined)),
                ),
              ),
            ]),
            const SizedBox(height: 12),
            TextFormField(
              controller: _contactCtrl,
              style: AppTextStyles.bodyMd,
              decoration: const InputDecoration(labelText: 'Contact Person', prefixIcon: Icon(Icons.person_outline)),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _notesCtrl,
              maxLines: 2,
              style: AppTextStyles.bodyMd,
              decoration: const InputDecoration(labelText: 'Notes', prefixIcon: Icon(Icons.notes_rounded)),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _loading ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _loading
                    ? const SizedBox(width: 20, height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : Text('Create Supplier', style: AppTextStyles.button.copyWith(color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
