package com.tuurio.authsample.auth

import android.content.Context
import android.content.Intent
import net.openid.appauth.AuthorizationException
import net.openid.appauth.AuthorizationRequest
import net.openid.appauth.AuthorizationResponse
import net.openid.appauth.AuthorizationService
import net.openid.appauth.AuthorizationServiceConfiguration
import net.openid.appauth.EndSessionRequest
import net.openid.appauth.ResponseTypeValues
import net.openid.appauth.TokenResponse

class AuthRepository(context: Context) {
    private val appContext = context.applicationContext
    private val serviceConfig = AuthorizationServiceConfiguration(
        AuthConfig.authorizeEndpoint,
        AuthConfig.tokenEndpoint,
    )
    private val authService = AuthorizationService(appContext)
    private val sessionStorage = SessionStorage(appContext)

    fun getAuthorizationIntent(): Intent {
        val request = AuthorizationRequest.Builder(
            serviceConfig,
            AuthConfig.clientId,
            ResponseTypeValues.CODE,
            AuthConfig.redirectUri,
        )
            .setScope(AuthConfig.scope)
            .build()

        return authService.getAuthorizationRequestIntent(request)
    }

    fun handleAuthorizationResult(
        intent: Intent?,
        callback: (TokenResponse?, String?) -> Unit,
    ) {
        if (intent == null) {
            callback(null, "Missing authorization response.")
            return
        }

        val response = AuthorizationResponse.fromIntent(intent)
        val exception = AuthorizationException.fromIntent(intent)

        if (response == null) {
            callback(null, exception?.errorDescription ?: "Authorization failed.")
            return
        }

        val tokenRequest = response.createTokenExchangeRequest()
        authService.performTokenRequest(tokenRequest) { tokenResponse, tokenException ->
            callback(tokenResponse, tokenException?.errorDescription)
        }
    }

    fun fetchEndSessionIntent(onReady: (Intent) -> Unit, onError: (String) -> Unit) {
        AuthorizationServiceConfiguration.fetchFromUrl(AuthConfig.discoveryUri) { config, ex ->
            if (ex != null || config == null) {
                onError(ex?.errorDescription ?: "Unable to load discovery document.")
                return@fetchFromUrl
            }

            val endSession = EndSessionRequest.Builder(config)
                .setPostLogoutRedirectUri(AuthConfig.postLogoutRedirectUri).build()
            val endSessionIntent = authService.getEndSessionRequestIntent(endSession)
            onReady(endSessionIntent)
        }
    }

    fun loadSession(): UserSession? = sessionStorage.load()

    fun saveSession(session: UserSession) {
        sessionStorage.save(session)
    }

    fun clearSession() {
        sessionStorage.clear()
    }

    fun dispose() {
        authService.dispose()
    }
}
