from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("auth/login", views.login, name="login"),
    path("auth/callback", views.callback, name="callback"),
    path("dashboard", views.dashboard, name="dashboard"),
    path("auth/logout", views.logout, name="logout"),
    path("logout/callback", views.logout_callback, name="logout_callback"),
]
