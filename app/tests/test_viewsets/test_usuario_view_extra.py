import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from usuarios.models.usuario import User
from app.models import Cartorio


@pytest.mark.django_db
class TestUsuarioViewSetExtra:

    def setup_method(self):
        self.client = APIClient()

        self.cartorio1 = Cartorio.objects.create(nome="Cartorio 1")
        self.cartorio2 = Cartorio.objects.create(nome="Cartorio 2")

        self.superadmin = User.objects.create_user(
            email="superadmin@test.com",
            password="123",
            role="superadmin",
        )

        self.admin = User.objects.create_user(
            email="admin@test.com",
            password="123",
            role="admin",
            cartorio=self.cartorio1,
        )

        self.admin_sem_cartorio = User.objects.create_user(
            email="admin2@test.com",
            password="123",
            role="admin",
        )

        self.user_cartorio1 = User.objects.create_user(
            email="user1@test.com",
            password="123",
            role="cliente",
            cartorio=self.cartorio1,
        )

        self.user_cartorio2 = User.objects.create_user(
            email="user2@test.com",
            password="123",
            role="cliente",
            cartorio=self.cartorio2,
        )

    # ==============================
    # LIST
    # ==============================

    def test_admin_so_ve_usuarios_do_proprio_cartorio(self):
        self.client.force_authenticate(self.admin)

        url = reverse("usuarios-list")
        response = self.client.get(url)

        assert response.status_code == 200
        ids = [u["id"] for u in response.data]

        assert self.user_cartorio1.id in ids
        assert self.user_cartorio2.id not in ids

    def test_superadmin_ve_todos(self):
        self.client.force_authenticate(self.superadmin)

        url = reverse("usuarios-list")
        response = self.client.get(url)

        assert response.status_code == 200
        ids = [u["id"] for u in response.data]

        assert self.user_cartorio1.id in ids
        assert self.user_cartorio2.id in ids

    def test_admin_sem_cartorio_nao_ve_nada(self):
        self.client.force_authenticate(self.admin_sem_cartorio)

        url = reverse("usuarios-list")
        response = self.client.get(url)

        assert response.status_code == 200
        assert response.data == []

    # ==============================
    # CREATE
    # ==============================

    def test_admin_cria_usuario_no_proprio_cartorio(self):
        self.client.force_authenticate(self.admin)

        url = reverse("usuarios-list")
        payload = {
            "email": "novo@test.com",
            "password": "123456",
            "role": "cliente",
        }

        response = self.client.post(url, payload)
        assert response.status_code == 201
        assert response.data["cartorio"] == self.cartorio1.id

    def test_admin_sem_cartorio_nao_pode_criar(self):
        self.client.force_authenticate(self.admin_sem_cartorio)

        url = reverse("usuarios-list")
        payload = {
            "email": "novo2@test.com",
            "password": "123456",
            "role": "cliente",
        }

        response = self.client.post(url, payload)
        assert response.status_code == 400

    def test_superadmin_cria_usuario(self):
        self.client.force_authenticate(self.superadmin)

        url = reverse("usuarios-list")
        payload = {
            "email": "supernovo@test.com",
            "password": "123456",
            "role": "admin",
        }

        response = self.client.post(url, payload)
        assert response.status_code == 201
        assert response.data["email"] == "supernovo@test.com"

    # ==============================
    # DESTROY
    # ==============================

    def test_nao_pode_desativar_a_si_mesmo(self):
        self.client.force_authenticate(self.admin)

        url = reverse("usuarios-detail", args=[self.admin.id])
        response = self.client.delete(url)

        assert response.status_code == 400

    def test_destroy_realiza_soft_delete(self):
        self.client.force_authenticate(self.superadmin)

        url = reverse("usuarios-detail", args=[self.user_cartorio1.id])
        response = self.client.delete(url)

        assert response.status_code == 204

        self.user_cartorio1.refresh_from_db()
        assert self.user_cartorio1.is_active is False

    # ==============================
    # ALTERAR ROLE
    # ==============================

    def test_alterar_role(self):
        self.client.force_authenticate(self.superadmin)

        url = reverse("usuarios-alterar-role", args=[self.user_cartorio1.id])
        response = self.client.post(url, {"role": "admin"})

        assert response.status_code == 200

        self.user_cartorio1.refresh_from_db()
        assert self.user_cartorio1.role == "admin"

    # ==============================
    # VINCULAR CARTORIO
    # ==============================

    def test_vincular_cartorio_superadmin(self):
        self.client.force_authenticate(self.superadmin)

        url = reverse("usuarios-vincular-cartorio", args=[self.user_cartorio1.id])
        response = self.client.post(url, {"cartorio_id": self.cartorio2.id})

        assert response.status_code == 200

        self.user_cartorio1.refresh_from_db()
        assert self.user_cartorio1.cartorio_id == self.cartorio2.id

    def test_admin_so_vincula_no_proprio_cartorio(self):
        self.client.force_authenticate(self.admin)

        url = reverse("usuarios-vincular-cartorio", args=[self.user_cartorio1.id])
        response = self.client.post(url, {"cartorio_id": self.cartorio2.id})

        assert response.status_code == 200

        self.user_cartorio1.refresh_from_db()
        assert self.user_cartorio1.cartorio_id == self.cartorio1.id
