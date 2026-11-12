#!/usr/bin/env python3
"""Print or run a structured interview for user profiles and personas.

The question set follows the project paper's Appendix C.2 and keeps evidence,
assumptions and open questions separate so it can be handed to an agent or a
human facilitator without turning guesses into requirements.
"""

from __future__ import annotations

import argparse
import json
from datetime import date


# Each question has a stable key for notes, the prompt to ask, and the evidence
# that a useful answer should produce. Stable keys make transcript follow-up
# possible without depending on the display wording.
QUESTIONS = [
    {"key": "users_and_responsibilities", "prompt": "What would each group need to do, and who relies on their work?", "record": "Candidate groups, tasks, handoffs and affected non-users."},
    {"key": "recent_goal_and_work", "prompt": "Describe a recent occasion when someone needed to do this work. What were they trying to achieve, and what made it difficult?", "record": "Concrete goal, current approach, difficulty, consequence and source example."},
    {"key": "tools_and_confidence", "prompt": "Which tools do people use for comparable work, and what help did they need recently?", "record": "Tools, confidence, assistance and support provider."},
    {"key": "process_knowledge", "prompt": "What does a newcomer need explained, and how do people learn which rule applies or what happens next?", "record": "Familiar concepts, training, reference material and colleague knowledge."},
    {"key": "working_context", "prompt": "Where and how often does the work happen? Which devices or documents are used, and what interrupts it?", "record": "Location, frequency, devices, connectivity, documents and interruptions."},
    {"key": "access_and_support", "prompt": "What barriers have users reported when reading, entering or understanding information? What support do they use?", "record": "Reported language, accessibility or other needs and a route to confirm them."},
    {"key": "group_differences", "prompt": "How does the work differ for new, experienced or occasional users? Whose experience is missing?", "record": "Differences that justify a separate profile or a profile variant."},
    {"key": "evidence_and_follow_up", "prompt": "Which parts have you seen directly, and who can demonstrate or correct this account?", "record": "Reported, observed and assumed claims, evidence links, owners and users to involve."},
]


def build_markdown_header() -> str:
    """Return notes metadata that records the session boundary and evidence limits."""
    # The date is generated only for session provenance; it does not imply that
    # the resulting profile has been approved or that the user was observed.
    session_date = date.today().isoformat()
    return (
        "# User-profile probe notes\n\n"
        f"**Session date:** {session_date}\n\n"
        "**Facilitator:** \n\n"
        "**Participant or source:** \n\n"
        "**Evidence rule:** Label claims as recorded, observed, reported, proposed, provisional, conflicting or unknown.\n\n"
    )


def print_questions(as_json: bool) -> None:
    """Print the reusable question bank in Markdown or machine-readable JSON."""
    # JSON is useful when another tool will render a form; Markdown is easier
    # to use during a conversation and preserves the record prompts.
    if as_json:
        print(json.dumps(QUESTIONS, indent=2))
        return

    print(build_markdown_header(), end="")
    for number, question in enumerate(QUESTIONS, start=1):
        # The answer space deliberately asks for source and evidence status so
        # later persona writing cannot silently upgrade a reported claim.
        print(f"## {number}. {question['prompt']}\n")
        print(f"**Record:** {question['record']}\n")
        print("**Answer and evidence label:**\n\n")
        print("**Source or follow-up owner:**\n\n")


def run_interactive() -> None:
    """Collect short answers and render a human-reviewable Markdown note."""
    # The interactive mode is intentionally a simple terminal prompt: it has
    # no persistence or network access and leaves the facilitator in control of
    # what is retained.
    print(build_markdown_header(), end="")
    for number, question in enumerate(QUESTIONS, start=1):
        # Each answer is kept as plain text because participant uncertainty is
        # evidence that should not be normalised by the script.
        print(f"{number}. {question['prompt']}")
        answer = input("Answer (blank if unknown): ").strip()
        evidence_label = input("Evidence label: ").strip() or "Unknown"
        source = input("Source or follow-up owner: ").strip() or "TBD"
        print(f"\n## {number}. {question['prompt']}\n")
        print(f"**Answer ({evidence_label}):** {answer or 'Unknown'}\n")
        print(f"**Record:** {question['record']}\n")
        print(f"**Source or follow-up owner:** {source}\n")


def main() -> int:
    """Parse the probe mode and print the selected question set."""
    # CLI flags keep the helper useful both for a human interview and as a
    # deterministic prompt source for an agent skill.
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", action="store_true", help="Print question metadata as JSON.")
    parser.add_argument("--interactive", action="store_true", help="Ask the questions in the terminal.")
    arguments = parser.parse_args()
    if arguments.interactive and arguments.json:
        parser.error("--interactive and --json cannot be used together")
    if arguments.interactive:
        run_interactive()
    else:
        print_questions(arguments.json)
    return 0


if __name__ == "__main__":
    # Importing exposes the question bank without starting an interview.
    raise SystemExit(main())
