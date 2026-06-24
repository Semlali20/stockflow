import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../data/movement_model.dart';
import '../data/movements_repository.dart';

// ── Dropdown option models ─────────────────────────────────────────────────────

class _Option {
  final String id;
  final String label;
  final String? sublabel;
  const _Option(this.id, this.label, [this.sublabel]);
}

// ── Data providers ─────────────────────────────────────────────────────────────

final _warehousesProvider = FutureProvider.autoDispose<List<_Option>>((ref) async {
  final res = await ref.read(dioProvider).get(ApiEndpoints.warehouses,
      queryParameters: {'size': 200, 'page': 0});
  final raw = res.data;
  final list = raw is Map
      ? (raw['content'] as List? ?? raw['data'] as List? ?? [])
      : raw is List ? raw : [];
  return list.map<_Option>((w) => _Option(
        w['id']?.toString() ?? '',
        w['name'] as String? ?? 'Warehouse',
        w['code'] as String?,
      )).where((o) => o.id.isNotEmpty).toList();
});

final _locationsProvider = FutureProvider.autoDispose<List<_Option>>((ref) async {
  final res = await ref.read(dioProvider).get(ApiEndpoints.locations,
      queryParameters: {'size': 500, 'page': 0});
  final raw = res.data;
  final list = raw is Map
      ? (raw['content'] as List? ?? raw['data'] as List? ?? [])
      : raw is List ? raw : [];
  return list.map<_Option>((l) {
    final code   = l['code'] as String?;
    final zone   = l['zone'] as String?;
    final wName  = l['warehouseName'] as String?;
    final sub    = [wName, zone].whereType<String>().join(' · ');
    return _Option(
      l['id']?.toString() ?? '',
      code ?? l['aisle'] as String? ?? 'Location',
      sub.isNotEmpty ? sub : null,
    );
  }).where((o) => o.id.isNotEmpty).toList();
});

final _itemsMovProvider = FutureProvider.autoDispose<List<_Option>>((ref) async {
  final res = await ref.read(dioProvider).get(ApiEndpoints.items,
      queryParameters: {'size': 500, 'page': 0});
  final raw = res.data;
  final list = raw is Map
      ? (raw['content'] as List? ?? raw['data'] as List? ?? [])
      : raw is List ? raw : [];
  return list.map<_Option>((i) => _Option(
        i['id']?.toString() ?? '',
        i['name'] as String? ?? 'Item',
        i['sku'] as String?,
      )).where((o) => o.id.isNotEmpty).toList();
});

// ── Movement type config ───────────────────────────────────────────────────────

class _TypeCfg {
  final String value;
  final String label;
  final IconData icon;
  final String description;
  final bool needsSrc;
  final bool needsDst;
  const _TypeCfg(this.value, this.label, this.icon, this.description,
      {this.needsSrc = false, this.needsDst = false});
}

const _types = [
  _TypeCfg('RECEIPT',    'Receipt',    Icons.download_rounded,        'Goods arriving into stock',      needsDst: true),
  _TypeCfg('ISSUE',      'Issue',      Icons.upload_rounded,          'Goods going out of stock',       needsSrc: true),
  _TypeCfg('TRANSFER',   'Transfer',   Icons.swap_horiz_rounded,      'Move between locations',         needsSrc: true, needsDst: true),
  _TypeCfg('ADJUSTMENT', 'Adjustment', Icons.tune_rounded,            'Correct stock discrepancy',      needsSrc: true),
  _TypeCfg('PICKING',    'Picking',    Icons.shopping_cart_outlined,  'Pick items for an order',        needsSrc: true),
  _TypeCfg('PUTAWAY',    'Put Away',   Icons.warehouse_rounded,       'Put away received stock',        needsDst: true),
  _TypeCfg('RETURN',     'Return',     Icons.undo_rounded,            'Return items to stock',          needsDst: true),
  _TypeCfg('RELOCATION', 'Relocation', Icons.place_outlined,          'Relocate within warehouse',      needsSrc: true, needsDst: true),
];

// ── Line entry model ──────────────────────────────────────────────────────────

class _LineEntry {
  _Option? item;
  final TextEditingController qtyCtrl;
  _LineEntry() : qtyCtrl = TextEditingController(text: '1');
  void dispose() => qtyCtrl.dispose();
}

// ── Screen ────────────────────────────────────────────────────────────────────

