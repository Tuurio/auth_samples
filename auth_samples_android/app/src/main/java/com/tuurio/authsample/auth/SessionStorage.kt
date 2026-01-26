package com.tuurio.authsample.auth

import android.content.Context

class SessionStorage(context: Context) {
  private val prefs = context.getSharedPreferences("tuurio_auth_session", Context.MODE_PRIVATE)

  fun save(session: UserSession) {
    prefs.edit()
      .putString(KEY_ACCESS_TOKEN, session.accessToken)
      .putString(KEY_ID_TOKEN, session.idToken)
      .putString(KEY_SCOPE, session.scope)
      .putLong(KEY_EXPIRES_AT, session.expiresAtMillis ?: 0L)
      .putString(KEY_PROFILE, session.profileJson)
      .apply()
  }

  fun load(): UserSession? {
    val accessToken = prefs.getString(KEY_ACCESS_TOKEN, null) ?: return null
    val idToken = prefs.getString(KEY_ID_TOKEN, null)
    val scope = prefs.getString(KEY_SCOPE, null)
    val expiresAt = prefs.getLong(KEY_EXPIRES_AT, 0L).takeIf { it > 0L }
    val profile = prefs.getString(KEY_PROFILE, null)

    if (expiresAt != null && expiresAt <= System.currentTimeMillis()) {
      clear()
      return null
    }

    return UserSession(
      accessToken = accessToken,
      idToken = idToken,
      scope = scope,
      expiresAtMillis = expiresAt,
      profileJson = profile,
    )
  }

  fun clear() {
    prefs.edit().clear().apply()
  }

  private companion object {
    private const val KEY_ACCESS_TOKEN = "access_token"
    private const val KEY_ID_TOKEN = "id_token"
    private const val KEY_SCOPE = "scope"
    private const val KEY_EXPIRES_AT = "expires_at"
    private const val KEY_PROFILE = "profile"
  }
}
