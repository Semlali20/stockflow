import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/theme_provider.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../auth/providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final currentTheme = ref.watch(themeProvider);

    return Scaffold(
      backgroundColor: AppColors.darkBg,
      body: Stack(
        children: [
          Container(
            height: 220,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF1A1040), AppColors.darkBg],
              ),
            ),
          ),

          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  const SizedBox(height: 8),

                  // Avatar
                  Center(
                    child: Column(
                      children: [
                        Container(
                          width: 88,
                          height: 88,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [AppColors.primary, AppColors.teal],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withOpacity(0.4),
                                blurRadius: 24,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: Center(
                            child: Text(
                              user?.initials ?? 'SF',
                              style: GoogleFonts.syne(
                                fontSize: 28,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),
                        Text(user?.fullName ?? 'User', style: AppTextStyles.headingLg),
                        const SizedBox(height: 4),
                        Text(
                          user?.email ?? '',
                          style: AppTextStyles.bodyMd.copyWith(color: AppColors.darkTextMuted),
                        ),
                        if (user?.role != null) ...[
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(99),
                              border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                            ),
                            child: Text(
                              user!.role!.toUpperCase(),
                              style: AppTextStyles.labelSm.copyWith(
                                color: AppColors.primaryLight,
                                letterSpacing: 0.8,
                                fontSize: 10,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(height: 28),

                  // ── Theme switcher ──────────────────────────────────────
                  GlassCard(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: AppColors.primary.withOpacity(0.08),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(Icons.palette_outlined, color: AppColors.primary, size: 18),
                            ),
                            const SizedBox(width: 14),
                            Text('Appearance', style: AppTextStyles.labelMd),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: AppThemeMode.values.map((mode) {
                            final selected = currentTheme == mode;
                            final isLast = mode == AppThemeMode.values.last;
                            return Expanded(
                              child: GestureDetector(
                                onTap: () => ref.read(themeProvider.notifier).setTheme(mode),
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 200),
                                  margin: EdgeInsets.only(right: isLast ? 0 : 8),
                                  padding: const EdgeInsets.symmetric(vertical: 14),
                                  decoration: BoxDecoration(
                                    color: selected
                                        ? _themeAccent(mode).withOpacity(0.15)
                                        : AppColors.darkSurfaceAlt,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: selected
                                          ? _themeAccent(mode).withOpacity(0.6)
                                          : AppColors.darkBorder,
                                      width: selected ? 1.5 : 1,
                                    ),
                                  ),
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        mode.icon,
                                        size: 22,
                                        color: selected ? _themeAccent(mode) : AppColors.darkTextSubtle,
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        mode.label,
                                        style: AppTextStyles.caption.copyWith(
                                          color: selected ? _themeAccent(mode) : AppColors.darkTextSubtle,
                                          fontWeight: selected ? FontWeight.w700 : FontWeight.w400,
                                          fontSize: 11,
                                        ),
                                      ),
                                    ],
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

                  // Settings sections
                  GlassCard(
                    padding: EdgeInsets.zero,
                    child: Column(
                      children: [
                        _SettingTile(
                          icon: Icons.person_outline_rounded,
                          label: 'Account Information',
                          onTap: () {},
                        ),
                        const Divider(height: 1, color: AppColors.darkBorder, indent: 56),
                        _SettingTile(
                          icon: Icons.notifications_outlined,
                          label: 'Notifications',
                          onTap: () {},
                        ),
                        const Divider(height: 1, color: AppColors.darkBorder, indent: 56),
                        _SettingTile(
                          icon: Icons.security_outlined,
                          label: 'Security',
                          onTap: () {},
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  GlassCard(
                    padding: EdgeInsets.zero,
                    child: _SettingTile(
                      icon: Icons.info_outline_rounded,
                      label: 'About StockFlow',
                      onTap: () => _showAbout(context),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Logout
                  GestureDetector(
                    onTap: () => _confirmLogout(context, ref),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      decoration: BoxDecoration(
                        color: AppColors.danger.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.danger.withOpacity(0.25), width: 1),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.logout_rounded, color: AppColors.danger, size: 20),
                          const SizedBox(width: 8),
                          Text('Sign Out', style: AppTextStyles.button.copyWith(color: AppColors.danger)),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  Text(
                    'StockFlow v1.0.0 • Enterprise Edition',
                    style: AppTextStyles.caption.copyWith(
                      color: AppColors.darkTextSubtle.withOpacity(0.5),
                    ),
                  ),

                  const SizedBox(height: 8),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _themeAccent(AppThemeMode mode) {
    switch (mode) {
      case AppThemeMode.dark: return AppColors.primary;
      case AppThemeMode.light: return AppColors.amber;
      case AppThemeMode.teal: return AppColors.teal;
    }
  }

  void _confirmLogout(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.darkSurfaceAlt,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Sign Out', style: AppTextStyles.headingMd),
        content: Text(
          'Are you sure you want to sign out?',
          style: AppTextStyles.bodyMd.copyWith(color: AppColors.darkTextMuted),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text('Cancel', style: AppTextStyles.button.copyWith(color: AppColors.darkTextMuted)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              ref.read(authProvider.notifier).logout();
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            child: Text('Sign Out', style: AppTextStyles.button.copyWith(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showAbout(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.darkSurfaceAlt,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('About', style: AppTextStyles.headingMd),
        content: Text(
          'StockFlow Mobile v1.0.0\nProfessional Stock Management System\n\nBuilt with Flutter & Spring Boot',
          style: AppTextStyles.bodyMd.copyWith(color: AppColors.darkTextMuted),
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}

class _SettingTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _SettingTile({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.08),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: AppColors.primary, size: 18),
            ),
            const SizedBox(width: 14),
            Expanded(child: Text(label, style: AppTextStyles.labelMd)),
            const Icon(Icons.chevron_right_rounded, color: AppColors.darkTextSubtle, size: 20),
          ],
        ),
      ),
    );
  }
}
