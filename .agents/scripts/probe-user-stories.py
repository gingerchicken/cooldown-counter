#!/usr/bin/env python3
"""Print or run a question probe for one INVEST user story.

The prompts reconstruct a concrete event, identify the user outcome, expose
rules and exceptions, and ask the client for a provisional MoSCoW category for
a named delivery. They do not write requirements or approve scope.
"""

from __future__ import annotations

import argparse
import json
from datetime import date


# Questions are grouped by the decision they support so a facilitator can skip
# irrelevant prompts while retaining a predictable note structure.
QUESTIONS = [
    {"key": "actor_and_trigger", "group": "Outcome", "prompt": "Who carried out this task on the recent occasion, and what made it necessary then?", "record": "Actor, profile/persona link and trigger."},
    {"key": "inputs_and_sequence", "group": "Outcome", "prompt": "What information did they start with, what happened next, and who had to act before they could continue?", "record": "Inputs, main actions, handoffs and dependencies."},
    {"key": "difficulty_and_workaround", "group": "Value", "prompt": "Where did the task become difficult, how was it handled, and what was the consequence?", "record": "Problem, workaround, cost and limitation."},
    {"key": "capability_and_benefit", "group": "Value", "prompt": "What task would the proposed capability help complete, and what would its result allow the user or someone else to do?", "record": "Capability and user benefit; keep interface ideas separate."},
    {"key": "rules_and_exceptions", "group": "Example Mapping", "prompt": "Which rule governed the decision, and when did a different route apply because of an exception or missing information?", "record": "Candidate rules, exception examples, access constraints and rule owner."},
    {"key": "success_and_acceptance", "group": "Testability", "prompt": "What result would demonstrate that the task was completed satisfactorily, and which example could we check together?", "record": "Observable acceptance example, expected result and reviewer."},
    {"key": "minimum_change", "group": "Small and independent", "prompt": "Which part needs to improve first, and what can remain manual or continue through the existing process for the initial release?", "record": "Smallest useful outcome, exclusions, workaround and dependencies."},
    {"key": "coverage_and_correction", "group": "Review", "prompt": "Whose experience could differ, and which part have we misunderstood or left uncertain?", "record": "Missing viewpoints, correction route, owner and evidence needed."},
    {"key": "moscow_priority", "group": "MoSCoW", "prompt": "For the named delivery, would it be unviable without this outcome? If not, is there a tolerable workaround, or is it a smaller additional benefit?", "record": "Must Have, Should Have, Could Have or Won't Have this time, with rationale."},
    {"key": "mvp_boundary", "group": "MoSCoW", "prompt": "Is this important for meeting the MVP's smallest complete useful result? What would we explicitly exclude if it is not included?", "record": "MVP relevance, omission consequence and explicit exclusion."},
]


def print_markdown() -> None:
    """Print the question probe as a structured Markdown interview guide."""
    # Session metadata makes the output traceable while keeping approval and
    # prioritisation separate from the act of asking the questions.
    print("# User-story probe notes\n")
    print(f"**Session date:** {date.today().isoformat()}\n")
    print("**Story candidate:** \n\n**Participant:** \n\n**Named delivery:** \n")
    print("**Evidence rule:** Keep reported, observed, proposed, provisional, conflicting and unknown claims distinct.\n")
    for number, question in enumerate(QUESTIONS, start=1):
        # Group headings explain why a follow-up is being asked and stop the
        # question list being treated as a mandatory script.
        print(f"## {number}. {question['group']}: {question['prompt']}\n")
        print(f"**Record:** {question['record']}\n")
        print("**Answer and evidence label:**\n\n")
        print("**Source, owner or decision-maker:**\n\n")


def print_json() -> None:
    """Print the question bank for machine-readable prompt composition."""
    # JSON preserves grouping and record intent for an external renderer without
    # embedding any project-specific answer.
    print(json.dumps(QUESTIONS, indent=2))


def run_interactive() -> None:
    """Collect answers and priority decisions in a terminal session."""
    # The script does not write files automatically; the caller can redirect or
    # copy the reviewed output after correcting transcription and interpretation.
    print("# User-story probe notes\n")
    print(f"**Session date:** {date.today().isoformat()}\n")
    for number, question in enumerate(QUESTIONS, start=1):
        # Ask one question at a time so the participant can provide a concrete
        # example rather than answering a compound questionnaire from memory.
        print(f"{number}. {question['prompt']}")
        answer = input("Answer (blank if unknown): ").strip()
        label = input("Evidence label: ").strip() or "Unknown"
        source = input("Source, owner or decision-maker: ").strip() or "TBD"
        print(f"\n## {number}. {question['group']}: {question['prompt']}\n")
        print(f"**Answer ({label}):** {answer or 'Unknown'}\n")
        print(f"**Record:** {question['record']}\n")
        print(f"**Source, owner or decision-maker:** {source}\n")


def main() -> int:
    """Parse the selected output mode and run the probe."""
    # Mutually exclusive modes make accidental mixed output impossible and keep
    # the default suitable for piping into an agent prompt.
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", action="store_true", help="Print question metadata as JSON.")
    parser.add_argument("--interactive", action="store_true", help="Ask the questions in the terminal.")
    arguments = parser.parse_args()
    if arguments.interactive and arguments.json:
        parser.error("--interactive and --json cannot be used together")
    if arguments.interactive:
        run_interactive()
    elif arguments.json:
        print_json()
    else:
        print_markdown()
    return 0


if __name__ == "__main__":
    # Importing exposes the question bank without starting an interview.
    raise SystemExit(main())
