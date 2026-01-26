import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'auth_controller.dart';
import 'jwt.dart';

void main() {
  runApp(const AuthSampleApp());
}

class AuthSampleApp extends StatelessWidget {
  const AuthSampleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Tuurio Auth Flutter Demo',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0EA5A4),
          background: const Color(0xFFF6F3EA),
        ),
        scaffoldBackgroundColor: Colors.transparent,
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final AuthController controller = AuthController();

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        final status = _resolveStatus();
        return Container(
          decoration: const BoxDecoration(
            gradient: RadialGradient(
              center: Alignment.topLeft,
              radius: 1.2,
              colors: [
                Color(0xFFF7E9D7),
                Color(0xFFF6F3EA),
                Color(0xFFEDF3F2),
                Color(0xFFE6EEF2),
              ],
            ),
          ),
          child: SafeArea(
            child: LayoutBuilder(
              builder: (context, constraints) {
                final isWide = constraints.maxWidth >= 960;
                return Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: isWide ? 32 : 24,
                    vertical: isWide ? 32 : 24,
                  ),
                  child: isWide
                      ? Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(child: SidePanel(status: status)),
                            const SizedBox(width: 32),
                            Expanded(flex: 6, child: MainPanel(controller: controller)),
                          ],
                        )
                      : Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(child: MainPanel(controller: controller)),
                            const SizedBox(height: 24),
                            SidePanel(status: status),
                          ],
                        ),
                );
              },
            ),
          ),
        );
      },
    );
  }

  ShellStatus _resolveStatus() {
    if (controller.loading) {
      return const ShellStatus(label: 'Checking session', tone: StatusTone.neutral);
    }
    if (controller.session != null) {
      return const ShellStatus(label: 'Authenticated', tone: StatusTone.good);
    }
    return const ShellStatus(label: 'Signed out', tone: StatusTone.neutral);
  }
}

class MainPanel extends StatelessWidget {
  const MainPanel({super.key, required this.controller});

  final AuthController controller;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (controller.loading)
            CardSurface(
              child: LoadingState(
                title: 'Loading session',
                subtitle: 'Verifying tokens and session state.',
              ),
            )
          else if (controller.session != null)
            TokenView(
              session: controller.session!,
              onLogout: controller.logout,
            )
          else
            LoginView(
              error: controller.error,
              onLogin: controller.login,
            ),
        ],
      ),
    );
  }
}

class SidePanel extends StatelessWidget {
  const SidePanel({super.key, required this.status});

  final ShellStatus status;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(14),
                  gradient: const LinearGradient(
                    colors: [Color(0xFF0EA5A4), Color(0xFFF59E0B)],
                  ),
                ),
                child: const Center(
                  child: Text(
                    'tu',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.2,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 14),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Tuurio Auth Studio',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'OIDC playground for OAuth 2.1',
                    style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 32),
          CardSurface(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Design for secure sign-in.',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                    fontFamily: 'Serif',
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'A minimal Flutter client that signs in with OpenID Connect, displays decoded tokens, and supports secure logout redirects.',
                  style: TextStyle(color: Color(0xFF64748B)),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    StatusPill(status: status),
                    const SizedBox(width: 12),
                    const Text(
                      'Authority: test.id.tuurio.com',
                      style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
          const InfoItem(title: 'Architecture', body: 'Authorization code flow + PKCE'),
          const SizedBox(height: 16),
          const InfoItem(title: 'Storage', body: 'Session storage for tokens'),
          const SizedBox(height: 16),
          const InfoItem(title: 'Scope', body: 'openid profile email'),
        ],
      ),
    );
  }
}

class CardSurface extends StatelessWidget {
  const CardSurface({super.key, required this.child, this.tone = CardTone.solid});

  final Widget child;
  final CardTone tone;

  @override
  Widget build(BuildContext context) {
    final Color background;
    switch (tone) {
      case CardTone.soft:
        background = const Color(0xFFF8F4EC);
        break;
      case CardTone.panel:
        background = const Color(0xFFFEFAF4);
        break;
      case CardTone.solid:
      default:
        background = Colors.white;
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(18),
        boxShadow: const [
          BoxShadow(
            color: Color(0x140F172A),
            blurRadius: 24,
            offset: Offset(0, 12),
          ),
        ],
      ),
      child: child,
    );
  }
}

enum CardTone { solid, soft, panel }

enum StatusTone { good, neutral }

class ShellStatus {
  const ShellStatus({required this.label, required this.tone});

  final String label;
  final StatusTone tone;
}

class StatusPill extends StatelessWidget {
  const StatusPill({super.key, required this.status});

  final ShellStatus status;

  @override
  Widget build(BuildContext context) {
    final background = status.tone == StatusTone.good
        ? const Color(0x2E0EA5A4)
        : const Color(0x140F172A);
    final textColor = status.tone == StatusTone.good
        ? const Color(0xFF0F766E)
        : const Color(0xFF0F172A);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        status.label,
        style: TextStyle(
          color: textColor,
          fontWeight: FontWeight.w600,
          fontSize: 12,
        ),
      ),
    );
  }
}

class LoadingState extends StatelessWidget {
  const LoadingState({super.key, required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: const Color(0x1A0F172A), width: 3),
          ),
        ),
        const SizedBox(width: 16),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
            ),
            Text(subtitle, style: const TextStyle(color: Color(0xFF64748B))),
          ],
        ),
      ],
    );
  }
}

