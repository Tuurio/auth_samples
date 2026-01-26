import SwiftUI

enum AppTheme {
  static let ink = Color(red: 15 / 255, green: 23 / 255, blue: 42 / 255)
  static let muted = Color(red: 100 / 255, green: 116 / 255, blue: 139 / 255)
  static let accent = Color(red: 14 / 255, green: 165 / 255, blue: 164 / 255)
  static let accentStrong = Color(red: 15 / 255, green: 118 / 255, blue: 110 / 255)
  static let sun = Color(red: 245 / 255, green: 158 / 255, blue: 11 / 255)
  static let surface = Color.white
  static let surfaceSoft = Color(red: 248 / 255, green: 244 / 255, blue: 236 / 255)
  static let surfacePanel = Color(red: 254 / 255, green: 250 / 255, blue: 244 / 255)
  static let line = Color.black.opacity(0.12)

  static let background = RadialGradient(
    colors: [
      Color(red: 247 / 255, green: 233 / 255, blue: 215 / 255),
      Color(red: 246 / 255, green: 243 / 255, blue: 234 / 255),
      Color(red: 237 / 255, green: 243 / 255, blue: 242 / 255),
      Color(red: 230 / 255, green: 238 / 255, blue: 242 / 255),
    ],
    center: .topLeading,
    startRadius: 20,
    endRadius: 900
  )
}
