import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/glass_card.dart';
import '../data/sales_models.dart';
import '../data/sales_repository.dart';
import '../providers/sales_provider.dart';

class SalesScreen extends ConsumerStatefulWidget {
  const SalesScreen({super.key});

  @override
  ConsumerState<SalesScreen> createState() => _SalesScreenState();
}

class _SalesScreenState extends ConsumerState<SalesScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _searchCtrl = TextEditingController();
  String _search = '';
  String _quoteStatus = 'ALL';
  String _dnStatus = 'ALL';

  static const _quoteStatuses = ['ALL', 'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'];
  static const _dnStatuses = ['ALL', 'PENDING', 'VALIDATED', 'DELIVERED', 'CANCELLED'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() => setState(() {}));
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
        title: Text('Sales', style: AppTextStyles.headingMd),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.teal,
          indicatorWeight: 2,
          labelColor: AppColors.teal,
          unselectedLabelColor: AppColors.darkTextMuted,
          labelStyle: GoogleFonts.plusJakartaSans(fontSize: 12, fontWeight: FontWeight.w600),
          tabs: const [
            Tab(text: 'Customers'),
            Tab(text: 'Quotes'),
            Tab(text: 'Deliveries'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _CustomersTab(search: _search, searchCtrl: _searchCtrl, onSearch: (v) => setState(() => _search = v)),
          _QuotesTab(status: _quoteStatus, statuses: _quoteStatuses, onStatus: (v) => setState(() => _quoteStatus = v)),
          _DeliveriesTab(status: _dnStatus, statuses: _dnStatuses, onStatus: (v) => setState(() => _dnStatus = v)),
        ],
      ),
      floatingActionButton: _tabController.index < 2
          ? FloatingActionButton.extended(
              backgroundColor: AppColors.teal,
              onPressed: () {
                if (_tabController.index == 0) {
                  _showCreateCustomer(context);
                } else {
                  context.push('/sales/create-quote');
                }
              },
              icon: const Icon(Icons.add_rounded, color: Colors.white),
              label: Text(
                _tabController.index == 0 ? 'New Customer' : 'New Quote',
                style: AppTextStyles.button.copyWith(color: Colors.white),
              ),
            )
          : null,
    );
  }

  void _showCreateCustomer(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _CreateCustomerSheet(onCreated: () => setState(() {})),
    );
  }
}

// ── Customers Tab ───────────────────────────────────────────────────────────

class _CustomersTab extends ConsumerWidget {
  final String search;
  final TextEditingController searchCtrl;
  final ValueChanged<String> onSearch;

  const _CustomersTab({required this.search, required this.searchCtrl, required this.onSearch});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(customersListProvider(search));

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: TextField(
            controller: searchCtrl,
            onChanged: onSearch,
            style: AppTextStyles.bodyMd,
            decoration: InputDecoration(
              hintText: 'Search customers...',
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
            loading: () => const Center(child: CircularProgressIndicator(color: AppColors.teal)),
            error: (e, _) => Center(child: Text(e.toString(), style: AppTextStyles.bodySm.copyWith(color: AppColors.danger))),
            data: (paged) => paged.content.isEmpty
                ? _empty('No customers found')
                : RefreshIndicator(
                    color: AppColors.teal,
                    onRefresh: () async => ref.invalidate(customersListProvider(search)),
                    child: ListView.separated(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                      itemCount: paged.content.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (_, i) => _CustomerCard(customer: paged.content[i]),
                    ),
                  ),
          ),
        ),
      ],
    );
  }
}

class _CustomerCard extends StatelessWidget {
  final Customer customer;
  const _CustomerCard({required this.customer});

