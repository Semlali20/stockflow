import 'package:flutter/material.dart';

abstract class AppColors {
  // ── Brand primaries ──────────────────────────────────────────────────────
  static const primary = Color(0xFF4F46E5);
  static const primaryLight = Color(0xFF6366F1);
  static const primaryDark = Color(0xFF4338CA);
  static const primaryDeep = Color(0xFF3730A3);

  // ── Accent teal ──────────────────────────────────────────────────────────
  static const teal = Color(0xFF06B6D4);
  static const tealLight = Color(0xFF22D3EE);
  static const tealDark = Color(0xFF0891B2);

  // ── Amber ─────────────────────────────────────────────────────────────────
  static const amber = Color(0xFFF59E0B);
  static const amberLight = Color(0xFFFCD34D);

  // ── Violet ───────────────────────────────────────────────────────────────
  static const violet = Color(0xFF7C3AED);
  static const violetLight = Color(0xFFA78BFA);

  // ── Status ───────────────────────────────────────────────────────────────
  static const success = Color(0xFF10B981);
  static const successLight = Color(0xFF6EE7B7);
  static const danger = Color(0xFFF43F5E);
  static const dangerDark = Color(0xFFE11D48);
  static const dangerLight = Color(0xFFFCA5A5);
  static const warning = Color(0xFFF59E0B);

  // ── Dark theme surfaces ──────────────────────────────────────────────────
  static const darkBg = Color(0xFF0E0B1E);
  static const darkBgDeep = Color(0xFF070511);
  static const darkSurface = Color(0xFF100D23);
  static const darkSurfaceAlt = Color(0xFF16121E);
  static const darkBorder = Color(0x0FFFFFFF);
  static const darkBorderHover = Color(0x12FFFFFF);
  static const darkTextPrimary = Color(0xFFE8E6FF);
  static const darkTextMuted = Color(0xFF8B88B8);
  static const darkTextSubtle = Color(0xFF6B6B94);

  // ── Light theme surfaces ─────────────────────────────────────────────────
  static const lightBg = Color(0xFFF8F7FF);
  static const lightSurface = Color(0xFFFFFFFF);
  static const lightSurfaceAlt = Color(0xFFF5F3FF);
  static const lightBorder = Color(0x1A4F46E5);
  static const lightTextPrimary = Color(0xFF1E1B4B);
  static const lightTextMuted = Color(0xFF6B6B94);
  static const lightTextSubtle = Color(0xFF4A4A6A);

  // ── Gradients ────────────────────────────────────────────────────────────
  static const gradientPrimary = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primary, primaryLight, primaryDark],
    stops: [0.0, 0.5, 1.0],
  );

  static const gradientDarkBg = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0xFF070511),
      Color(0xFF0E0B1E),
      Color(0xFF080D1A),
      Color(0xFF0A0614),
    ],
    stops: [0.0, 0.4, 0.7, 1.0],
  );

  static const gradientTeal = LinearGradient(
    colors: [teal, tealDark],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // ── Shadows ──────────────────────────────────────────────────────────────
  static List<BoxShadow> shadowSmDark = [
    BoxShadow(color: primary.withValues(alpha: 0.06), blurRadius: 8, offset: const Offset(0, 2)),
    BoxShadow(color: primary.withValues(alpha: 0.04), blurRadius: 16, offset: const Offset(0, 4)),
  ];

  static List<BoxShadow> shadowMdDark = [
    BoxShadow(color: primary.withValues(alpha: 0.10), blurRadius: 16, offset: const Offset(0, 4)),
    BoxShadow(color: primary.withValues(alpha: 0.07), blurRadius: 32, offset: const Offset(0, 8)),
  ];

  static List<BoxShadow> shadowLgDark = [
    BoxShadow(color: primary.withValues(alpha: 0.12), blurRadius: 24, offset: const Offset(0, 8)),
    BoxShadow(color: primary.withValues(alpha: 0.08), blurRadius: 48, offset: const Offset(0, 16)),
  ];

  static List<BoxShadow> shadowCard = [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.6),
      blurRadius: 12,
      offset: const Offset(0, 4),
    ),
    BoxShadow(
      color: Colors.white.withValues(alpha: 0.04),
      blurRadius: 0,
      spreadRadius: 1,
    ),
    BoxShadow(
      color: primary.withValues(alpha: 0.08),
      blurRadius: 32,
      offset: const Offset(0, 0),
    ),
  ];
}

/// Context extension providing theme-aware color lookups.
extension AppColorsX on BuildContext {
  bool get _isDark => Theme.of(this).brightness == Brightness.dark;

  Color get colorBg => _isDark ? AppColors.darkBg : AppColors.lightBg;
  Color get colorSurface => _isDark ? AppColors.darkSurface : AppColors.lightSurface;
  Color get colorSurfaceAlt => _isDark ? AppColors.darkSurfaceAlt : AppColors.lightSurfaceAlt;
  Color get colorBorder => _isDark ? AppColors.darkBorder : AppColors.lightBorder;
  Color get colorTextPrimary => _isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary;
  Color get colorTextMuted => _isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted;
  Color get colorTextSubtle => _isDark ? AppColors.darkTextSubtle : AppColors.lightTextSubtle;
}
