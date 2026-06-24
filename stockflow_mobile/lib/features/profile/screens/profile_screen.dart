import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/storage/secure_storage.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/theme_provider.dart';
import '../../auth/data/auth_models.dart';
import '../../auth/providers/auth_provider.dart';

// ── Notification Preferences ─────────────────────────────────────────────────

class NotifPrefs {
  final bool pushEnabled;
  final bool lowStockAlerts;
  final bool orderUpdates;
  final bool emailDigest;

  const NotifPrefs({
    this.pushEnabled = true,
    this.lowStockAlerts = true,
    this.orderUpdates = true,
    this.emailDigest = false,
  });

  NotifPrefs copyWith({bool? pushEnabled, bool? lowStockAlerts, bool? orderUpdates, bool? emailDigest}) =>
      NotifPrefs(
        pushEnabled: pushEnabled ?? this.pushEnabled,
        lowStockAlerts: lowStockAlerts ?? this.lowStockAlerts,
        orderUpdates: orderUpdates ?? this.orderUpdates,
        emailDigest: emailDigest ?? this.emailDigest,
      );
}

class NotifPrefsNotifier extends StateNotifier<NotifPrefs> {
  final SecureStorageService _storage;
  NotifPrefsNotifier(this._storage) : super(const NotifPrefs()) { _load(); }

  Future<void> _load() async {
    final push  = await _storage.read('notif_push')      ?? 'true';
    final low   = await _storage.read('notif_low_stock') ?? 'true';
    final order = await _storage.read('notif_order')     ?? 'true';
    final email = await _storage.read('notif_email')     ?? 'false';
    state = NotifPrefs(
      pushEnabled: push == 'true', lowStockAlerts: low == 'true',
      orderUpdates: order == 'true', emailDigest: email == 'true',
    );
  }

  Future<void> setPush(bool v)        async { await _storage.write('notif_push', v.toString());      state = state.copyWith(pushEnabled: v); }
  Future<void> setLowStock(bool v)    async { await _storage.write('notif_low_stock', v.toString()); state = state.copyWith(lowStockAlerts: v); }
  Future<void> setOrderUpdates(bool v)async { await _storage.write('notif_order', v.toString());     state = state.copyWith(orderUpdates: v); }
  Future<void> setEmailDigest(bool v) async { await _storage.write('notif_email', v.toString());     state = state.copyWith(emailDigest: v); }
}

final notifPrefsProvider = StateNotifierProvider<NotifPrefsNotifier, NotifPrefs>((ref) {
  return NotifPrefsNotifier(ref.read(secureStorageProvider));
});

