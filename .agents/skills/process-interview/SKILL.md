---
name: process-interview
description: Transcribe one or more meeting audio files with the local Docker Whisper server, classify the interview stage, and update only the evidence-supported project records through the matching intake skills.
---

# Process an interview recording

Use this skill when one or more recorded meeting or interview audio files need to be transcribed locally, classified against this repository's interview cycle, and used to update the linked project documentation.

This skill is for recorded audio files, not live captions or direct speaker recognition. A transcript is source evidence. It is not automatically a confirmed requirement, an approved scope decision, implementation evidence or client acceptance.

## Inputs and permission checks

Before processing, identify:

- the audio file or directory of audio files;
- the project root and any existing interview record or intake ID;
- the recording date, participants and roles if known;
- whether recording and transcription permission is confirmed;
- confidentiality, retention and redaction limits; and
- the intended output location for raw transcription and derived Markdown.

If permission or the confidentiality boundary is unknown, pause before writing a persistent transcript and ask for the missing decision. Do not infer permission from the fact that a file exists.

Read [interview-cycle.md](references/interview-cycle.md) when classifying the recording or choosing downstream skills. Read the relevant existing records before editing them.

## Start the local Whisper service

Check that Docker is available and that the host has the NVIDIA driver and NVIDIA Container Toolkit required by the CUDA image. If the `whisper` container is absent, use the requested service configuration:

```sh
docker run \
  --name whisper \
  --restart=always \
  --gpus=all \
  -v whisper-data:/var/lib/whisper \
  -p 9000:9000 \
  -d hwdsl2/whisper-server:cuda
```

If a container named `whisper` already exists, inspect its state and configuration. Reuse or start it when it is compatible; do not remove and recreate it merely to make the command match. Ask before changing a persistent container, volume or port binding.

The published port is unencrypted. Keep it on a trusted local network, or bind it to `127.0.0.1:9000:9000` and put an authenticated HTTPS reverse proxy in front of it before exposing it beyond the host. If authentication is configured, pass the Bearer token through `WHISPER_API_KEY` to the helper script and do not write the token into a transcript or project document.

Wait for `docker logs whisper` to report `Whisper speech-to-text server is ready` before sending audio. The first start may download the configured model into the persistent `whisper-data` volume.

## Transcribe one file or a collection

Use the bundled [transcribe-audio.sh](scripts/transcribe-audio.sh) helper after the server is ready. It sends files sequentially to `POST /v1/audio/transcriptions`, requests `verbose_json`, and writes one raw JSON response per input. Sequential processing avoids competing GPU requests and keeps the file order reproducible.

```sh
./.agents/skills/process-interview/scripts/transcribe-audio.sh \
  path/to/meeting-recordings \
  --output-dir path/to/transcription-output
```

The input may be one supported audio file or a directory. For a directory, the helper processes supported files in stable path order. Keep the raw JSON responses as restricted source evidence until the derived record has been checked. Do not overwrite an existing response unless `--overwrite` is explicitly selected.

The server accepts common ffmpeg-supported formats, including `mp3`, `mp4`, `m4a`, `wav`, `webm`, `ogg` and `flac`. Use the API's `language` option only when the language is known; otherwise leave language detection enabled. If the meeting needs speaker labels, enable diarization in the service configuration before transcription and treat the labels as model output that still needs checking. Never invent speaker names from voice or context.

## Create the source transcript record

After each response is returned:

1. Check that the JSON is valid and contains transcript text. Preserve the raw response beside the derived record or in the restricted output location selected by the project.
2. Create or update a source-faithful Markdown transcript using the repository's common interview record fields. Include the source filename, recording date if known, processing date, service/model configuration, output files, participants if known, permission status, confidentiality limits and evidence status.
3. Preserve the transcribed wording and segment timestamps. Correct layout and obvious formatting only. Do not silently rewrite uncertain speech, turn a model guess into a speaker name, or remove disagreement.
4. Mark uncertainty, inaudible sections, overlapping speech and unresolved identity as unresolved. Use the transcript's timestamps when routing a claim into another document.
5. Redact credentials, tokens, private keys and other exposed secrets before putting derived content into ordinary project documentation. Keep the unredacted source restricted, and record that redaction occurred without copying the secret.

If no local convention exists, use a dated record under `docs/interviews/records/` and keep the raw JSON outside the published documentation tree. Do not create a second competing project record when an existing interview note or transcript already exists.

## Classify the interview

Classify from the substance of the conversation, not the filename or the order in which the recording was supplied. A recording can cover more than one stage. Record:

- a primary stage and any secondary stages;
- the signals and timestamped evidence supporting each classification;
- confidence and competing interpretations;
- the earliest project record affected;
- questions that remain unanswered, with owner and evidence route; and
- the downstream skill or direct record update selected.

Use the stage mapping in [interview-cycle.md](references/interview-cycle.md). If the evidence does not distinguish stages, label the classification `Unclear` and use `$write-interview-questions` to create a small follow-up question set instead of guessing.

## Update the linked records

Apply updates in dependency order, starting with the earliest affected record. Use the matching local skills as sub-skills:

- Initial intake: update `docs/0-intake.md` using the existing intake guide and preserve the requester's wording, evidence labels and next action.
- User profile or persona: use `$write-user-profile`; use `$write-user-persona` only when a fictional representative is useful and can remain linked to an evidence-grounded profile.
- User story and MoSCoW: use `$write-user-story` for one coherent outcome. Do not turn several topics into one story.
- Example Mapping: use `$expand-user-story` to update the affected story's rules, examples and owned questions.
- Requirements review: use `$write-requirements` for requirements whose meaning, verification or traceability is supported. Record constraints and risks separately where the transcript supplies their source, owner and response.
- MVP and approval: use `$write-smart-task`, `$map-critical-path` or the approval-document skill only when the recording actually provides the inputs for that artefact. A discussion of a possible scope is not approval.
- Delivery review: update `docs/8-review.md` only when the recording is a delivery review and the approved scope, acceptance evidence and named reviewer are available.

When a transcript answers an existing unknown, update the record that owned the unknown and retain its prior wording or status where history matters. Preserve stable IDs, links, source locations, evidence labels and unresolved decisions. Do not baseline a rule, requirement, estimate, approval or acceptance result merely because someone said it in the recording.

If an answer changes an earlier actor, goal, benefit or scope boundary, return to the earliest affected record before updating downstream records. Do not hide the change in a later requirements or task document. If the recording exposes a gap rather than resolving it, use `$write-interview-questions` and leave the gap visible.

## Completion checks

Before finishing, verify that:

- every supplied audio file was processed or has a recorded failure reason;
- raw responses are valid, associated with the correct source file and retained under the stated access boundary;
- the Markdown transcript preserves source wording, timestamps and uncertainty;
- the interview classification has evidence and confidence rather than a guessed label;
- updates were made only to records supported by the transcript;
- links and stable IDs still resolve;
- the relevant downstream skill quality gates were run; and
- the final report separates transcription status, documentation status and any later participant or client confirmation still required.

Report GPU, Docker, audio-format, model, diarization and transcription errors plainly. Do not describe an unverified transcript as complete, accurate or accepted.

## Service reference

The Docker image documentation describes the OpenAI-compatible endpoint and response formats used here: <https://github.com/hwdsl2/docker-whisper>.