class CreateMovementScreen extends ConsumerStatefulWidget {
  const CreateMovementScreen({super.key});

  @override
  ConsumerState<CreateMovementScreen> createState() =>
      _CreateMovementScreenState();
}

class _CreateMovementScreenState extends ConsumerState<CreateMovementScreen> {
  final _formKey    = GlobalKey<FormState>();
  final _refCtrl    = TextEditingController();
  final _notesCtrl  = TextEditingController();

  String  _type      = 'RECEIPT';
  String  _priority  = 'NORMAL';
  _Option? _warehouse;
  _Option? _srcLoc;
  _Option? _dstLoc;
  bool _isLoading    = false;
  String? _error;

  final _lines = <_LineEntry>[_LineEntry()];

  _TypeCfg get _typeCfg =>
      _types.firstWhere((t) => t.value == _type, orElse: () => _types.first);

  @override
  void dispose() {
    _refCtrl.dispose();
    _notesCtrl.dispose();
    for (final l in _lines) l.dispose();
    super.dispose();
  }

  void _addLine() => setState(() => _lines.add(_LineEntry()));

  void _removeLine(int i) {
    if (_lines.length == 1) return;
    _lines[i].dispose();
    setState(() => _lines.removeAt(i));
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    final hasItems = _lines.any((l) => l.item != null);
    if (!hasItems) {
      setState(() => _error = 'Add at least one item.');
      return;
    }

    setState(() { _isLoading = true; _error = null; });

    try {
      final request = CreateMovementRequest(
        type: _type,
        warehouseId: _warehouse?.id,
        sourceLocationId: _srcLoc?.id,
        destinationLocationId: _dstLoc?.id,
        referenceNumber: _refCtrl.text.trim().isEmpty ? null : _refCtrl.text.trim(),
        priority: _priority,
        notes: _notesCtrl.text.trim().isEmpty ? null : _notesCtrl.text.trim(),
        lines: _lines
            .where((l) => l.item != null)
            .map((l) => CreateMovementLine(
                  itemId: l.item!.id,
                  requestedQuantity: double.tryParse(l.qtyCtrl.text) ?? 1,
                  fromLocationId: _srcLoc?.id,
                  toLocationId: _dstLoc?.id,
                ))
            .toList(),
      );

      await ref.read(movementsRepositoryProvider).createMovement(request);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: const Text('Movement created successfully'),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12)),
        ));
        context.pop();
      }
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // ── Pickers ─────────────────────────────────────────────────────────────────

  Future<_Option?> _pickFromProvider(
      String title, AsyncValue<List<_Option>> asyncOpts) async {
    return asyncOpts.when(
      loading: () => null,
      error: (_, __) => null,
      data: (opts) => _SearchSheet.show(context, title: title, options: opts),
    );
  }

  Future<void> _pickWarehouse() async {
    final wh = await _pickFromProvider(
        'Select Warehouse', ref.read(_warehousesProvider));
    if (wh != null) setState(() { _warehouse = wh; _srcLoc = null; _dstLoc = null; });
  }

  Future<void> _pickSrcLoc() async {
    final locs = ref.read(_locationsProvider);
    final opt  = await _pickFromProvider('Source Location', locs);
    if (opt != null) setState(() => _srcLoc = opt);
  }

  Future<void> _pickDstLoc() async {
    final locs = ref.read(_locationsProvider);
    final opt  = await _pickFromProvider('Destination Location', locs);
    if (opt != null) setState(() => _dstLoc = opt);
  }

  Future<void> _pickItem(int idx) async {
    final items = ref.read(_itemsMovProvider);
    final opt   = await _pickFromProvider('Select Item', items);
    if (opt != null) setState(() => _lines[idx].item = opt);
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    // Pre-warm providers
    ref.watch(_warehousesProvider);
    ref.watch(_locationsProvider);
    ref.watch(_itemsMovProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
        ),
        title: Text('New Movement', style: AppTextStyles.headingMd),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
          children: [

            // ── Error banner ───────────────────────────────────────────────
            if (_error != null) ...[
              _errorBanner(_error!),
              const SizedBox(height: 14),
            ],

            // ── Movement type ──────────────────────────────────────────────
            _sectionLabel('Movement Type'),
            const SizedBox(height: 8),
            _typeGrid(),
            const SizedBox(height: 18),

            // ── Warehouse ──────────────────────────────────────────────────
            _sectionLabel('Warehouse'),
            const SizedBox(height: 8),
            _dropdownField(
              icon: Icons.warehouse_rounded,
              label: _warehouse?.label ?? 'Select warehouse…',
              sublabel: _warehouse?.sublabel,
              filled: _warehouse != null,
              onTap: _pickWarehouse,
            ),
            const SizedBox(height: 18),

            // ── Locations ──────────────────────────────────────────────────
            if (_typeCfg.needsSrc || _typeCfg.needsDst) ...[
              _sectionLabel('Locations'),
              const SizedBox(height: 8),
              if (_typeCfg.needsSrc) ...[
                _dropdownField(
                  icon: Icons.arrow_upward_rounded,
                  label: _srcLoc?.label ?? 'Source location…',
                  sublabel: _srcLoc?.sublabel,
                  filled: _srcLoc != null,
                  onTap: _pickSrcLoc,
                  accentColor: AppColors.amber,
                ),
                const SizedBox(height: 10),
              ],
              if (_typeCfg.needsDst) ...[
                _dropdownField(
                  icon: Icons.arrow_downward_rounded,
                  label: _dstLoc?.label ?? 'Destination location…',
                  sublabel: _dstLoc?.sublabel,
                  filled: _dstLoc != null,
                  onTap: _pickDstLoc,
                  accentColor: AppColors.success,
                ),
              ],
              const SizedBox(height: 18),
            ],

            // ── Items ──────────────────────────────────────────────────────
            Row(
              children: [
                Expanded(child: _sectionLabel('Items')),
                TextButton.icon(
                  onPressed: _addLine,
                  icon: const Icon(Icons.add_rounded, size: 16),
                  label: Text('Add', style: AppTextStyles.caption.copyWith(
                      color: AppColors.primary)),
                  style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 8)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            ..._lines.asMap().entries.map((e) => _lineCard(e.key, e.value)),

            const SizedBox(height: 18),

            // ── Reference + Priority ───────────────────────────────────────
            _sectionLabel('Additional Details'),
            const SizedBox(height: 8),
            _card(Column(
              children: [
                TextFormField(
                  controller: _refCtrl,
                  style: AppTextStyles.bodyMd,
                  decoration: const InputDecoration(
                    labelText: 'Reference number (optional)',
                    prefixIcon: Icon(Icons.tag_rounded),
                  ),
                ),
                const SizedBox(height: 14),
                _sectionLabel('Priority'),
                const SizedBox(height: 8),
                _priorityRow(),
                const SizedBox(height: 14),
                TextFormField(
                  controller: _notesCtrl,
                  maxLines: 3,
                  style: AppTextStyles.bodyMd,
                  decoration: const InputDecoration(
                    labelText: 'Notes (optional)',
                    alignLabelWithHint: true,
                    prefixIcon: Padding(
                      padding: EdgeInsets.only(bottom: 42),
                      child: Icon(Icons.notes_rounded),
                    ),
                  ),
                ),
              ],
            )),

            const SizedBox(height: 28),

            // ── Submit ─────────────────────────────────────────────────────
            Container(
              height: 52,
              decoration: BoxDecoration(
                gradient: _isLoading ? null : AppColors.gradientPrimary,
                color: _isLoading ? AppColors.primary.withValues(alpha: 0.4) : null,
                borderRadius: BorderRadius.circular(14),
              ),
              child: ElevatedButton(
                onPressed: _isLoading ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  disabledBackgroundColor: Colors.transparent,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
                child: _isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white))
                    : Text('Create Movement',
                        style: AppTextStyles.button
                            .copyWith(color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Sub-builders ────────────────────────────────────────────────────────────

  Widget _typeGrid() {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      childAspectRatio: 2.8,
      children: _types.map((t) {
        final sel = _type == t.value;
        return GestureDetector(
          onTap: () => setState(() {
            _type = t.value;
            _srcLoc = null;
            _dstLoc = null;
          }),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 160),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: sel
                  ? AppColors.primary.withValues(alpha: 0.12)
                  : context.colorSurface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: sel
                    ? AppColors.primary.withValues(alpha: 0.5)
                    : context.colorBorder,
                width: sel ? 1.5 : 1,
              ),
            ),
            child: Row(
              children: [
                Icon(t.icon,
                    size: 17,
                    color: sel ? AppColors.primaryLight : context.colorTextMuted),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(t.label,
                          style: AppTextStyles.labelSm.copyWith(
                            fontSize: 12,
                            color: sel
                                ? AppColors.primaryLight
                                : context.colorTextPrimary,
                          )),
                      Text(t.description,
                          style: AppTextStyles.caption.copyWith(
                            fontSize: 9,
                            color: context.colorTextSubtle,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _priorityRow() {
    const opts = [
      ('LOW', 'Low', AppColors.teal),
      ('NORMAL', 'Normal', AppColors.primary),
      ('HIGH', 'High', AppColors.amber),
      ('URGENT', 'Urgent', AppColors.danger),
    ];
    return Row(
      children: opts.map((o) {
        final sel = _priority == o.$1;
        return Expanded(
          child: GestureDetector(
            onTap: () => setState(() => _priority = o.$1),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              margin: const EdgeInsets.only(right: 6),
              padding: const EdgeInsets.symmetric(vertical: 7),
              decoration: BoxDecoration(
                color: sel
                    ? o.$3.withValues(alpha: 0.12)
                    : context.colorSurfaceAlt,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: sel ? o.$3.withValues(alpha: 0.4) : context.colorBorder,
                ),
              ),
              child: Text(o.$2,
                  textAlign: TextAlign.center,
                  style: AppTextStyles.caption.copyWith(
                    color: sel ? o.$3 : context.colorTextMuted,
                    fontWeight: sel ? FontWeight.w700 : FontWeight.w500,
                    fontSize: 11,
                  )),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _lineCard(int idx, _LineEntry line) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.colorSurface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: context.colorBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('Item ${idx + 1}',
                  style: AppTextStyles.labelSm
                      .copyWith(color: context.colorTextMuted)),
              const Spacer(),
              if (_lines.length > 1)
                GestureDetector(
                  onTap: () => _removeLine(idx),
                  child: const Icon(Icons.close_rounded,
                      size: 16, color: AppColors.danger),
                ),
            ],
          ),
          const SizedBox(height: 10),
          // Item selector
          GestureDetector(
            onTap: () => _pickItem(idx),
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: line.item != null
                    ? AppColors.primary.withValues(alpha: 0.06)
                    : context.colorSurfaceAlt,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: line.item != null
                      ? AppColors.primary.withValues(alpha: 0.3)
                      : context.colorBorder,
                ),
              ),
              child: Row(
                children: [
                  Icon(Icons.inventory_2_outlined,
                      size: 17,
                      color: line.item != null
                          ? AppColors.primary
                          : context.colorTextSubtle),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          line.item?.label ?? 'Select item…',
                          style: AppTextStyles.bodyMd.copyWith(
                            color: line.item != null
                                ? null
                                : context.colorTextSubtle,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (line.item?.sublabel != null)
                          Text(line.item!.sublabel!,
                              style: GoogleFonts.jetBrainsMono(
                                fontSize: 10,
                                color: context.colorTextSubtle,
                              )),
                      ],
                    ),
                  ),
                  Icon(Icons.expand_more_rounded,
                      size: 18, color: context.colorTextSubtle),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),
          // Quantity
          TextFormField(
            controller: line.qtyCtrl,
            keyboardType:
                const TextInputType.numberWithOptions(decimal: true),
            style: AppTextStyles.bodyMd,
            decoration: const InputDecoration(
              labelText: 'Quantity *',
              prefixIcon: Icon(Icons.numbers_rounded),
            ),
            validator: (v) {
              if (line.item == null) return null;
              if (v == null || v.isEmpty) return 'Required';
              if (double.tryParse(v) == null) return 'Invalid number';
              if ((double.tryParse(v) ?? 0) <= 0) return 'Must be > 0';
              return null;
            },
          ),
        ],
      ),
    );
  }

  Widget _dropdownField({
    required IconData icon,
    required String label,
    String? sublabel,
    required bool filled,
    required VoidCallback onTap,
    Color? accentColor,
  }) {
    final color = accentColor ?? AppColors.primary;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
        decoration: BoxDecoration(
          color: filled
              ? color.withValues(alpha: 0.06)
              : context.colorSurface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: filled ? color.withValues(alpha: 0.3) : context.colorBorder,
          ),
        ),
        child: Row(
          children: [
            Icon(icon,
                size: 18,
                color: filled ? color : context.colorTextSubtle),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                      style: AppTextStyles.bodyMd.copyWith(
                        color: filled ? null : context.colorTextSubtle,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis),
                  if (sublabel != null)
                    Text(sublabel,
                        style: AppTextStyles.caption
                            .copyWith(color: context.colorTextMuted)),
                ],
              ),
            ),
            Icon(Icons.expand_more_rounded,
                size: 20, color: context.colorTextSubtle),
          ],
        ),
      ),
    );
  }

  Widget _card(Widget child) => Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: context.colorSurface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: context.colorBorder),
        ),
        child: child,
      );

  Widget _sectionLabel(String text) => Text(text,
      style: AppTextStyles.labelMd.copyWith(
        color: context.colorTextMuted,
        fontSize: 12,
        fontWeight: FontWeight.w700,
      ));

  Widget _errorBanner(String msg) => Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.danger.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.danger.withValues(alpha: 0.3)),
        ),
        child: Row(children: [
          const Icon(Icons.error_outline_rounded,
              color: AppColors.danger, size: 18),
          const SizedBox(width: 10),
          Expanded(
              child: Text(msg,
                  style: AppTextStyles.bodySm
                      .copyWith(color: AppColors.dangerLight))),
        ]),
      );
}