// ── Profile Screen ────────────────────────────────────────────────────────────

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final UserInfo?   user = ref.watch(currentUserProvider);
    final themeMode   = ref.watch(themeProvider);
    final isDark      = themeMode == AppThemeMode.dark;
    final cs          = Theme.of(context).colorScheme;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 24),

              // ── Title ─────────────────────────────────────────────────
              Text('Settings', style: AppTextStyles.displayMd),
              const SizedBox(height: 24),

              // ── User card ─────────────────────────────────────────────
              GestureDetector(
                onTap: () => _showAccountInfo(context, user),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: context.colorSurface,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: context.colorBorder),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      _UserAvatar(user: user, size: 52),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              user?.fullName ?? 'User',
                              style: AppTextStyles.labelMd.copyWith(fontSize: 16),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              user?.role?.replaceAll('_', ' ') ?? 'Member',
                              style: AppTextStyles.bodySm.copyWith(
                                color: cs.onSurface.withOpacity(0.5),
                              ),
                            ),
                          ],
                        ),
                      ),
                      Icon(Icons.chevron_right_rounded,
                          color: cs.onSurface.withOpacity(0.3), size: 22),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 28),

              // ── Other settings label ───────────────────────────────────
              Padding(
                padding: const EdgeInsets.only(left: 4, bottom: 10),
                child: Text(
                  'Other settings',
                  style: AppTextStyles.caption.copyWith(
                    color: cs.onSurface.withOpacity(0.45),
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.4,
                    fontSize: 12,
                  ),
                ),
              ),

              // ── Settings group ─────────────────────────────────────────
              Container(
                decoration: BoxDecoration(
                  color: context.colorSurface,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: context.colorBorder),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    _SettingRow(
                      icon: Icons.person_outline_rounded,
                      label: 'Profile details',
                      onTap: () => _showAccountInfo(context, user),
                    ),
                    _Divider(),
                    _SettingRow(
                      icon: Icons.lock_outline_rounded,
                      label: 'Password',
                      onTap: () => _showSecurity(context, ref),
                    ),
                    _Divider(),
                    _SettingRow(
                      icon: Icons.notifications_outlined,
                      label: 'Notifications',
                      onTap: () => _showNotifications(context, ref),
                    ),
                    _Divider(),
                    _SettingRow(
                      icon: Icons.dark_mode_outlined,
                      label: 'Dark mode',
                      trailing: Switch(
                        value: isDark,
                        onChanged: (v) => ref.read(themeProvider.notifier)
                            .setTheme(v ? AppThemeMode.dark : AppThemeMode.light),
                        activeColor: AppColors.primary,
                        trackOutlineColor: WidgetStateProperty.all(cs.outlineVariant),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              // ── About ──────────────────────────────────────────────────
              Container(
                decoration: BoxDecoration(
                  color: context.colorSurface,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: context.colorBorder),
                ),
                child: _SettingRow(
                  icon: Icons.info_outline_rounded,
                  label: 'About StockFlow',
                  onTap: () => _showAbout(context),
                ),
              ),

              const SizedBox(height: 16),

              // ── Sign out ───────────────────────────────────────────────
              GestureDetector(
                onTap: () => _confirmLogout(context, ref),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 15),
                  decoration: BoxDecoration(
                    color: AppColors.danger.withOpacity(0.07),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: AppColors.danger.withOpacity(0.2)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.logout_rounded, color: AppColors.danger, size: 19),
                      const SizedBox(width: 8),
                      Text('Sign Out',
                          style: AppTextStyles.button.copyWith(color: AppColors.danger)),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 20),

              Center(
                child: Text(
                  'StockFlow v1.0.0 • Enterprise Edition',
                  style: AppTextStyles.caption.copyWith(
                      color: cs.onSurface.withOpacity(0.25)),
                ),
              ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  // ── Sheets ────────────────────────────────────────────────────────────────

  void _showAccountInfo(BuildContext context, UserInfo? user) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _AccountInfoSheet(user: user),
    );
  }

  void _showNotifications(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => UncontrolledProviderScope(
        container: ProviderScope.containerOf(context),
        child: const _NotificationsSheet(),
      ),
    );
  }

  void _showSecurity(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => UncontrolledProviderScope(
        container: ProviderScope.containerOf(context),
        child: const _SecuritySheet(),
      ),
    );
  }

  void _confirmLogout(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Sign Out', style: AppTextStyles.headingMd),
        content: Text('Are you sure you want to sign out?',
            style: AppTextStyles.bodyMd.copyWith(
                color: Theme.of(ctx).colorScheme.onSurface.withOpacity(0.6))),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text('Cancel', style: AppTextStyles.button.copyWith(
                color: Theme.of(ctx).colorScheme.onSurface.withOpacity(0.5))),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              ref.read(authProvider.notifier).logout();
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            child: Text('Sign Out',
                style: AppTextStyles.button.copyWith(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showAbout(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              gradient: AppColors.gradientPrimary,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.inventory_2_rounded, color: Colors.white, size: 18),
          ),
          const SizedBox(width: 12),
          Text('About StockFlow', style: AppTextStyles.headingMd),
        ]),
        content: Text(
          'StockFlow is designed to streamline stock movements, purchasing, sales, and real-time analytics, giving modern businesses full control over their inventory in one place.',
          style: AppTextStyles.bodyMd.copyWith(
            color: Theme.of(ctx).colorScheme.onSurface.withOpacity(0.75),
            height: 1.65,
          ),
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: Text('Close', style: AppTextStyles.button.copyWith(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}

// ── Setting Row ───────────────────────────────────────────────────────────────

class _SettingRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final Widget? trailing;

  const _SettingRow({required this.icon, required this.label, this.onTap, this.trailing});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Container(
              width: 36, height: 36,
              decoration: BoxDecoration(
                color: cs.onSurface.withOpacity(0.06),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: cs.onSurface.withOpacity(0.6), size: 18),
            ),
            const SizedBox(width: 14),
            Expanded(child: Text(label, style: AppTextStyles.labelMd)),
            trailing ??
                Icon(Icons.chevron_right_rounded,
                    color: cs.onSurface.withOpacity(0.3), size: 20),
          ],
        ),
      ),
    );
  }
}

