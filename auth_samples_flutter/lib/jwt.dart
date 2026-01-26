import 'dart:convert';

Map<String, dynamic>? decodeJwt(String? token) {
  if (token == null || token.isEmpty) return null;
  final parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    final payload = utf8.decode(base64Url.decode(base64Url.normalize(parts[1])));
    return json.decode(payload) as Map<String, dynamic>;
  } catch (_) {
    return null;
  }
}

String formatUnixTime(int? seconds) {
  if (seconds == null || seconds <= 0) return 'unknown time';
  final date = DateTime.fromMillisecondsSinceEpoch(seconds * 1000);
  return date.toLocal().toString();
}
