from django.test import SimpleTestCase
from django.urls import reverse, resolve


class TestAppUrls(SimpleTestCase):
    def test_dashboard_url_exists(self):
        url = reverse("dashboard-list")
        self.assertIsNotNone(resolve(url))
