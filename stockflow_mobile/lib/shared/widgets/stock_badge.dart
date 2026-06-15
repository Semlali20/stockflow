import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';

enum StockStatus { inStock, lowStock, outOfStock, pending, completed, cancelled }

class StockBadge extends StatelessWidget {
  final StockStatus status;
  final String? label;

  const StockBadge({super.key, required this.status, this.label});

  factory StockBadge.fromString(String status) {
    switch (status.toLowerCase()) {
      case 'in_stock':
      case 'instock':
      case 'available':
        return const StockBadge(status: StockStatus.inStock);
      case 'low_stock':
      case 'lowstock':
      case 'low':
        return const StockBadge(status: StockStatus.lowStock);
      case 'out_of_stock':
      case 'outofstock':
      case 'out':
        return const StockBadge(status: StockStatus.outOfStock);
      case 'pending':
        return const StockBadge(status: StockStatus.pending);
      case 'completed':
      case 'done':
        return const StockBadge(status: StockStatus.completed);
      case 'cancelled':
      case 'canceled':
        return const StockBadge(status: StockStatus.cancelled);
      default:
        return StockBadge(status: StockStatus.inStock, label: status);
    }
  }

  @override
  Widget build(BuildContext context) {
    final config = _config();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: config.bg,
        borderRadius: BorderRadius.circular(99),
        border: Border.all(color: config.border, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: config.dot,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            label ?? config.text,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: config.textColor,
              letterSpacing: 0.2,
            ),
          ),
        ],
      ),
    );
  }

  _BadgeConfig _config() {
    switch (status) {
      case StockStatus.inStock:
      case StockStatus.completed:
        return _BadgeConfig(
          bg: AppColors.success.withValues(alpha: 0.12),
          border: AppColors.success.withValues(alpha: 0.3),
          dot: AppColors.success,
          textColor: AppColors.successLight,
          text: status == StockStatus.completed ? 'Completed' : 'In Stock',
        );
      case StockStatus.lowStock:
      case StockStatus.pending:
        return _BadgeConfig(
          bg: AppColors.amber.withValues(alpha: 0.12),
          border: AppColors.amber.withValues(alpha: 0.3),
          dot: AppColors.amber,
          textColor: AppColors.amberLight,
          text: status == StockStatus.pending ? 'Pending' : 'Low Stock',
        );
      case StockStatus.outOfStock:
      case StockStatus.cancelled:
        return _BadgeConfig(
          bg: AppColors.danger.withValues(alpha: 0.12),
          border: AppColors.danger.withValues(alpha: 0.3),
          dot: AppColors.danger,
          textColor: AppColors.dangerLight,
          text: status == StockStatus.cancelled ? 'Cancelled' : 'Out of Stock',
        );
    }
  }
}

class _BadgeConfig {
  final Color bg;
  final Color border;
  final Color dot;
  final Color textColor;
  final String text;

  const _BadgeConfig({
    required this.bg,
    required this.border,
    required this.dot,
    required this.textColor,
    required this.text,
  });
}
