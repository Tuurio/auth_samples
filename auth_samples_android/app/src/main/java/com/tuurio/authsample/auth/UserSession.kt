package com.tuurio.authsample.auth

data class UserSession(
  val accessToken: String,
  val idToken: String?,
  val scope: String?,
  val expiresAtMillis: Long?,
  val profileJson: String?,
)
