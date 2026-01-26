package com.tuurio.authsample

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.tuurio.authsample.auth.AuthUiState
import com.tuurio.authsample.auth.AuthViewModel
import com.tuurio.authsample.ui.AppBackground
import com.tuurio.authsample.ui.CardSurface
import com.tuurio.authsample.ui.LoadingState
import com.tuurio.authsample.ui.LoginView
import com.tuurio.authsample.ui.Shell
import com.tuurio.authsample.ui.ShellStatus
import com.tuurio.authsample.ui.StatusTone
import com.tuurio.authsample.ui.TokenView
import com.tuurio.authsample.ui.theme.AppTheme

class MainActivity : ComponentActivity() {
  private val viewModel: AuthViewModel by viewModels()
  private lateinit var authLauncher: ActivityResultLauncher<Intent>
  private lateinit var logoutLauncher: ActivityResultLauncher<Intent>

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    authLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
      viewModel.handleAuthResult(result.data)
    }

    logoutLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
      viewModel.handleLogoutResult()
    }

    setContent {
      AppTheme {
        val uiState by viewModel.uiState.collectAsState()
        AuthApp(uiState)
      }
    }
  }

  @Composable
  private fun AuthApp(uiState: AuthUiState) {
    AppBackground {
      Shell(status = resolveStatus(uiState)) {
        when {
          uiState.loading -> {
            CardSurface {
              LoadingState(
                title = "Loading session",
                subtitle = "Verifying tokens and session state.",
              )
            }
          }
          uiState.session != null -> {
            TokenView(session = uiState.session, onLogout = { startLogoutFlow() })
          }
          else -> {
            LoginView(error = uiState.error, onLogin = { startLoginFlow() })
          }
        }
      }
    }
  }

  private fun resolveStatus(uiState: AuthUiState): ShellStatus {
    return when {
      uiState.loading -> ShellStatus("Checking session", StatusTone.Neutral)
      uiState.session != null -> ShellStatus("Authenticated", StatusTone.Good)
      else -> ShellStatus("Signed out", StatusTone.Neutral)
    }
  }

  private fun startLoginFlow() {
    viewModel.startLogin { intent ->
      authLauncher.launch(intent)
    }
  }

  private fun startLogoutFlow() {
    viewModel.startLogout { intent ->
      logoutLauncher.launch(intent)
    }
  }
}
