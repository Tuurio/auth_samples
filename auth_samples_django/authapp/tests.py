from django.test import TestCase
from unittest.mock import Mock, patch

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

    @patch("authapp.views.oauth.tuurio")
    def test_callback_rejects_userinfo_subject_mismatch(self, client):
        client.authorize_access_token.return_value = {
            "access_token": "server-side-token",
            "userinfo": {"sub": "validated-subject"},
        }
        client.load_server_metadata.return_value = {"userinfo_endpoint": "https://issuer.example/userinfo"}
        userinfo_response = Mock()
        userinfo_response.json.return_value = {"sub": "different-subject"}
        client.get.return_value = userinfo_response

        response = self.client.get("/auth/callback")

        self.assertEqual(response.status_code, 400)
        self.assertNotIn("tuurio_user", self.client.session)

    @patch("authapp.views.oauth.tuurio")
    @patch("authapp.views.validate_tuurio_config")
    def test_logout_flushes_session_before_redirect(self, _validate, client):
        session = self.client.session
        session["tuurio_user"] = {"sub": "subject"}
        session["tuurio_id_token"] = "server-side-id-token"
        session.save()
        client.load_server_metadata.return_value = {"end_session_endpoint": "https://issuer.example/logout"}

        response = self.client.get("/auth/logout")

        self.assertEqual(response.status_code, 302)
        self.assertTrue(response.headers["Location"].startswith("https://issuer.example/logout?"))
        self.assertNotIn("tuurio_user", self.client.session)
        self.assertNotIn("tuurio_id_token", self.client.session)