class _Divider extends StatelessWidget {
  @override
  Widget build(BuildContext context) =>
      Divider(height: 1, color: context.colorBorder, indent: 66);
}

// ── User Avatar ───────────────────────────────────────────────────────────────

class _UserAvatar extends StatelessWidget {
  final UserInfo? user;
  final double size;
  const _UserAvatar({this.user, this.size = 88});

  /// Returns decoded bytes if the URL is a base64 data URI, null otherwise.
  Uint8List? _base64Bytes() {
    final raw = user?.avatarUrl;
    if (raw == null || !raw.startsWith('data:')) return null;
    try {
      final comma = raw.indexOf(',');
      if (comma == -1) return null;
      return base64Decode(raw.substring(comma + 1));
    } catch (_) { return null; }
  }

  String? _networkUrl() {
    final raw = user?.avatarUrl;
    if (raw == null || raw.isEmpty || raw.startsWith('data:')) return null;
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    try {
      final base = dotenv.env['API_BASE_URL'] ?? '';
      return '$base$raw';
    } catch (_) { return raw; }
  }

  @override
  Widget build(BuildContext context) {
    final bytes    = _base64Bytes();
    final url      = _networkUrl();
    final initials = user?.initials ?? 'SF';
    final fallback = _InitialsAvatar(initials: initials, size: size);

    return Container(
      width: size, height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.3),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipOval(
        child: bytes != null
            ? Image.memory(bytes, width: size, height: size, fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => fallback)
            : url != null
                ? Image.network(url, width: size, height: size, fit: BoxFit.cover,
                    loadingBuilder: (_, child, progress) =>
                        progress == null ? child : fallback,
                    errorBuilder: (_, __, ___) => fallback)
                : fallback,
      ),
    );
  }
}

class _InitialsAvatar extends StatelessWidget {
  final String initials;
  final double size;
  const _InitialsAvatar({required this.initials, this.size = 88});

  @override
  Widget build(BuildContext context) => Container(
    width: size, height: size,
    decoration: const BoxDecoration(
      gradient: LinearGradient(
        colors: [AppColors.primary, AppColors.teal],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
    ),
    child: Center(
      child: Text(
        initials,
        style: GoogleFonts.syne(
          fontSize: size * 0.32,
          fontWeight: FontWeight.w700,
          color: Colors.white,
        ),
      ),
    ),
  );
}

// ── Account Info Sheet ────────────────────────────────────────────────────────

class _AccountInfoSheet extends StatelessWidget {
  final UserInfo? user;
  const _AccountInfoSheet({this.user});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.fromLTRB(24, 16, 24, MediaQuery.of(context).viewInsets.bottom + 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(child: Container(width: 40, height: 4,
              decoration: BoxDecoration(color: cs.outlineVariant, borderRadius: BorderRadius.circular(2)))),
          const SizedBox(height: 24),
          Center(child: _UserAvatar(user: user, size: 72)),
          const SizedBox(height: 16),
          Center(child: Text(user?.fullName ?? '—', style: AppTextStyles.headingLg)),
          const SizedBox(height: 4),
          Center(child: Text(user?.email ?? '—',
              style: AppTextStyles.bodySm.copyWith(color: cs.onSurface.withOpacity(0.5)))),
          const SizedBox(height: 24),
          _infoRow(context, Icons.work_outline_rounded, 'Role', user?.role?.replaceAll('_', ' ') ?? '—'),
          const SizedBox(height: 14),
          _infoRow(context, Icons.fingerprint_rounded, 'User ID', user?.id ?? '—'),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.06),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.primary.withOpacity(0.15)),
            ),
            child: Row(children: [
              const Icon(Icons.info_outline_rounded, color: AppColors.primary, size: 16),
              const SizedBox(width: 10),
              Expanded(child: Text(
                'To update your account details, contact your system administrator.',
                style: AppTextStyles.caption.copyWith(color: AppColors.primaryLight, height: 1.4),
              )),
            ]),
          ),
        ],
      ),
    );
  }

  Widget _infoRow(BuildContext context, IconData icon, String label, String value) {
    final cs = Theme.of(context).colorScheme;
    return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Icon(icon, size: 18, color: cs.onSurface.withOpacity(0.35)),
      const SizedBox(width: 12),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: AppTextStyles.caption.copyWith(color: cs.onSurface.withOpacity(0.45))),
        const SizedBox(height: 2),
        Text(value, style: AppTextStyles.labelMd),
      ])),
    ]);
  }
}

