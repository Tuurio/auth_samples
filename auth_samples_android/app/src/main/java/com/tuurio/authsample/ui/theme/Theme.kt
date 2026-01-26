package com.tuurio.authsample.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColors = lightColorScheme(
  primary = Color(0xFF0EA5A4),
  secondary = Color(0xFFF59E0B),
  tertiary = Color(0xFF0F766E),
  background = Color(0xFFF6F3EA),
  surface = Color(0xFFFFFFFF),
  onPrimary = Color.White,
  onSecondary = Color.White,
  onBackground = Color(0xFF0F172A),
  onSurface = Color(0xFF0F172A),
)

private val DarkColors = darkColorScheme(
  primary = Color(0xFF5EEAD4),
  secondary = Color(0xFFFBBF24),
  tertiary = Color(0xFF2DD4BF),
  background = Color(0xFF0B1120),
  surface = Color(0xFF111827),
  onPrimary = Color(0xFF0B1120),
  onSecondary = Color(0xFF0B1120),
  onBackground = Color(0xFFE2E8F0),
  onSurface = Color(0xFFE2E8F0),
)

@Composable
fun AppTheme(content: @Composable () -> Unit) {
  val colors = if (isSystemInDarkTheme()) DarkColors else LightColors
  MaterialTheme(
    colorScheme = colors,
    content = content,
  )
}
