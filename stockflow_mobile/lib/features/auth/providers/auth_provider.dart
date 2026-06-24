import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/storage/secure_storage.dart';
import '../data/auth_models.dart';
import '../data/auth_repository.dart';

// ── State ──────────────────────────────────────────────────────────────────

enum AuthStatus { loading, authenticated, unauthenticated }

class AuthState {
  final AuthStatus status;
  final UserInfo? user;
  final String? error;

  const AuthState({
    required this.status,
    this.user,
    this.error,
  });

  bool get isAuthenticated => status == AuthStatus.authenticated;
  bool get isLoading => status == AuthStatus.loading;

  AuthState copyWith({
    AuthStatus? status,
    UserInfo? user,
    String? error,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      error: error,
    );
  }
}

// ── Notifier ───────────────────────────────────────────────────────────────

class AuthNotifier extends StateNotifier<AuthState> {
  final Ref _ref;

  AuthNotifier(this._ref)
      : super(const AuthState(status: AuthStatus.loading)) {
    _init();
  }

  SecureStorageService get _storage => _ref.read(secureStorageProvider);
  AuthRepository get _repo => _ref.read(authRepositoryProvider);

  Future<void> _init() async {
    try {
      final hasToken = await _storage.hasToken()
          .timeout(const Duration(seconds: 3), onTimeout: () => false);
      if (hasToken) {
        try {
          final userInfo = await _repo.getProfile()
              .timeout(const Duration(seconds: 5));
          state = AuthState(status: AuthStatus.authenticated, user: userInfo);
        } catch (_) {
          await _storage.clearAll()
              .timeout(const Duration(seconds: 2), onTimeout: () {});
          state = const AuthState(status: AuthStatus.unauthenticated);
        }
      } else {
        state = const AuthState(status: AuthStatus.unauthenticated);
      }
    } catch (_) {
      state = const AuthState(status: AuthStatus.unauthenticated);
    }
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(status: AuthStatus.loading, error: null);
    try {
      final response = await _repo.login(LoginRequest(email: email, password: password));
      await _storage.saveToken(response.token);
      if (response.refreshToken != null) {
        await _storage.saveRefreshToken(response.refreshToken!);
      }
      await _storage.saveUserInfo(
        userId: response.user.id,
        email: response.user.email,
        name: response.user.fullName,
      );
      state = AuthState(status: AuthStatus.authenticated, user: response.user);
    } catch (e) {
      state = AuthState(
        status: AuthStatus.unauthenticated,
        error: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> logout() async {
    await _repo.logout();
    await _storage.clearAll();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }
}

// ── Providers ─────────────────────────────────────────────────────────────

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref);
});

final currentUserProvider = Provider<UserInfo?>((ref) {
  return ref.watch(authProvider).user;
});
