package com.tuurio.authsample.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tuurio.authsample.auth.UserSession
import com.tuurio.authsample.auth.decodeJwt
import com.tuurio.authsample.auth.formatTime

@Immutable
data class ShellStatus(val label: String, val tone: StatusTone)

enum class StatusTone { Good, Neutral, Bad }

@Composable
fun AppBackground(content: @Composable () -> Unit) {
  val background = Brush.radialGradient(
    colors = listOf(
      Color(0xFFF7E9D7),
      Color(0xFFF6F3EA),
      Color(0xFFEDF3F2),
      Color(0xFFE6EEF2),
    ),
  )
  Box(
    modifier = Modifier
      .fillMaxSize()
      .background(background),
  ) {
    content()
  }
}

@Composable
fun Shell(status: ShellStatus, content: @Composable () -> Unit) {
  BoxWithConstraints(
    modifier = Modifier
      .fillMaxSize()
      .padding(horizontal = 24.dp, vertical = 32.dp),
  ) {
    val isWide = maxWidth >= 960.dp
    if (isWide) {
      Row(
        modifier = Modifier.fillMaxSize(),
        horizontalArrangement = Arrangement.spacedBy(32.dp),
      ) {
        SidePanel(status, Modifier.weight(1f))
        MainPanel(content, Modifier.weight(1.2f))
      }
    } else {
      Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(24.dp),
      ) {
        MainPanel(content, Modifier.fillMaxWidth())
        SidePanel(status, Modifier.fillMaxWidth())
      }
    }
  }
}

@Composable
private fun SidePanel(status: ShellStatus, modifier: Modifier) {
  Column(
    modifier = modifier.verticalScroll(rememberScrollState()),
    verticalArrangement = Arrangement.spacedBy(32.dp),
  ) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) {
      Box(
        modifier = Modifier
          .size(44.dp)
          .clip(RoundedCornerShape(14.dp))
          .background(Brush.linearGradient(listOf(Color(0xFF0EA5A4), Color(0xFFF59E0B)))),
        contentAlignment = Alignment.Center,
      ) {
        Text("tu", color = Color.White, fontWeight = FontWeight.Bold, letterSpacing = 1.2.sp)
      }
      Column {
        Text("Tuurio Auth Studio", fontWeight = FontWeight.SemiBold)
        Text("OIDC playground for OAuth 2.1", color = Color(0xFF64748B), fontSize = 13.sp)
      }
    }

    CardSurface {
      Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(
          "Design for secure sign-in.",
          fontFamily = FontFamily.Serif,
          fontWeight = FontWeight.Bold,
          fontSize = 28.sp,
        )
        Text(
          "A minimal Android client that signs in with OpenID Connect, displays decoded tokens, and supports secure logout redirects.",
          color = Color(0xFF64748B),
        )
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
          StatusPill(status)
          Text("Authority: test.id.tuurio.com", color = Color(0xFF64748B), fontSize = 13.sp)
        }
      }
    }

    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
      InfoItem("Architecture", "Authorization code flow + PKCE")
      InfoItem("Storage", "Session storage for tokens")
      InfoItem("Scope", "openid profile email")
    }
  }
}

@Composable
private fun MainPanel(content: @Composable () -> Unit, modifier: Modifier) {
  Column(
    modifier = modifier.verticalScroll(rememberScrollState()),
    verticalArrangement = Arrangement.spacedBy(24.dp),
  ) {
    content()
  }
}

@Composable
private fun InfoItem(title: String, body: String) {
  Column {
    Text(
      title.uppercase(),
      color = Color(0xFF0F766E),
      fontWeight = FontWeight.SemiBold,
      fontSize = 12.sp,
      letterSpacing = 1.4.sp,
    )
    Spacer(modifier = Modifier.height(4.dp))
    Text(body, fontWeight = FontWeight.Medium)
  }
}

