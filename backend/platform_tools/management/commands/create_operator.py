"""Create a normal operator through hidden prompts, leaving fleet grants explicit."""

from getpass import getpass

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.db import IntegrityError, transaction


class Command(BaseCommand):
    """Provision a Django login without public signup or unnecessary administrator access."""

    # Setup exposes only a username; secrets never belong in arguments, logs or a shared default.
    help = "Create an ordinary operator using hidden password prompts"

    def add_arguments(self, parser):
        """Require a deliberate login identity while keeping its password out of shell history."""
        # Username follows the configured Django principal's standard validation rules.
        parser.add_argument("--username", required=True)

    @transaction.atomic
    def handle(self, *args, **options):
        """Validate identity and both secret entries before atomically saving one principal."""
        # The configured Django model owns hashing, uniqueness and authentication semantics.
        user_model = get_user_model()
        # Operator privileges stay ordinary; fleet owners grant tenant permissions separately.
        operator = user_model(
            **{user_model.USERNAME_FIELD: options["username"]},
            is_staff=False,
            is_superuser=False,
            is_active=True,
        )
        try:
            # An existing identity is rejected before prompting and is never silently reset.
            operator.full_clean(exclude=["password"])
            # Both secrets remain local to this command invocation and are never echoed.
            password = getpass("Password: ")
            confirmation = getpass("Password again: ")
            if password != confirmation:
                # A typing error must leave no partially created principal.
                raise CommandError("The passwords do not match.")
            validate_password(password, user=operator)
            operator.set_password(password)
            operator.save()
        except ValidationError as error:
            # Validation contains only field/policy explanations, never the supplied password.
            raise CommandError(" ".join(error.messages)) from error
        except IntegrityError as error:
            # Concurrent provisioning of the same username still cannot overwrite an account.
            raise CommandError("This operator already exists.") from error
        except (EOFError, KeyboardInterrupt) as error:
            # Interrupted prompts abort the transaction without leaving an unusable identity.
            raise CommandError("Operator creation cancelled.") from error
        self.stdout.write(self.style.SUCCESS(f"Created operator {operator.get_username()}."))
