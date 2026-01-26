package com.tuurio.authsample.auth

import android.util.Base64
import org.json.JSONObject
import java.nio.charset.StandardCharsets
import java.text.DateFormat
import java.util.Date

fun decodeJwt(token: String?): String? {
  if (token.isNullOrBlank()) return null
  val parts = token.split(".")
  if (parts.size < 2) return null

  return try {
    val decoded = Base64.decode(parts[1], Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP)
    val json = String(decoded, StandardCharsets.UTF_8)
    JSONObject(json).toString(2)
  } catch (_: Exception) {
    null
  }
}

fun formatTime(epochMillis: Long?): String {
  if (epochMillis == null || epochMillis <= 0L) return "unknown time"
  val formatter = DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT)
  return formatter.format(Date(epochMillis))
}