@Composable
private fun StatusPill(status: ShellStatus) {
  val background = when (status.tone) {
    StatusTone.Good -> Color(0x2E0EA5A4)
    StatusTone.Neutral -> Color(0x140F172A)
    StatusTone.Bad -> Color(0x33F87171)
  }
  val textColor = when (status.tone) {
    StatusTone.Good -> Color(0xFF0F766E)
    StatusTone.Neutral -> Color(0xFF0F172A)
    StatusTone.Bad -> Color(0xFFB91C1C)
  }
  Box(
    modifier = Modifier
      .clip(RoundedCornerShape(999.dp))
      .background(background)
      .padding(horizontal = 12.dp, vertical = 6.dp),
  ) {
    Text(status.label, color = textColor, fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
  }
}

@Composable
fun CardSurface(tone: CardTone = CardTone.Solid, content: @Composable () -> Unit) {
  val background = when (tone) {
    CardTone.Solid -> Color.White
    CardTone.Soft -> Color(0xFFF8F4EC)
    CardTone.Panel -> Color(0xFFFEFAF4)
  }
  Surface(
    color = background,
    shape = RoundedCornerShape(18.dp),
    shadowElevation = 6.dp,
    modifier = Modifier.fillMaxWidth(),
  ) {
    Column(modifier = Modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
      content()
    }
  }
}

enum class CardTone { Solid, Soft, Panel }

@Composable
fun LoadingState(title: String, subtitle: String) {
  Row(horizontalArrangement = Arrangement.spacedBy(16.dp), verticalAlignment = Alignment.CenterVertically) {
    Spinner()
    Column {
      Text(title, fontWeight = FontWeight.SemiBold, fontSize = 20.sp)
      Text(subtitle, color = Color(0xFF64748B))
    }
  }
}

@Composable
private fun Spinner() {
  Box(
    modifier = Modifier
      .size(32.dp)
      .clip(RoundedCornerShape(50))
      .background(Color(0x1A0F172A)),
  )
}

@Composable
fun LoginView(error: String?, onLogin: () -> Unit) {
  Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
    CardSurface {
      Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("OAuth 2.1 + OpenID Connect", color = Color(0xFF0F766E), fontSize = 12.sp, letterSpacing = 1.4.sp)
        Text("Sign in to continue", fontWeight = FontWeight.SemiBold, fontSize = 22.sp)
        Text(
          "This app uses the authorization code flow with PKCE to fetch tokens securely for a browser-based client.",
          color = Color(0xFF64748B),
        )
      }
      Spacer(modifier = Modifier.height(12.dp))
      Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Button(
          onClick = onLogin,
          colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0EA5A4)),
          shape = RoundedCornerShape(999.dp),
          modifier = Modifier.fillMaxWidth(),
        ) {
          Text("Continue with Tuurio ID", color = Color.White, fontWeight = FontWeight.SemiBold)
        }
        Text("You'll be redirected to test.id.tuurio.com", color = Color(0xFF64748B), fontSize = 13.sp)
      }
      if (!error.isNullOrBlank()) {
        Spacer(modifier = Modifier.height(12.dp))
        StatusMessage(error)
      }
    }

    CardSurface(tone = CardTone.Soft) {
      FeatureItem("PKCE by default", "Proof Key for Code Exchange protects the code flow.")
      FeatureItem("Short-lived tokens", "Access tokens are scoped to openid profile email.")
      FeatureItem("Session aware", "Token state is persisted in session storage.")
    }
  }
}

@Composable
fun TokenView(session: UserSession, onLogout: () -> Unit) {
  val scopeLabel = session.scope ?: "openid profile email"
  val expiresLabel = formatTime(session.expiresAtMillis)

  Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
    CardSurface {
      Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Session ready", color = Color(0xFF0F766E), fontSize = 12.sp, letterSpacing = 1.4.sp)
        Text("You're signed in", fontWeight = FontWeight.SemiBold, fontSize = 22.sp)
        Text(
          "Tokens expire at $expiresLabel and are scoped for $scopeLabel.",
          color = Color(0xFF64748B),
        )
      }
      Spacer(modifier = Modifier.height(12.dp))
      Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        OutlinedButton(
          onClick = onLogout,
          shape = RoundedCornerShape(999.dp),
        ) {
          Text("Logout")
        }
        Text("Tokens expire automatically; logout revokes session.", color = Color(0xFF64748B), fontSize = 13.sp)
      }
    }

    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
      TokenPanel("Access Token", session.accessToken, "Used to call protected APIs.")
      TokenPanel("ID Token", session.idToken ?: "", "Proves the authenticated user.")
    }

    CardSurface(tone = CardTone.Soft) {
      Text("User profile", fontWeight = FontWeight.SemiBold)
      CodeBlock(session.profileJson ?: "No profile claims.")
    }
  }
}

@Composable
private fun FeatureItem(title: String, body: String) {
  Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
    Text(title, fontWeight = FontWeight.SemiBold)
    Text(body, color = Color(0xFF64748B))
  }
}

@Composable
private fun StatusMessage(message: String) {
  Box(
    modifier = Modifier
      .clip(RoundedCornerShape(999.dp))
      .background(Color(0x33F87171))
      .padding(horizontal = 12.dp, vertical = 6.dp),
  ) {
    Text(message, color = Color(0xFFB91C1C), fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
  }
}

@Composable
private fun TokenPanel(title: String, token: String, description: String) {
  val clipboard = LocalClipboardManager.current
  val copied = remember { mutableStateOf(false) }
  val decoded = remember(token) { decodeJwt(token) }

  CardSurface(tone = CardTone.Panel) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.Top,
      ) {
        Column(modifier = Modifier.weight(1f)) {
          Text(title, fontWeight = FontWeight.SemiBold)
          Text(description, color = Color(0xFF64748B), fontSize = 13.sp)
        }
        TextButton(onClick = {
          clipboard.setText(androidx.compose.ui.text.AnnotatedString(token))
          copied.value = true
        }) {
          Text(if (copied.value) "Copied" else "Copy")
        }
      }
      CodeBlock(if (token.isBlank()) "Not provided" else token)
      Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text("Decoded claims", color = Color(0xFF0F766E), fontSize = 12.sp, letterSpacing = 1.4.sp)
        CodeBlock(decoded ?: "Not a JWT or unable to decode.")
      }
    }
  }
}

@Composable
private fun CodeBlock(content: String) {
  Surface(
    color = Color(0xFFF8FAFC),
    shape = RoundedCornerShape(12.dp),
  ) {
    Text(
      content,
      fontFamily = FontFamily.Monospace,
      fontSize = 12.sp,
      modifier = Modifier.padding(16.dp),
    )
  }
}
