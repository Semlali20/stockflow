import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../storage/secure_storage.dart';

enum AppThemeMode { dark, light }

extension AppThemeModeX on AppThemeMode {
  String get label {
    switch (this) {
      case AppThemeMode.dark: return 'Dark';
      case AppThemeMode.light: return 'Light';
    }
  }

  IconData get icon {
    switch (this) {
      case AppThemeMode.dark: return Icons.dark_mode_rounded;
      case AppThemeMode.light: return Icons.light_mode_rounded;
    }
  }

  String get _key => name;

  static AppThemeMode fromKey(String key) {
    return AppThemeMode.values.firstWhere(
      (e) => e.name == key,
      orElse: () => AppThemeMode.dark,
    );
  }
}

class ThemeNotifier extends StateNotifier<AppThemeMode> {
  final SecureStorageService _storage;

  ThemeNotifier(this._storage) : super(AppThemeMode.dark) {
    _load();
  }

  static const _storageKey = 'app_theme_mode';

  Future<void> _load() async {
    try {
      final stored = await _storage.read(_storageKey)
          .timeout(const Duration(seconds: 2), onTimeout: () => null);
      if (stored != null) {
        state = AppThemeModeX.fromKey(stored);
      }
    } catch (_) {}
  }

  Future<void> setTheme(AppThemeMode mode) async {
    state = mode;
    try {
      await _storage.write(_storageKey, mode._key);
    } catch (_) {}
  }
}

final themeProvider = StateNotifierProvider<ThemeNotifier, AppThemeMode>((ref) {
  return ThemeNotifier(ref.read(secureStorageProvider));
});
