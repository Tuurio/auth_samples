package com.tuurio.authsample;

import static org.assertj.core.api.Assertions.assertThat;

import tools.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.ui.ExtendedModelMap;

class HomeControllerTest {
  private HomeController controller;

  @BeforeEach
  void setUp() {
    controller = new HomeController(new ObjectMapper());
    ReflectionTestUtils.setField(controller, "authority", "https://test.id.tuurio.com");
  }

  @Test
  void loginUsesTheConfiguredOAuthClient() {
    assertThat(controller.login()).isEqualTo("redirect:/oauth2/authorization/tuurio");
  }

  @Test
  void signedOutHomeDoesNotExposeProtocolTokens() {
    ExtendedModelMap model = new ExtendedModelMap();
    MockHttpSession session = new MockHttpSession();

    assertThat(controller.home(null, null, session, model)).isEqualTo("index");
    assertThat(model.get("authenticated")).isEqualTo(false);
    assertThat(model.get("authorityHost")).isEqualTo("test.id.tuurio.com");
    assertThat(model).doesNotContainKeys("accessToken", "idToken", "refreshToken");
  }

  @Test
  void authenticationErrorsAreShownOnce() {
    ExtendedModelMap firstModel = new ExtendedModelMap();
    MockHttpSession session = new MockHttpSession();
    session.setAttribute("auth_error", "Authentication failed");

    controller.home(null, null, session, firstModel);
    assertThat(firstModel.get("error")).isEqualTo("Authentication failed");

    ExtendedModelMap secondModel = new ExtendedModelMap();
    controller.home(null, null, session, secondModel);
    assertThat(secondModel.get("error")).isNull();
  }
}
