package com.tuurio.authsample;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
public class SecurityConfig {
  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http, ClientRegistrationRepository registrations)
      throws Exception {
    OidcClientInitiatedLogoutSuccessHandler oidcLogout =
        new OidcClientInitiatedLogoutSuccessHandler(registrations);
    oidcLogout.setPostLogoutRedirectUri("{baseUrl}/");

    http
        .authorizeHttpRequests(
            auth ->
                auth
                    .requestMatchers("/assets/**", "/", "/login", "/error", "/oauth2/authorization/**", "/auth/callback")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .oauth2Login(
            oauth ->
                oauth
                    .loginPage("/login")
                    .redirectionEndpoint(
                        redirection -> redirection.baseUri("/auth/callback"))
                    .failureHandler((request, response, exception) -> {
                      request.getSession().setAttribute("auth_error", exception.getMessage());
                      response.sendRedirect("/");
                    }))
        .logout(
            logout ->
                logout
                    .logoutRequestMatcher(new AntPathRequestMatcher("/logout", "GET"))
                    .logoutSuccessHandler(oidcLogout))
        .csrf(csrf -> csrf.disable());

    return http.build();
  }
}
