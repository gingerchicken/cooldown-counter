"""Provision ordinary Django operators without sharing passwords or granting staff privileges."""

from io import StringIO

import pytest
from django.core.management import call_command
from django.core.management.base import CommandError

# Provisioning is verified against the isolated Django user database.
pytestmark = pytest.mark.django_db


def test_create_operator_uses_hidden_password_and_no_global_privileges(
    monkeypatch, django_user_model
):
    """Local setup creates an authenticatable ordinary principal, not another administrator."""
    # The secret exists only inside this test and must never be written to command output.
    secret = "UnrelatedStrongCredential!9428"
    monkeypatch.setattr(
        "platform_tools.management.commands.create_operator.getpass", lambda _prompt: secret
    )
    # Captured output proves setup does not reveal the newly chosen credential.
    output = StringIO()
    call_command("create_operator", username="fleet-operator", stdout=output)
    # This is the real Django user that subsequent login and membership grants can reference.
    operator = django_user_model.objects.get(username="fleet-operator")
    assert operator.check_password(secret)
    assert operator.is_active
    assert not operator.is_staff
    assert not operator.is_superuser
    assert secret not in output.getvalue()


@pytest.mark.parametrize(
    "passwords", [("short", "short"), ("UnrelatedStrongCredential!9428", "other")]
)
def test_invalid_operator_credentials_leave_no_partial_user(
    monkeypatch, django_user_model, passwords
):
    """Weak or mismatched secrets fail before the new principal is persisted."""
    # Ordered prompt values model two hidden entries without introducing a command-line password.
    entries = iter(passwords)
    monkeypatch.setattr(
        "platform_tools.management.commands.create_operator.getpass", lambda _prompt: next(entries)
    )
    with pytest.raises(CommandError):
        # A rejected setup must not leave an account with an unusable or unintended password.
        call_command("create_operator", username="rejected-operator")
    assert not django_user_model.objects.filter(username="rejected-operator").exists()


def test_existing_operator_is_not_silently_reset(monkeypatch, django_user_model):
    """Provisioning cannot overwrite an existing principal or reset its established credentials."""
    # Existing credentials remain an independent account-recovery responsibility.
    operator = django_user_model.objects.create_user(username="existing", password="original")
    monkeypatch.setattr(
        "platform_tools.management.commands.create_operator.getpass",
        lambda _prompt: "UnrelatedStrongCredential!9428",
    )
    with pytest.raises(CommandError):
        # An explicit failure is safer than treating a provisioning retry as a password reset.
        call_command("create_operator", username="existing")
    operator.refresh_from_db()
    assert operator.check_password("original")