  @override
  Widget build(BuildContext context) {
    final isActive = customer.status == 'ACTIVE';
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.teal, AppColors.primary],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(customer.initials,
                  style: GoogleFonts.syne(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14)),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(customer.name, style: AppTextStyles.labelMd),
                if (customer.email != null) ...[
                  const SizedBox(height: 2),
                  Text(customer.email!, style: AppTextStyles.bodySm.copyWith(color: AppColors.darkTextMuted)),
                ],
                if (customer.phone != null) ...[
                  const SizedBox(height: 2),
                  Text(customer.phone!, style: AppTextStyles.caption.copyWith(color: AppColors.darkTextSubtle)),
                ],
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: (isActive ? AppColors.teal : AppColors.darkTextSubtle).withOpacity(0.12),
              borderRadius: BorderRadius.circular(99),
            ),
            child: Text(
              customer.status,
              style: AppTextStyles.caption.copyWith(
                color: isActive ? AppColors.teal : AppColors.darkTextSubtle,
                fontWeight: FontWeight.w600,
                fontSize: 10,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Quotes Tab ──────────────────────────────────────────────────────────────

class _QuotesTab extends ConsumerWidget {
  final String status;
  final List<String> statuses;
  final ValueChanged<String> onStatus;

  const _QuotesTab({required this.status, required this.statuses, required this.onStatus});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(quotesProvider(status));

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
                    color: sel ? AppColors.teal.withOpacity(0.2) : AppColors.darkSurfaceAlt,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: sel ? AppColors.teal.withOpacity(0.5) : AppColors.darkBorder),
                  ),
                  child: Text(s,
                      style: AppTextStyles.labelSm.copyWith(
                        color: sel ? AppColors.teal : AppColors.darkTextMuted,
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
            loading: () => const Center(child: CircularProgressIndicator(color: AppColors.teal)),
            error: (e, _) => Center(child: Text(e.toString(), style: AppTextStyles.bodySm.copyWith(color: AppColors.danger))),
            data: (paged) => paged.content.isEmpty
                ? _empty('No quotes found')
                : RefreshIndicator(
                    color: AppColors.teal,
                    onRefresh: () async => ref.invalidate(quotesProvider(status)),
                    child: ListView.separated(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                      itemCount: paged.content.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (_, i) => _QuoteCard(quote: paged.content[i]),
                    ),
                  ),
          ),
        ),
      ],
    );
  }
}

class _QuoteCard extends ConsumerWidget {
  final Quote quote;
  const _QuoteCard({required this.quote});

  Color get _statusColor {
    switch (quote.status) {
      case 'SENT': return AppColors.amber;
      case 'ACCEPTED': return AppColors.success;
      case 'REJECTED': return AppColors.danger;
      default: return AppColors.darkTextSubtle;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text(quote.reference, style: AppTextStyles.labelMd)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: _statusColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(99),
                ),
                child: Text(quote.status,
                    style: AppTextStyles.caption.copyWith(color: _statusColor, fontWeight: FontWeight.w600, fontSize: 10)),
              ),
            ],
          ),
          if (quote.customerName != null) ...[
            const SizedBox(height: 6),
            Row(children: [
              const Icon(Icons.person_outline_rounded, size: 14, color: AppColors.darkTextSubtle),
              const SizedBox(width: 6),
              Text(quote.customerName!, style: AppTextStyles.bodySm.copyWith(color: AppColors.darkTextMuted)),
            ]),
          ],
          const SizedBox(height: 10),
          Row(children: [
            _info(Icons.list_alt_rounded, '${quote.lines.length} items'),
            const SizedBox(width: 16),
            _info(Icons.attach_money_rounded, quote.totalAmount.toStringAsFixed(2)),
            if (quote.validUntil != null) ...[
              const SizedBox(width: 16),
              _info(Icons.timer_outlined, quote.validUntil!),
            ],
          ]),
          if (quote.status == 'DRAFT') ...[
            const SizedBox(height: 12),
            Row(children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () async {
                    try {
                      await ref.read(salesRepositoryProvider).sendQuote(quote.id);
                      ref.invalidate(quotesProvider('ALL'));
                      ref.invalidate(quotesProvider('DRAFT'));
                    } catch (_) {}
                  },
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.teal),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: Text('Send', style: AppTextStyles.labelSm.copyWith(color: AppColors.teal, fontSize: 12)),
                ),
              ),
            ]),
          ],
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

// ── Deliveries Tab ──────────────────────────────────────────────────────────

class _DeliveriesTab extends ConsumerWidget {
  final String status;
  final List<String> statuses;
  final ValueChanged<String> onStatus;

  const _DeliveriesTab({required this.status, required this.statuses, required this.onStatus});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(deliveryNotesProvider(status));

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
                    color: sel ? AppColors.teal.withOpacity(0.2) : AppColors.darkSurfaceAlt,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: sel ? AppColors.teal.withOpacity(0.5) : AppColors.darkBorder),
                  ),
                  child: Text(s,
                      style: AppTextStyles.labelSm.copyWith(
                        color: sel ? AppColors.teal : AppColors.darkTextMuted,
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
            loading: () => const Center(child: CircularProgressIndicator(color: AppColors.teal)),
            error: (e, _) => Center(child: Text(e.toString(), style: AppTextStyles.bodySm.copyWith(color: AppColors.danger))),
            data: (paged) => paged.content.isEmpty
                ? _empty('No delivery notes')
                : RefreshIndicator(
                    color: AppColors.teal,
                    onRefresh: () async => ref.invalidate(deliveryNotesProvider(status)),
                    child: ListView.separated(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                      itemCount: paged.content.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (_, i) => _DeliveryCard(dn: paged.content[i]),
                    ),
                  ),
          ),
        ),
      ],
    );
  }
}

