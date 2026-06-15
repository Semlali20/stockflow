class LoginRequest {
  final String email;
  final String password;

  const LoginRequest({required this.email, required this.password});

  // Backend expects "usernameOrEmail" (accepts either a username or an email).
  // Sending "email" leaves usernameOrEmail blank -> 400 validation error.
  Map<String, dynamic> toJson() =>
      {'usernameOrEmail': email, 'password': password};
}

class LoginResponse {
  final String token;
  final String? refreshToken;
  final UserInfo user;

  const LoginResponse({
    required this.token,
    this.refreshToken,
    required this.user,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      token: json['token'] as String? ??
          json['accessToken'] as String? ??
          json['access_token'] as String? ??
          '',
      refreshToken: json['refreshToken'] as String? ?? json['refresh_token'] as String?,
      user: UserInfo.fromJson(
        json['user'] as Map<String, dynamic>? ?? json,
      ),
    );
  }
}

class UserInfo {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String? role;
  final String? avatarUrl;

  const UserInfo({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    this.role,
    this.avatarUrl,
  });

  String get fullName => '$firstName $lastName'.trim();

  String get initials {
    final f = firstName.isNotEmpty ? firstName[0] : '';
    final l = lastName.isNotEmpty ? lastName[0] : '';
    return '$f$l'.toUpperCase();
  }

  factory UserInfo.fromJson(Map<String, dynamic> json) {
    return UserInfo(
      id: json['id']?.toString() ?? json['userId']?.toString() ?? '',
      email: json['email'] as String? ?? '',
      firstName: json['firstName'] as String? ??
          json['first_name'] as String? ??
          json['username'] as String? ??
          '',
      lastName: json['lastName'] as String? ?? json['last_name'] as String? ?? '',
      role: json['role'] as String?,
      avatarUrl: json['avatarUrl'] as String? ?? json['avatar'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'firstName': firstName,
        'lastName': lastName,
        'role': role,
        'avatarUrl': avatarUrl,
      };
}
