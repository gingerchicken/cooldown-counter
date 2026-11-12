#!/usr/bin/env python
"""Run Django management commands from the Python application boundary."""

import os
import sys

from django.core.management import execute_from_command_line

# Explicit callers can select test settings without changing the normal entry point.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# Django owns command validation, exit codes, and its interactive user prompts.
if __name__ == "__main__":
    execute_from_command_line(sys.argv)
