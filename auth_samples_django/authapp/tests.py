from django.test import TestCase
from unittest.mock import patch

from tuurio_starter import settings

class StarterRoutesTest(TestCase):
    def test_home_is_available_without_configuration(self):
        self.assertEqual(self.client.get("/").status_code, 200)

    def test_dashboard_requires_session(self):
        response = self.client.get("/dashboard")
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.headers["Location"], "/")

    def test_rejects_cleartext_non_loopback_redirect(self):
        with patch.object(settings, "TUURIO_ISSUER", "https://test.id.tuurio.com"), \
             patch.object(settings, "TUURIO_CLIENT_ID", "test-client"), \
             patch.object(settings, "TUURIO_REDIRECT_URI", "http://example.com/auth/callback"):
            with self.assertRaisesRegex(RuntimeError, "must use HTTPS"):
                settings.validate_tuurio_config()
