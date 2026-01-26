import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_appauth/flutter_appauth.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'auth_config.dart';

class AuthSession {
  AuthSession({
    required this.accessToken,
    required this.idToken,
    required this.scope,
    required this.expiresAt,
    required this.profileJson,
  });

  final String accessToken;
  final String? idToken;
  final String? scope;
  final int? expiresAt;
  final String? profileJson;

  Map<String, dynamic> toJson() => {
        'accessToken': accessToken,
        'idToken': idToken,
        'scope': scope,
        'expiresAt': expiresAt,
        'profileJson': profileJson,
      };

  static AuthSession fromJson(Map<String, dynamic> json) {
    return AuthSession(
      accessToken: json['accessToken'] as String,
      idToken: json['idToken'] as String?,
      scope: json['scope'] as String?,
      expiresAt: json['expiresAt'] as int?,
      profileJson: json['profileJson'] as String?,
    );
  }
}

class AuthController extends ChangeNotifier {
  final FlutterAppAuth _appAuth = const FlutterAppAuth();
  static const _storageKey = 'tuurio_auth_session';
  String? _userInfoEndpoint;

  AuthSession? session;
  bool loading = true;
  String? error;

  AuthController() {
    _loadSession();
  }

  Future<void> login() async {
    error = null;
    notifyListeners();

    try {
      final result = await _appAuth.authorizeAndExchangeCode(
        AuthorizationTokenRequest(
          AuthConfig.clientId,
          AuthConfig.redirectUri,
          issuer: AuthConfig.issuer,
          scopes: AuthConfig.scopes,
        ),
      );

      if (result == null || result.accessToken == null) {
        error = 'Login failed.';
        notifyListeners();
        return;
      }

      final userInfo = await _fetchUserInfo(result.accessToken!);
      final session = AuthSession(
        accessToken: result.accessToken!,
        idToken: result.idToken,
        scope: result.scopes?.join(' '),
        expiresAt: result.accessTokenExpirationDateTime?.millisecondsSinceEpoch == null
            ? null
            : result.accessTokenExpirationDateTime!.millisecondsSinceEpoch ~/ 1000,
        profileJson: userInfo,
      );

      this.session = session;
      await _saveSession(session);
    } catch (e) {
      error = e.toString();
    }

    notifyListeners();
  }

  Future<void> logout() async {
    error = null;
    notifyListeners();

    try {
      await _appAuth.endSession(
        EndSessionRequest(
          idTokenHint: session?.idToken,
          postLogoutRedirectUrl: AuthConfig.postLogoutRedirectUri,
          issuer: AuthConfig.issuer,
        ),
      );
    } catch (e) {
      error = e.toString();
    }

    await _clearSession();
    notifyListeners();
  }

  Future<void> _loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_storageKey);
    if (raw != null) {
      try {
        final data = json.decode(raw) as Map<String, dynamic>;
        final stored = AuthSession.fromJson(data);
        if (stored.expiresAt != null && stored.expiresAt! <= DateTime.now().millisecondsSinceEpoch ~/ 1000) {
          await _clearSession();
        } else {
          session = stored;
        }
      } catch (_) {}
    }
    loading = false;
    notifyListeners();
  }

  Future<void> _saveSession(AuthSession session) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_storageKey, json.encode(session.toJson()));
  }

  Future<void> _clearSession() async {
    session = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_storageKey);
  }

  Future<String?> _fetchUserInfo(String accessToken) async {
    final endpoint = await _getUserInfoEndpoint();
    if (endpoint == null) return null;
    final response = await http.get(
      Uri.parse(endpoint),
      headers: {'Authorization': 'Bearer $accessToken'},
    );
    if (response.statusCode >= 400) return null;
    try {
      final data = json.decode(response.body) as Map<String, dynamic>;
      return const JsonEncoder.withIndent('  ').convert(data);
    } catch (_) {
      return null;
    }
  }

  Future<String?> _getUserInfoEndpoint() async {
    if (_userInfoEndpoint != null) return _userInfoEndpoint;
    final response = await http.get(
      Uri.parse('${AuthConfig.issuer}/.well-known/openid-configuration'),
    );
    if (response.statusCode >= 400) return null;
    try {
      final data = json.decode(response.body) as Map<String, dynamic>;
      _userInfoEndpoint = data['userinfo_endpoint'] as String?;
      return _userInfoEndpoint;
    } catch (_) {
      return null;
    }
  }
}
