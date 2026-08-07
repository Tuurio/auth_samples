package com.tuurio.authsample;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestCustomizers;
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
  @Value("${TUURIO_POST_LOGOUT_REDIRECT_URI:{baseUrl}/logout/callback}")
  private String postLogoutRedirectUri;

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http, ClientRegistrationRepository registrations)
      throws Exception {
    OidcClientInitiatedLogoutSuccessHandler oidcLogout =
        new OidcClientInitiatedLogoutSuccessHandler(registrations);
    oidcLogout.setPostLogoutRedirectUri(postLogoutRedirectUri);
    DefaultOAuth2AuthorizationRequestResolver authorizationRequestResolver =
        new DefaultOAuth2AuthorizationRequestResolver(registrations, "/oauth2/authorization");
    authorizationRequestResolver.setAuthorizationRequestCustomizer(
        OAuth2AuthorizationRequestCustomizers.withPkce());

    http
        .authorizeHttpRequests(
            auth ->
                auth
                    .requestMatchers(
                        "/assets/**",
                        "/",
                        "/login",
                        "/logout/callback",
                        "/error",
                        "/oauth2/authorization/**",
                        "/auth/callback",
                        "/webhooks/**")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .oauth2Login(
            oauth ->
                oauth
                    .loginPage("/login")
                    .authorizationEndpoint(endpoint ->
                        endpoint.authorizationRequestResolver(authorizationRequestResolver))
                    .redirectionEndpoint(
                        redirection -> redirection.baseUri("/auth/callback"))
                    .failureHandler((request, response, exception) -> {
                      request.getSession().setAttribute("auth_error", exception.getMessage());
                      response.sendRedirect("/");
                    }))
        .logout(logout -> logout.logoutSuccessHandler(oidcLogout))
        .csrf(csrf -> csrf.ignoringRequestMatchers("/webhooks/**"));

    return http.build();
  }
}