// ── Search Sheet ───────────────────────────────────────────────────────────────

class _SearchSheet extends StatefulWidget {
  final String title;
  final List<_Option> options;

  const _SearchSheet({required this.title, required this.options});

  static Future<_Option?> show(
    BuildContext context, {
    required String title,
    required List<_Option> options,
  }) {
    return showModalBottomSheet<_Option>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _SearchSheet(title: title, options: options),
    );
  }

  @override
  State<_SearchSheet> createState() => _SearchSheetState();
}

class _SearchSheetState extends State<_SearchSheet> {
  final _ctrl = TextEditingController();
  List<_Option> _filtered = [];

  @override
  void initState() {
    super.initState();
    _filtered = widget.options;
    _ctrl.addListener(() {
      final q = _ctrl.text.toLowerCase();
      setState(() {
        _filtered = q.isEmpty
            ? widget.options
            : widget.options
                .where((o) =>
                    o.label.toLowerCase().contains(q) ||
                    (o.sublabel?.toLowerCase().contains(q) ?? false))
                .toList();
      });
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final maxH = MediaQuery.of(context).size.height * 0.75;

    return Container(
      constraints: BoxConstraints(maxHeight: maxH),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Handle
          const SizedBox(height: 12),
          Container(
            width: 40, height: 4,
            decoration: BoxDecoration(
              color: cs.outlineVariant,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 14),
          // Title
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                Expanded(
                    child: Text(widget.title,
                        style: AppTextStyles.headingMd)),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close_rounded, size: 20),
                ),
              ],
            ),
          ),
          // Search
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 10),
            child: TextField(
              controller: _ctrl,
              autofocus: true,
              style: AppTextStyles.bodyMd,
              decoration: InputDecoration(
                hintText: 'Search…',
                hintStyle: AppTextStyles.bodySm
                    .copyWith(color: context.colorTextSubtle),
                prefixIcon: Icon(Icons.search_rounded,
                    color: context.colorTextSubtle, size: 20),
                suffixIcon: _ctrl.text.isNotEmpty
                    ? IconButton(
                        icon: Icon(Icons.close_rounded,
                            size: 16, color: context.colorTextSubtle),
                        onPressed: () => _ctrl.clear(),
                      )
                    : null,
                filled: true,
                fillColor: context.colorSurfaceAlt,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: context.colorBorder),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: context.colorBorder),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(
                      color: AppColors.primary, width: 1.5),
                ),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
          ),
          // Count
          if (_filtered.isEmpty)
            const Expanded(
              child: Center(
                child: Text('No results',
                    style: TextStyle(color: Colors.grey)),
              ),
            )
          else
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                itemCount: _filtered.length,
                separatorBuilder: (_, __) =>
                    Divider(height: 1, color: context.colorBorder),
                itemBuilder: (_, i) {
                  final opt = _filtered[i];
                  return ListTile(
                    contentPadding:
                        const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                    title: Text(opt.label, style: AppTextStyles.bodyMd),
                    subtitle: opt.sublabel != null
                        ? Text(opt.sublabel!,
                            style: AppTextStyles.caption
                                .copyWith(color: context.colorTextMuted))
                        : null,
                    trailing: const Icon(Icons.chevron_right_rounded,
                        size: 18, color: Colors.grey),
                    onTap: () => Navigator.of(context).pop(opt),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}
