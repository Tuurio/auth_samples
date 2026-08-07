package com.tuurio.authsample.auth

import java.text.DateFormat
import java.util.Date

fun formatTime(epochMillis: Long?): String {
  if (epochMillis == null || epochMillis <= 0L) return "unknown time"
  val formatter = DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT)
  return formatter.format(Date(epochMillis))
}
