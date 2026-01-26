package com.tuurio.authsample.auth

import android.app.Application
import android.content.Intent
import androidx.lifecycle.AndroidViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update

class AuthViewModel(application: Application) : AndroidViewModel(application) {
  private val repository = AuthRepository(application)

  private val _uiState = MutableStateFlow(AuthUiState(loading = true))
  val uiState: StateFlow<AuthUiState> = _uiState

  init {
    loadSession()
  }

  fun startLogin(onIntentReady: (Intent) -> Unit) {
    _uiState.update { it.copy(error = null) }
    onIntentReady(repository.getAuthorizationIntent())
  }

  fun handleAuthResult(intent: Intent?) {
    _uiState.update { it.copy(loading = true) }
    repository.handleAuthorizationResult(intent) { tokenResponse, error ->
      if (tokenResponse == null) {
        _uiState.update { it.copy(loading = false, error = error ?: "Login failed.") }
        return@handleAuthorizationResult
      }

      val accessToken = tokenResponse.accessToken
      if (accessToken.isNullOrBlank()) {
        _uiState.update { it.copy(loading = false, error = "Missing access token.") }
        return@handleAuthorizationResult
      }

      val idToken = tokenResponse.idToken
      val profileJson = decodeJwt(idToken)

      val session = UserSession(
        accessToken = accessToken,
        idToken = idToken,
        scope = tokenResponse.scope,
        expiresAtMillis = tokenResponse.accessTokenExpirationTime,
        profileJson = profileJson,
      )
      repository.saveSession(session)
      _uiState.update { AuthUiState(loading = false, session = session) }
    }
  }

  fun startLogout(onIntentReady: (Intent) -> Unit) {
    _uiState.update { it.copy(error = null) }
    repository.fetchEndSessionIntent(
      onReady = { intent -> onIntentReady(intent) },
      onError = { message -> _uiState.update { it.copy(error = message) } },
    )
  }

  fun handleLogoutResult() {
    repository.clearSession()
    _uiState.update { AuthUiState(loading = false, session = null) }
  }

  private fun loadSession() {
    val session = repository.loadSession()
    _uiState.update { AuthUiState(loading = false, session = session) }
  }

  override fun onCleared() {
    repository.dispose()
    super.onCleared()
  }
}


data class AuthUiState(
  val loading: Boolean,
  val session: UserSession? = null,
  val error: String? = null,
)