// ── Notifications Sheet ───────────────────────────────────────────────────────

class _NotificationsSheet extends ConsumerWidget {
  const _NotificationsSheet();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final prefs    = ref.watch(notifPrefsProvider);
    final notifier = ref.read(notifPrefsProvider.notifier);
    final cs       = Theme.of(context).colorScheme;

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Center(child: Container(width: 40, height: 4,
            decoration: BoxDecoration(color: cs.outlineVariant, borderRadius: BorderRadius.circular(2)))),
        const SizedBox(height: 20),
        Align(alignment: Alignment.centerLeft, child: Text('Notifications', style: AppTextStyles.headingMd)),
        const SizedBox(height: 20),
        _NotifTile(icon: Icons.notifications_active_outlined, label: 'Push Notifications',
            subtitle: 'Receive alerts on your device', value: prefs.pushEnabled,
            onChanged: notifier.setPush, color: AppColors.primary),
        const Divider(height: 24),
        _NotifTile(icon: Icons.inventory_2_outlined, label: 'Low Stock Alerts',
            subtitle: 'Get notified when items run low', value: prefs.lowStockAlerts,
            onChanged: prefs.pushEnabled ? notifier.setLowStock : null, color: AppColors.amber),
        const Divider(height: 24),
        _NotifTile(icon: Icons.shopping_cart_outlined, label: 'Order Updates',
            subtitle: 'Updates on purchases and deliveries', value: prefs.orderUpdates,
            onChanged: prefs.pushEnabled ? notifier.setOrderUpdates : null, color: AppColors.teal),
        const Divider(height: 24),
        _NotifTile(icon: Icons.email_outlined, label: 'Email Digest',
            subtitle: 'Daily summary sent to your email', value: prefs.emailDigest,
            onChanged: notifier.setEmailDigest, color: AppColors.success),
      ]),
    );
  }
}

class _NotifTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;
  final bool value;
  final void Function(bool)? onChanged;
  final Color color;

  const _NotifTile({required this.icon, required this.label, required this.subtitle,
      required this.value, required this.onChanged, required this.color});

  @override
  Widget build(BuildContext context) {
    final cs       = Theme.of(context).colorScheme;
    final disabled = onChanged == null;
    return Row(children: [
      Container(
        width: 38, height: 38,
        decoration: BoxDecoration(
          color: color.withOpacity(disabled ? 0.04 : 0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: disabled ? cs.onSurface.withOpacity(0.3) : color, size: 18),
      ),
      const SizedBox(width: 14),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: AppTextStyles.labelMd.copyWith(
            color: disabled ? cs.onSurface.withOpacity(0.4) : null)),
        Text(subtitle, style: AppTextStyles.caption.copyWith(
            color: cs.onSurface.withOpacity(disabled ? 0.25 : 0.5))),
      ])),
      Switch(value: value, onChanged: onChanged, activeColor: color,
          trackOutlineColor: WidgetStateProperty.all(cs.outlineVariant)),
    ]);
  }
}

// ── Security Sheet ────────────────────────────────────────────────────────────

class _SecuritySheet extends ConsumerStatefulWidget {
  const _SecuritySheet();

  @override
  ConsumerState<_SecuritySheet> createState() => _SecuritySheetState();
}

class _SecuritySheetState extends ConsumerState<_SecuritySheet> {
  final _formKey    = GlobalKey<FormState>();
  final _currentCtrl = TextEditingController();
  final _newCtrl     = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _showCurrent = false, _showNew = false, _showConfirm = false;
  bool _loading = false;
  String? _error;
  bool _success = false;

