package com.tuurio.authsample.auth

import android.net.Uri

object AuthConfig {
  val authorizeEndpoint: Uri = Uri.parse("https://test.id.tuurio.com/oauth2/authorize")
  val tokenEndpoint: Uri = Uri.parse("https://test.id.tuurio.com/oauth2/token")
  const val clientId: String = "spa-K53I"
  val redirectUri: Uri = Uri.parse("com.example.app://oauth2redirect")
  const val scope: String = "openid profile email"

  val discoveryUri: Uri = Uri.parse("https://test.id.tuurio.com/.well-known/openid-configuration")
  val postLogoutRedirectUri: Uri = Uri.parse("http://localhost:5173/")
}
