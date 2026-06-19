import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/loading_shimmer.dart';
import '../../../shared/widgets/empty_view.dart';
import '../../../shared/widgets/error_view.dart';
import '../data/inventory_model.dart';
import '../providers/inventory_provider.dart';

// ── Group config ──────────────────────────────────────────────────────────────

class _GroupCfg {
  final String key;
  final String label;
  final Color color;
  final IconData icon;
  const _GroupCfg(this.key, this.label, this.color, this.icon);
}

const _groups = [
  _GroupCfg('out_of_stock', 'Out of Stock', AppColors.danger,
      Icons.remove_circle_outline_rounded),
  _GroupCfg('low_stock', 'Low Stock', AppColors.amber,
      Icons.warning_amber_rounded),
  _GroupCfg('in_stock', 'In Stock', AppColors.success,
      Icons.check_circle_outline_rounded),
];

// ── Screen ────────────────────────────────────────────────────────────────────

class InventoryScreen extends ConsumerStatefulWidget {
  const InventoryScreen({super.key});

  @override
  ConsumerState<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends ConsumerState<InventoryScreen> {
  final _searchCtrl = TextEditingController();
  final _collapsed  = <String, bool>{};

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final invAsync     = ref.watch(inventoryProvider);
    final summaryAsync = ref.watch(inventorySummaryProvider);
    final filter       = ref.watch(inventoryStatusFilterProvider);
    final search       = ref.watch(inventorySearchProvider);

    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [

            // ── Title ────────────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Inventory', style: AppTextStyles.displayMd),
                  const SizedBox(height: 2),
                  Text(
                    'Real-time stock across all warehouses',
                    style: AppTextStyles.bodySm
                        .copyWith(color: context.colorTextMuted),
                  ),
                ],
              ),
            ),

            // ── Stats bar ────────────────────────────────────────────────────
            summaryAsync.when(
              loading: () => _StatsBarShimmer(),
              error: (_, __) => const SizedBox.shrink(),
              data: (s) => _StatsBar(
                total: s['total'] ?? 0,
                low:   s['low']   ?? 0,
                out:   s['out']   ?? 0,
              ),
            ),

            // ── Search ───────────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
              child: Container(
                decoration: BoxDecoration(
                  color: context.colorSurface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: context.colorBorder),
                ),
                child: TextField(
                  controller: _searchCtrl,
                  style: AppTextStyles.bodyMd,
                  onChanged: (v) =>
                      ref.read(inventorySearchProvider.notifier).state = v,
                  decoration: InputDecoration(
                    hintText: 'Search by name or SKU…',
                    hintStyle: AppTextStyles.bodySm
                        .copyWith(color: context.colorTextSubtle),
                    prefixIcon: Icon(Icons.search_rounded,
                        color: context.colorTextSubtle, size: 20),
                    suffixIcon: search.isNotEmpty
                        ? IconButton(
                            icon: Icon(Icons.close_rounded,
                                color: context.colorTextSubtle, size: 18),
                            onPressed: () {
                              _searchCtrl.clear();
                              ref
                                  .read(inventorySearchProvider.notifier)
                                  .state = '';
                            },
                          )
                        : null,
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 13),
                  ),
                ),
              ),
            ),

            // ── Filter chips ─────────────────────────────────────────────────
            summaryAsync.maybeWhen(
              data: (s) => SizedBox(
                height: 36,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: [
                    _FilterChip(
                      label: 'All',
                      count: s['total'] ?? 0,
                      selected: filter == 'all',
                      color: AppColors.primary,
                      onTap: () => ref
                          .read(inventoryStatusFilterProvider.notifier)
                          .state = 'all',
                    ),
                    const SizedBox(width: 8),
                    _FilterChip(
                      label: 'Low Stock',
                      count: s['low'] ?? 0,
                      selected: filter == 'low',
                      color: AppColors.amber,
                      onTap: () => ref
                          .read(inventoryStatusFilterProvider.notifier)
                          .state = 'low',
                    ),
                    const SizedBox(width: 8),
                    _FilterChip(
                      label: 'Out of Stock',
                      count: s['out'] ?? 0,
                      selected: filter == 'out',
                      color: AppColors.danger,
                      onTap: () => ref
                          .read(inventoryStatusFilterProvider.notifier)
                          .state = 'out',
                    ),
                  ],
                ),
              ),
              orElse: () => const SizedBox(height: 36),
            ),

            const SizedBox(height: 10),

            // ── Grouped list ─────────────────────────────────────────────────
            Expanded(
              child: RefreshIndicator(
                color: AppColors.primary,
                backgroundColor: context.colorSurface,
                onRefresh: () async {
                  ref.invalidate(inventoryProvider);
                  ref.invalidate(inventorySummaryProvider);
                },
                child: invAsync.when(
                  loading: () => ListView.builder(
                    itemCount: 6,
                    itemBuilder: (_, __) => const ListItemShimmer(),
                  ),
                  error: (e, _) => ErrorView(
                    message: e.toString(),
                    onRetry: () {
                      ref.invalidate(inventoryProvider);
                      ref.invalidate(inventorySummaryProvider);
                    },
                  ),
                  data: (inv) {
                    if (inv.entries.isEmpty) {
                      return EmptyView(
                        icon: Icons.inventory_2_outlined,
                        title: filter == 'low'
                            ? 'All items are well stocked'
                            : filter == 'out'
                                ? 'No out-of-stock items'
                                : search.isNotEmpty
                                    ? 'No results for "$search"'
                                    : 'No inventory records',
                        subtitle: filter == 'all' && search.isEmpty
                            ? 'Inventory will appear here once added'
                            : 'Try adjusting your search or filter',
                      );
                    }

                    // Group by stock status
                    final grouped = <String, List<InventoryEntry>>{
                      'out_of_stock': [],
                      'low_stock': [],
                      'in_stock': [],
                    };
                    for (final e in inv.entries) {
                      grouped[e.stockStatus]?.add(e);
                    }

                    final activeGroups = _groups
                        .where((g) => (grouped[g.key] ?? []).isNotEmpty)
                        .toList();

                    return ListView(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
                      children: [
                        // Item count
                        Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Row(children: [
                            Container(
                              width: 6, height: 6,
                              decoration: const BoxDecoration(
                                  color: AppColors.success,
                                  shape: BoxShape.circle),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              '${inv.entries.length} item${inv.entries.length == 1 ? '' : 's'}',
                              style: AppTextStyles.caption
                                  .copyWith(color: context.colorTextSubtle),
                            ),
                          ]),
                        ),

                        // One card per group
                        for (final cfg in activeGroups) ...[
                          _GroupCard(
                            cfg: cfg,
                            entries: grouped[cfg.key]!,
                            collapsed: _collapsed[cfg.key] ?? false,
                            onToggle: () => setState(() {
                              _collapsed[cfg.key] =
                                  !(_collapsed[cfg.key] ?? false);
                            }),
                          ),
                          const SizedBox(height: 12),
                        ],
                      ],
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Group Card ────────────────────────────────────────────────────────────────

class _GroupCard extends StatelessWidget {
  final _GroupCfg cfg;
  final List<InventoryEntry> entries;
  final bool collapsed;
  final VoidCallback onToggle;

  const _GroupCard({
    required this.cfg,
    required this.entries,
    required this.collapsed,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.colorSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.colorBorder),
        boxShadow: [
          BoxShadow(
            color: cfg.color.withValues(alpha: 0.06),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Column(
          children: [
            // ── Section header ────────────────────────────────────────────
            InkWell(
              onTap: onToggle,
              child: Container(
                color: cfg.color.withValues(alpha: 0.07),
                padding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    Container(
                      width: 30, height: 30,
                      decoration: BoxDecoration(
                        color: cfg.color.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(cfg.icon, color: cfg.color, size: 15),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      cfg.label,
                      style: AppTextStyles.labelMd.copyWith(color: cfg.color),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 9, vertical: 2),
                      decoration: BoxDecoration(
                        color: cfg.color.withValues(alpha: 0.18),
                        borderRadius: BorderRadius.circular(99),
                      ),
                      child: Text(
                        '${entries.length}',
                        style: AppTextStyles.caption.copyWith(
                          color: cfg.color,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    AnimatedRotation(
                      turns: collapsed ? 0 : 0.25,
                      duration: const Duration(milliseconds: 200),
                      child: Icon(Icons.chevron_right_rounded,
                          color: cfg.color, size: 18),
                    ),
                  ],
                ),
              ),
            ),

            // ── Rows ─────────────────────────────────────────────────────
            if (!collapsed)
              for (int i = 0; i < entries.length; i++) ...[
                if (i > 0)
                  Divider(
                      height: 1,
                      color: context.colorBorder,
                      indent: 16,
                      endIndent: 16),
                _ItemRow(entry: entries[i], color: cfg.color),
              ],
          ],
        ),
      ),
    );
  }
}

// ── Item Row ──────────────────────────────────────────────────────────────────

class _ItemRow extends StatelessWidget {
  final InventoryEntry entry;
  final Color color;

  const _ItemRow({required this.entry, required this.color});

  double get _fillPct {
    if (entry.quantity <= 0) return 0;
    final ref = entry.minQuantity != null && entry.minQuantity! > 0
        ? entry.minQuantity! * 3
        : entry.quantity.clamp(10, double.infinity);
    return (entry.quantity / ref).clamp(0.0, 1.0);
  }

  @override
  Widget build(BuildContext context) {
    final qty = entry.quantity % 1 == 0
        ? entry.quantity.toInt().toString()
        : entry.quantity.toStringAsFixed(1);
    final fill = _fillPct;
    final pctLabel = '${(fill * 100).round()}%';

    return Column(
      children: [
        // ── Main content row ─────────────────────────────────────────────
        IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Left accent strip
              Container(width: 3, color: color),

              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(14, 12, 14, 8),
                  child: Row(
                    children: [
                      // Avatar
                      Container(
                        width: 38,
                        height: 38,
                        decoration: BoxDecoration(
                          color: color.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Center(
                          child: Text(
                            entry.itemName.isNotEmpty
                                ? entry.itemName[0].toUpperCase()
                                : '?',
                            style: GoogleFonts.syne(
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                              color: color,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),

                      // Name + SKU
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              entry.itemName.isNotEmpty ? entry.itemName : '—',
                              style: AppTextStyles.labelMd,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 3),
                            Row(
                              children: [
                                if (entry.sku != null)
                                  Text(
                                    entry.sku!,
                                    style: GoogleFonts.jetBrainsMono(
                                      fontSize: 10,
                                      color: context.colorTextSubtle,
                                    ),
                                  ),
                                if (entry.sku != null && entry.warehouseName != null)
                                  Text(' · ',
                                      style: AppTextStyles.caption
                                          .copyWith(color: context.colorTextSubtle)),
                                if (entry.warehouseName != null)
                                  Flexible(
                                    child: Text(
                                      entry.warehouseName!,
                                      style: AppTextStyles.caption
                                          .copyWith(color: context.colorTextMuted),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(width: 12),

                      // Qty + pct (right side)
                      Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            qty,
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: color,
                              height: 1,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            pctLabel,
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: color.withValues(alpha: 0.6),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),

        // ── Full-width bar at bottom ──────────────────────────────────────
        _FullWidthBar(fill: fill, color: color),
      ],
    );
  }
}

// ── Full Width Bar ────────────────────────────────────────────────────────────

class _FullWidthBar extends StatelessWidget {
  final double fill;
  final Color color;
  const _FullWidthBar({required this.fill, required this.color});

  @override
  Widget build(BuildContext context) {
    const h = 4.0;
    return Stack(
      children: [
        // Track
        Container(
          height: h,
          color: color.withValues(alpha: 0.1),
        ),
        // Fill
        LayoutBuilder(builder: (_, c) {
          final fillW = (c.maxWidth * fill).clamp(0.0, c.maxWidth);
          return Container(
            height: h,
            width: fillW,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  color.withValues(alpha: 0.6),
                  color,
                ],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
              boxShadow: [
                BoxShadow(
                  color: color.withValues(alpha: 0.5),
                  blurRadius: 6,
                  offset: const Offset(0, 0),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }
}

// ── Stats Chart Card ──────────────────────────────────────────────────────────

class _StatsBar extends StatelessWidget {
  final int total;
  final int low;
  final int out;
  const _StatsBar({required this.total, required this.low, required this.out});

  @override
  Widget build(BuildContext context) {
    final inStock = total - low - out;
    final safeTotal = total == 0 ? 1 : total;
    final pctIn  = inStock / safeTotal;
    final pctLow = low    / safeTotal;
    final pctOut = out    / safeTotal;

    String _pct(double v) => '${(v * 100).round()}%';

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
      child: Container(
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
        decoration: BoxDecoration(
          color: context.colorSurface,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: context.colorBorder),
          boxShadow: [
            BoxShadow(
              color: AppColors.success.withValues(alpha: 0.07),
              blurRadius: 14,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Top row: total + legend ────────────────────────────────────
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Total badge
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '$total',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        color: context.colorTextPrimary,
                        height: 1,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Total Items',
                      style: AppTextStyles.caption.copyWith(
                          color: context.colorTextMuted, fontSize: 10),
                    ),
                  ],
                ),
                const Spacer(),
                // Legend chips
                _LegendDot(
                    color: AppColors.success,
                    label: 'In Stock',
                    value: _pct(pctIn)),
                const SizedBox(width: 10),
                _LegendDot(
                    color: AppColors.amber,
                    label: 'Low',
                    value: _pct(pctLow)),
                const SizedBox(width: 10),
                _LegendDot(
                    color: AppColors.danger,
                    label: 'Out',
                    value: _pct(pctOut)),
              ],
            ),

            const SizedBox(height: 14),

            // ── Segmented bar ──────────────────────────────────────────────
            _SegmentedBar(pctIn: pctIn, pctLow: pctLow, pctOut: pctOut),

            const SizedBox(height: 12),

            // ── Bottom counts ──────────────────────────────────────────────
            Row(
              children: [
                _CountChip(
                    value: inStock,
                    label: 'In Stock',
                    color: AppColors.success),
                const SizedBox(width: 8),
                _CountChip(
                    value: low,
                    label: 'Low Stock',
                    color: AppColors.amber),
                const SizedBox(width: 8),
                _CountChip(
                    value: out,
                    label: 'Out of Stock',
                    color: AppColors.danger),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SegmentedBar extends StatelessWidget {
  final double pctIn;
  final double pctLow;
  final double pctOut;

  const _SegmentedBar(
      {required this.pctIn, required this.pctLow, required this.pctOut});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, constraints) {
      final w = constraints.maxWidth;
      const h = 12.0;
      const r = 6.0;
      const gap = 3.0;

      final wIn  = (w * pctIn).clamp(0.0, w);
      final wLow = (w * pctLow).clamp(0.0, w - wIn);
      final wOut = (w - wIn - wLow - gap * 2).clamp(0.0, w);

      Widget seg(double width, Color color, {bool first = false, bool last = false}) {
        if (width <= 0) return const SizedBox.shrink();
        return Container(
          width: width,
          height: h,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                color.withValues(alpha: 0.85),
                color,
              ],
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
            ),
            borderRadius: BorderRadius.horizontal(
              left: first ? const Radius.circular(r) : Radius.zero,
              right: last ? const Radius.circular(r) : Radius.zero,
            ),
          ),
        );
      }

      return ClipRRect(
        borderRadius: BorderRadius.circular(r),
        child: SizedBox(
          height: h,
          width: w,
          child: Row(
            children: [
              seg(wIn, AppColors.success, first: true, last: wLow <= 0 && wOut <= 0),
              if (wLow > 0) ...[
                const SizedBox(width: gap),
                seg(wLow, AppColors.amber, last: wOut <= 0),
              ],
              if (wOut > 0) ...[
                const SizedBox(width: gap),
                seg(wOut, AppColors.danger, last: true),
              ],
            ],
          ),
        ),
      );
    });
  }
}

class _LegendDot extends StatelessWidget {
  final Color color;
  final String label;
  final String value;
  const _LegendDot(
      {required this.color, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
                width: 7, height: 7,
                decoration: BoxDecoration(
                    color: color, shape: BoxShape.circle)),
            const SizedBox(width: 4),
            Text(label,
                style: AppTextStyles.caption.copyWith(
                    color: context.colorTextSubtle, fontSize: 9)),
          ],
        ),
        const SizedBox(height: 2),
        Text(value,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: color,
            )),
      ],
    );
  }
}

class _CountChip extends StatelessWidget {
  final int value;
  final String label;
  final Color color;
  const _CountChip(
      {required this.value, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 7),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          children: [
            Text(
              '$value',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: color,
                height: 1,
              ),
            ),
            const SizedBox(height: 2),
            Text(label,
                style: AppTextStyles.caption.copyWith(
                    color: color.withValues(alpha: 0.75), fontSize: 9),
                textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}

class _StatsBarShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
        child: Container(
          height: 130,
          decoration: BoxDecoration(
            color: context.colorSurface,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: context.colorBorder),
          ),
        ),
      );
}

// ── Filter Chip ───────────────────────────────────────────────────────────────

class _FilterChip extends StatelessWidget {
  final String label;
  final int count;
  final bool selected;
  final Color color;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.count,
    required this.selected,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: selected
              ? color.withValues(alpha: 0.1)
              : context.colorSurface,
          borderRadius: BorderRadius.circular(99),
          border: Border.all(
            color: selected
                ? color.withValues(alpha: 0.45)
                : context.colorBorder,
            width: selected ? 1.5 : 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: selected ? color : context.colorTextMuted,
              ),
            ),
            const SizedBox(width: 6),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
              decoration: BoxDecoration(
                color: selected
                    ? color.withValues(alpha: 0.2)
                    : context.colorSurfaceAlt,
                borderRadius: BorderRadius.circular(99),
              ),
              child: Text(
                '$count',
                style: AppTextStyles.caption.copyWith(
                  color: selected ? color : context.colorTextSubtle,
                  fontWeight: FontWeight.w700,
                  fontSize: 10,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