  @override
  void dispose() {
    _currentCtrl.dispose(); _newCtrl.dispose(); _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _changePassword() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() { _loading = true; _error = null; _success = false; });
    try {
      await ref.read(dioProvider).put(ApiEndpoints.changePassword, data: {
        'currentPassword': _currentCtrl.text,
        'newPassword': _newCtrl.text,
      });
      setState(() { _success = true; });
      _currentCtrl.clear(); _newCtrl.clear(); _confirmCtrl.clear();
    } catch (_) {
      setState(() => _error = 'Incorrect current password or server error. Try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.fromLTRB(24, 16, 24, MediaQuery.of(context).viewInsets.bottom + 32),
      child: SingleChildScrollView(
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          Center(child: Container(width: 40, height: 4,
              decoration: BoxDecoration(color: cs.outlineVariant, borderRadius: BorderRadius.circular(2)))),
          const SizedBox(height: 20),
          Text('Change Password', style: AppTextStyles.headingMd),
          const SizedBox(height: 4),
          Text('Choose a strong password (min. 8 characters)',
              style: AppTextStyles.bodySm.copyWith(color: cs.onSurface.withOpacity(0.5))),
          const SizedBox(height: 20),

          if (_success) ...[
            _banner(true, 'Password changed successfully!'),
            const SizedBox(height: 14),
          ],
          if (_error != null) ...[
            _banner(false, _error!),
            const SizedBox(height: 14),
          ],

          Form(
            key: _formKey,
            child: Column(children: [
              _pwField(_currentCtrl, 'Current Password', Icons.lock_outline_rounded,
                  _showCurrent, () => setState(() => _showCurrent = !_showCurrent),
                  (v) => v == null || v.isEmpty ? 'Required' : null),
              const SizedBox(height: 14),
              _pwField(_newCtrl, 'New Password', Icons.lock_reset_rounded,
                  _showNew, () => setState(() => _showNew = !_showNew),
                  (v) { if (v == null || v.isEmpty) return 'Required'; if (v.length < 8) return 'Min. 8 characters'; return null; }),
              const SizedBox(height: 14),
              _pwField(_confirmCtrl, 'Confirm New Password', Icons.check_circle_outline_rounded,
                  _showConfirm, () => setState(() => _showConfirm = !_showConfirm),
                  (v) { if (v == null || v.isEmpty) return 'Required'; if (v != _newCtrl.text) return 'Passwords do not match'; return null; }),
            ]),
          ),

          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity, height: 50,
            child: ElevatedButton(
              onPressed: _loading ? null : _changePassword,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                disabledBackgroundColor: AppColors.primary.withOpacity(0.4),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: _loading
                  ? const SizedBox(width: 20, height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : Text('Update Password',
                      style: AppTextStyles.button.copyWith(color: Colors.white)),
            ),
          ),
        ]),
      ),
    );
  }

  Widget _banner(bool success, String msg) => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: (success ? AppColors.success : AppColors.danger).withOpacity(0.1),
      borderRadius: BorderRadius.circular(12),
      border: Border.all(
          color: (success ? AppColors.success : AppColors.danger).withOpacity(0.3)),
    ),
    child: Row(children: [
      Icon(success ? Icons.check_circle_outline_rounded : Icons.error_outline_rounded,
          color: success ? AppColors.success : AppColors.danger, size: 18),
      const SizedBox(width: 10),
      Expanded(child: Text(msg,
          style: AppTextStyles.bodySm.copyWith(
              color: success ? AppColors.success : AppColors.dangerLight))),
    ]),
  );

  Widget _pwField(TextEditingController ctrl, String label, IconData icon,
      bool show, VoidCallback toggle, String? Function(String?) validator) {
    return TextFormField(
      controller: ctrl,
      obscureText: !show,
      style: AppTextStyles.bodyMd,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        suffixIcon: IconButton(
          icon: Icon(show ? Icons.visibility_off_outlined : Icons.visibility_outlined),
          onPressed: toggle,
        ),
      ),
      validator: validator,
    );
  }
}