class _DeliveryCard extends StatelessWidget {
  final DeliveryNote dn;
  const _DeliveryCard({required this.dn});

  Color get _statusColor {
    switch (dn.status) {
      case 'VALIDATED': return AppColors.primary;
      case 'DELIVERED': return AppColors.success;
      case 'CANCELLED': return AppColors.danger;
      default: return AppColors.amber;
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
              Expanded(child: Text(dn.reference, style: AppTextStyles.labelMd)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: _statusColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(99),
                ),
                child: Text(dn.status,
                    style: AppTextStyles.caption.copyWith(color: _statusColor, fontWeight: FontWeight.w600, fontSize: 10)),
              ),
            ],
          ),
          if (dn.customerName != null) ...[
            const SizedBox(height: 6),
            Row(children: [
              const Icon(Icons.person_outline_rounded, size: 14, color: AppColors.darkTextSubtle),
              const SizedBox(width: 6),
              Text(dn.customerName!, style: AppTextStyles.bodySm.copyWith(color: AppColors.darkTextMuted)),
            ]),
          ],
          const SizedBox(height: 10),
          Row(children: [
            _info(Icons.local_shipping_outlined, dn.deliveryDate ?? 'No date'),
            const SizedBox(width: 16),
            _info(Icons.attach_money_rounded, dn.totalAmount.toStringAsFixed(2)),
          ]),
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

// ── Create Customer Sheet ───────────────────────────────────────────────────

class _CreateCustomerSheet extends ConsumerStatefulWidget {
  final VoidCallback onCreated;
  const _CreateCustomerSheet({required this.onCreated});

  @override
  ConsumerState<_CreateCustomerSheet> createState() => _CreateCustomerSheetState();
}

class _CreateCustomerSheetState extends ConsumerState<_CreateCustomerSheet> {
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
    _nameCtrl.dispose(); _emailCtrl.dispose(); _phoneCtrl.dispose();
    _contactCtrl.dispose(); _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() { _loading = true; _error = null; });
    try {
      await ref.read(salesRepositoryProvider).createCustomer(CustomerRequest(
        name: _nameCtrl.text.trim(),
        email: _emailCtrl.text.trim().isEmpty ? null : _emailCtrl.text.trim(),
        phone: _phoneCtrl.text.trim().isEmpty ? null : _phoneCtrl.text.trim(),
        contactPerson: _contactCtrl.text.trim().isEmpty ? null : _contactCtrl.text.trim(),
        notes: _notesCtrl.text.trim().isEmpty ? null : _notesCtrl.text.trim(),
      ));
      if (mounted) { widget.onCreated(); Navigator.of(context).pop(); }
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
            Center(child: Container(width: 40, height: 4,
                decoration: BoxDecoration(color: AppColors.darkBorder, borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 20),
            Text('New Customer', style: AppTextStyles.headingMd),
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
              decoration: const InputDecoration(labelText: 'Customer Name *', prefixIcon: Icon(Icons.person_outline_rounded)),
              validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(child: TextFormField(controller: _emailCtrl, keyboardType: TextInputType.emailAddress,
                  style: AppTextStyles.bodyMd, decoration: const InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.email_outlined)))),
              const SizedBox(width: 12),
              Expanded(child: TextFormField(controller: _phoneCtrl, keyboardType: TextInputType.phone,
                  style: AppTextStyles.bodyMd, decoration: const InputDecoration(labelText: 'Phone', prefixIcon: Icon(Icons.phone_outlined)))),
            ]),
            const SizedBox(height: 12),
            TextFormField(controller: _contactCtrl, style: AppTextStyles.bodyMd,
                decoration: const InputDecoration(labelText: 'Contact Person', prefixIcon: Icon(Icons.person_outline))),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity, height: 48,
              child: ElevatedButton(
                onPressed: _loading ? null : _submit,
                style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.teal,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                child: _loading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : Text('Create Customer', style: AppTextStyles.button.copyWith(color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
