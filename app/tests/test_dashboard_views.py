from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

User = get_user_model()


class DashboardViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/v1/dashboard/"

        # helper: criar user mínimo
        def mkuser(
            username: str,
            role=None,
            is_staff=False,
            is_superuser=False,
            cargo_judicial=None,
        ):
            u = User.objects.create_user(
                email=f"{username}@test.com",
                username=username,
                password="123456",
            )

            if role is not None:
                u.role = role

            if cargo_judicial is not None:
                u.cargo_judicial = cargo_judicial

            u.is_staff = is_staff
            u.is_superuser = is_superuser
            u.save()
            return u


        roles_cls = getattr(User, "Roles", None)
        cargos_cls = getattr(User, "CargosJudiciais", None) or getattr(User, "CargoJudicial", None)

        self.role_superadmin = getattr(roles_cls, "SUPERADMIN", "superadmin") if roles_cls else "superadmin"
        self.role_admin = getattr(roles_cls, "ADMIN", "admin") if roles_cls else "admin"
        self.role_prof = (
            getattr(roles_cls, "PROFISSIONAL", None)
            or getattr(roles_cls, "PROFISSIONAL_JUDICIAL", None)
            or "profissional"
        ) if roles_cls else "profissional"

        self.role_juiz = getattr(roles_cls, "JUIZ", "juiz") if roles_cls else "juiz"
        self.cargo_juiz = getattr(cargos_cls, "JUIZ", "juiz") if cargos_cls else "juiz"

        self.superadmin = mkuser("super", role=self.role_superadmin, is_staff=True, is_superuser=True)
        self.admin = mkuser("admin", role=self.role_admin, is_staff=True, is_superuser=False)
        self.prof = mkuser("prof", role=self.role_prof, is_staff=False, is_superuser=False)
        self.juiz = mkuser("juiz", role=self.role_juiz, cargo_judicial=self.cargo_juiz)

    def _assert_payload_shape(self, data):
        self.assertIn("cards", data)
        self.assertIn("agendamentos", data)
        self.assertIn("atendimentos", data)
        self.assertIn("documentos", data)

        self.assertIsInstance(data["cards"], list)

        for key in ["agendamentos", "atendimentos", "documentos"]:
            self.assertIn("total", data[key])
            self.assertIn("por_status", data[key])

    def test_dashboard_superadmin(self):
        self.client.force_authenticate(user=self.superadmin)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self._assert_payload_shape(response.data)

    def test_dashboard_admin(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self._assert_payload_shape(response.data)

    def test_dashboard_profissional(self):
        self.client.force_authenticate(user=self.prof)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self._assert_payload_shape(response.data)

    def test_dashboard_juiz(self):
        self.client.force_authenticate(user=self.juiz)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self._assert_payload_shape(response.data)

    def test_dashboard_anonimo_nao_permitido(self):
        response = self.client.get(self.url)
        self.assertIn(response.status_code, (401, 403))