class LoginView extends StatelessWidget {
  const LoginView({super.key, required this.error, required this.onLogin});

  final String? error;
  final VoidCallback onLogin;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CardSurface(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'OAuth 2.1 + OpenID Connect',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF0F766E),
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Sign in to continue',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              const Text(
                'This app uses the authorization code flow with PKCE to fetch tokens securely for a browser-based client.',
                style: TextStyle(color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: onLogin,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0EA5A4),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
                  shape: const StadiumBorder(),
                ),
                child: const Text('Continue with Tuurio ID'),
              ),
              const SizedBox(height: 8),
              const Text(
                'You\'ll be redirected to test.id.tuurio.com',
                style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
              ),
              if (error != null) ...[
                const SizedBox(height: 12),
                StatusMessage(text: error!),
              ],
            ],
          ),
        ),
        const SizedBox(height: 20),
        const CardSurface(
          tone: CardTone.soft,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              FeatureItem(title: 'PKCE by default', body: 'Proof Key for Code Exchange protects the code flow.'),
              SizedBox(height: 12),
              FeatureItem(title: 'Short-lived tokens', body: 'Access tokens are scoped to openid profile email.'),
              SizedBox(height: 12),
              FeatureItem(title: 'Session aware', body: 'Token state is persisted in session storage.'),
            ],
          ),
        ),
      ],
    );
  }
}

class TokenView extends StatelessWidget {
  const TokenView({super.key, required this.session, required this.onLogout});

  final AuthSession session;
  final VoidCallback onLogout;

  @override
  Widget build(BuildContext context) {
    final scopeLabel = session.scope ?? 'openid profile email';
    final expiresLabel = formatUnixTime(session.expiresAt);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CardSurface(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Session ready',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF0F766E),
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'You\'re signed in',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Text(
                'Tokens expire at $expiresLabel and are scoped for $scopeLabel.',
                style: const TextStyle(color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 16),
              OutlinedButton(
                onPressed: onLogout,
                style: OutlinedButton.styleFrom(shape: const StadiumBorder()),
                child: const Text('Logout'),
              ),
              const SizedBox(height: 8),
              const Text(
                'Tokens expire automatically; logout revokes session.',
                style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        Wrap(
          spacing: 20,
          runSpacing: 20,
          children: [
            SizedBox(
              width: 360,
              child: TokenPanel(
                title: 'Access Token',
                token: session.accessToken,
                description: 'Used to call protected APIs.',
              ),
            ),
            SizedBox(
              width: 360,
              child: TokenPanel(
                title: 'ID Token',
                token: session.idToken ?? '',
                description: 'Proves the authenticated user.',
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
        CardSurface(
          tone: CardTone.soft,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'User profile (UserInfo)',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 12),
              CodeBlock(text: session.profileJson ?? 'No profile data.'),
            ],
          ),
        ),
      ],
    );
  }
}

class TokenPanel extends StatefulWidget {
  const TokenPanel({super.key, required this.title, required this.token, required this.description});

  final String title;
  final String token;
  final String description;

  @override
  State<TokenPanel> createState() => _TokenPanelState();
}

class _TokenPanelState extends State<TokenPanel> {
  bool copied = false;

  @override
  Widget build(BuildContext context) {
    final decoded = decodeJwt(widget.token);

    return CardSurface(
      tone: CardTone.panel,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.title,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      widget.description,
                      style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              OutlinedButton(
                onPressed: widget.token.isEmpty
                    ? null
                    : () {
                        Clipboard.setData(ClipboardData(text: widget.token));
                        setState(() {
                          copied = true;
                        });
                      },
                child: Text(copied ? 'Copied' : 'Copy'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          CodeBlock(text: widget.token.isEmpty ? 'Not provided' : widget.token, dark: true),
          const SizedBox(height: 12),
          const Text(
            'Decoded claims',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Color(0xFF0F766E),
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 8),
          CodeBlock(text: decoded == null ? 'Not a JWT or unable to decode.' : prettyJson(decoded)),
        ],
      ),
    );
  }
}

class FeatureItem extends StatelessWidget {
  const FeatureItem({super.key, required this.title, required this.body});

  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        Text(body, style: const TextStyle(color: Color(0xFF64748B))),
      ],
    );
  }
}

class StatusMessage extends StatelessWidget {
  const StatusMessage({super.key, required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0x33F87171),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        text,
        style: const TextStyle(
          color: Color(0xFFB91C1C),
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class InfoItem extends StatelessWidget {
  const InfoItem({super.key, required this.title, required this.body});

  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title.toUpperCase(),
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: Color(0xFF0F766E),
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(height: 4),
        Text(body, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
      ],
    );
  }
}

class CodeBlock extends StatelessWidget {
  const CodeBlock({super.key, required this.text, this.dark = false});

  final String text;
  final bool dark;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: dark ? const Color(0xFF101827) : const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0x1F0F172A)),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontFamily: 'monospace',
          fontSize: 12,
          color: dark ? Colors.white : const Color(0xFF0F172A),
        ),
      ),
    );
  }
}

String prettyJson(Map<String, dynamic> json) {
  return const JsonEncoder.withIndent('  ').convert(json);
}
