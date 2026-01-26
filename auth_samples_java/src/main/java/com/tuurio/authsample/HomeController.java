package com.tuurio.authsample;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;

import jakarta.servlet.http.HttpSession;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.client.RestClient;

@Controller
public class HomeController {
  private static final DateTimeFormatter TIME_FORMAT =
      DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").withZone(ZoneId.systemDefault());

  private final RestClient restClient = RestClient.create();

  @GetMapping("/login")
  public String login() {
    return "redirect:/oauth2/authorization/tuurio";
  }

  @GetMapping("/")
  public String home(
      @AuthenticationPrincipal OidcUser user,
      @RegisteredOAuth2AuthorizedClient("tuurio") OAuth2AuthorizedClient client,
      HttpSession session,
      Model model) {

    boolean authenticated = user != null && client != null && client.getAccessToken() != null;
    String statusLabel = authenticated ? "Authenticated" : "Signed out";
    String statusTone = authenticated ? "good" : "neutral";

    model.addAttribute("statusLabel", statusLabel);
    model.addAttribute("statusTone", statusTone);
    model.addAttribute("authenticated", authenticated);

    String error = (String) session.getAttribute("auth_error");
    session.removeAttribute("auth_error");
    model.addAttribute("error", error);

    if (authenticated) {
      populateTokenModel(user, client, model);
    }

    return "index";
  }

  private void populateTokenModel(OidcUser user, OAuth2AuthorizedClient client, Model model) {
    OAuth2AccessToken accessToken = client.getAccessToken();
    OidcIdToken idToken = user.getIdToken();

    String scopeLabel = accessToken.getScopes().isEmpty()
        ? "openid profile email"
        : String.join(" ", accessToken.getScopes());
    String expiresLabel = accessToken.getExpiresAt() == null
        ? "unknown time"
        : TIME_FORMAT.format(accessToken.getExpiresAt());

    String accessDecoded = JwtUtils.decode(accessToken.getTokenValue());
    String idDecoded = idToken == null ? "Not a JWT or unable to decode." : JwtUtils.decode(idToken.getTokenValue());

    String profileJson = fetchUserInfo(client, accessToken);

    model.addAttribute("expiresLabel", expiresLabel);
    model.addAttribute("scopeLabel", scopeLabel);
    model.addAttribute("accessToken", accessToken.getTokenValue());
    model.addAttribute("idToken", idToken == null ? "" : idToken.getTokenValue());
    model.addAttribute("accessDecoded", accessDecoded);
    model.addAttribute("idDecoded", idDecoded);
    model.addAttribute("profileJson", profileJson);
  }

  private String fetchUserInfo(OAuth2AuthorizedClient client, OAuth2AccessToken accessToken) {
    try {
      String userInfoUri = client.getClientRegistration().getProviderDetails().getUserInfoEndpoint().getUri();
      if (userInfoUri == null || userInfoUri.isBlank()) {
        return "No profile data.";
      }

      Map<?, ?> data = restClient.get()
          .uri(userInfoUri)
          .headers(headers -> headers.setBearerAuth(accessToken.getTokenValue()))
          .retrieve()
          .body(Map.class);

      if (data == null || data.isEmpty()) {
        return "No profile data.";
      }

      return JwtUtils.prettyJson(data);
    } catch (Exception ex) {
      return "No profile data.";
    }
  }
}
