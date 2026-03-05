package com.tuurio.authsample;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WebhookController {
  private static final Logger log = LoggerFactory.getLogger(WebhookController.class);

  private final ObjectMapper objectMapper;

  @Value("${tuurio.webhook.id:}")
  private String webhookId;

  @Value("${tuurio.webhook.edit-url:}")
  private String webhookEditUrl;

  @Value("${tuurio.webhook.listen-path:/webhooks/tuurio}")
  private String webhookListenPath;

  @Value("${tuurio.webhook.api-key-header:X-Tuurio-Webhook-Key}")
  private String webhookApiKeyHeader;

  @Value("${tuurio.webhook.api-key:}")
  private String webhookApiKey;

  WebhookController(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  @PostConstruct
  void logStartup() {
    log.info("[tuurio-webhook] listening on http://localhost:8085{}", webhookListenPath);
    if (webhookEditUrl != null && !webhookEditUrl.isBlank()) {
      log.info("[tuurio-webhook] update endpoint URL after deployment at {}", webhookEditUrl);
    }
  }

  @PostMapping("${tuurio.webhook.listen-path:/webhooks/tuurio}")
  ResponseEntity<Map<String, Object>> receiveWebhook(
      HttpServletRequest request,
      @RequestBody(required = false) String body) {
    String providedApiKey = request.getHeader(webhookApiKeyHeader);
    if (webhookApiKey != null
        && !webhookApiKey.isBlank()
        && (providedApiKey == null || !webhookApiKey.equals(providedApiKey))) {
      log.warn("[tuurio-webhook] rejected request with invalid API key header");
      return ResponseEntity.status(401)
          .body(Map.of("accepted", false, "error", "invalid_api_key"));
    }

    Object payload = body;
    if (body != null && !body.isBlank()) {
      payload = parsePayload(body);
    }

    Map<String, Object> record = new LinkedHashMap<>();
    record.put("webhookId", webhookId == null || webhookId.isBlank() ? null : webhookId);
    record.put("eventType", headerOr(request, "X-Tuurio-Event", "unknown"));
    record.put("eventId", headerOr(request, "X-Tuurio-Event-Id", ""));
    record.put("signature", headerOr(request, "X-Tuurio-Signature", ""));
    record.put("payload", payload);

    log.info("[tuurio-webhook] event received {}", stringify(record));
    return ResponseEntity.accepted().body(Map.of("accepted", true));
  }

  private Object parsePayload(String body) {
    try {
      return objectMapper.readValue(body, Object.class);
    } catch (Exception ex) {
      return body;
    }
  }

  private String stringify(Object value) {
    try {
      return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(value);
    } catch (Exception ex) {
      return String.valueOf(value);
    }
  }

  private String headerOr(HttpServletRequest request, String name, String fallback) {
    String value = request.getHeader(name);
    return value == null || value.isBlank() ? fallback : value;
  }
}
