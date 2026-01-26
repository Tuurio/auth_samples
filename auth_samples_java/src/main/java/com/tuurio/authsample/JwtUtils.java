package com.tuurio.authsample;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;

public final class JwtUtils {
  private static final ObjectMapper MAPPER = new ObjectMapper();

  private JwtUtils() {}

  public static String decode(String token) {
    if (token == null || token.isEmpty()) {
      return "Not a JWT or unable to decode.";
    }
    String[] parts = token.split("\\.");
    if (parts.length < 2) {
      return "Not a JWT or unable to decode.";
    }
    try {
      byte[] decoded = Base64.getUrlDecoder().decode(padBase64(parts[1]));
      return prettyJson(new String(decoded, StandardCharsets.UTF_8));
    } catch (Exception ex) {
      return "Not a JWT or unable to decode.";
    }
  }

  public static String prettyJson(String raw) {
    try {
      Object json = MAPPER.readValue(raw, Object.class);
      return MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(json);
    } catch (Exception ex) {
      return raw;
    }
  }

  public static String prettyJson(Map<?, ?> claims) {
    try {
      return MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(claims);
    } catch (Exception ex) {
      return "No profile data.";
    }
  }

  private static String padBase64(String value) {
    int padding = 4 - (value.length() % 4);
    if (padding == 4) {
      return value;
    }
    return value + "=".repeat(padding);
  }
}
