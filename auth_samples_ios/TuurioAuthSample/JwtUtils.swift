import Foundation

func decodeJwt(_ token: String?) -> String? {
  guard let token, !token.isEmpty else { return nil }
  let parts = token.split(separator: ".")
  guard parts.count >= 2 else { return nil }

  let payload = String(parts[1])
  guard let data = base64UrlDecode(payload) else { return nil }
  guard let jsonObject = try? JSONSerialization.jsonObject(with: data),
        let jsonData = try? JSONSerialization.data(withJSONObject: jsonObject, options: [.prettyPrinted]),
        let json = String(data: jsonData, encoding: .utf8) else {
    return nil
  }
  return json
}

func formatDate(_ date: Date?) -> String {
  guard let date else { return "unknown time" }
  let formatter = DateFormatter()
  formatter.dateStyle = .medium
  formatter.timeStyle = .short
  return formatter.string(from: date)
}

private func base64UrlDecode(_ value: String) -> Data? {
  var base64 = value.replacingOccurrences(of: "-", with: "+")
    .replacingOccurrences(of: "_", with: "/")
  let pad = 4 - base64.count % 4
  if pad < 4 {
    base64 += String(repeating: "=", count: pad)
  }
  return Data(base64Encoded: base64)
}
