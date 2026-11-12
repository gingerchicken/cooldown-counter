#!/usr/bin/env bash

# Transcribe one audio file or a stable, sequential collection through the local
# Whisper server and retain the server's verbose JSON response for later review.
set -euo pipefail

# Display usage information without contacting Docker or the Whisper service.
print_usage() {
    cat <<'USAGE'
Usage:
  transcribe-audio.sh INPUT [--output-dir DIR] [--server-url URL]
      [--language CODE] [--overwrite]

INPUT may be one audio file or a directory containing audio files. Directory
inputs are processed in stable path order. The server must already be ready.

Environment:
  WHISPER_API_KEY  Optional Bearer token for an authenticated server.
USAGE
}

# Stop early when the caller asks for help so an incomplete invocation is clear.
if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
    print_usage
    exit 0
fi

# Require an input path before parsing optional settings.
if [[ $# -lt 1 ]]; then
    print_usage >&2
    exit 64
fi

# The input path identifies the file or directory that will be sent to Whisper.
input_path=$1
shift

# Store raw JSON responses in a caller-selected directory unless the caller
# supplies another location explicitly.
output_dir="transcription-output"

# Address the local or reverse-proxied Whisper API used for every request.
server_url="http://127.0.0.1:9000"

# Override automatic language detection only when the caller knows the audio
# language and supplies its BCP-47 language code.
language=""

# Reprocessing is opt-in so an earlier source response is not silently replaced.
overwrite=false

# Parse the small option set while rejecting misspelled flags rather than
# accidentally treating them as audio paths or API parameters.
while [[ $# -gt 0 ]]; do
    case "$1" in
        --output-dir)
            if [[ $# -lt 2 ]]; then
                echo "--output-dir requires a directory" >&2
                exit 64
            fi
            output_dir=$2
            shift 2
            ;;
        --server-url)
            if [[ $# -lt 2 ]]; then
                echo "--server-url requires a URL" >&2
                exit 64
            fi
            server_url=$2
            shift 2
            ;;
        --language)
            if [[ $# -lt 2 ]]; then
                echo "--language requires a BCP-47 language code" >&2
                exit 64
            fi
            language=$2
            shift 2
            ;;
        --overwrite)
            overwrite=true
            shift
            ;;
        --help|-h)
            print_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1" >&2
            print_usage >&2
            exit 64
            ;;
    esac
done

# Confirm the required command-line tools before creating output directories or
# making network requests, which gives a useful failure on minimal hosts.
for required_command in curl find sort mktemp; do
    if ! command -v "$required_command" >/dev/null 2>&1; then
        echo "Required command is missing: $required_command" >&2
        exit 127
    fi
done

# Resolve the input path so relative directory names cannot change meaning while
# the collection is being processed.
if [[ ! -e "$input_path" ]]; then
    echo "Input does not exist: $input_path" >&2
    exit 66
fi

# Hold the ordered list of supported audio files that will be sent to the API.
declare -a audio_files=()

# Build the collection using null delimiters so spaces and other safe filename
# characters remain intact. Unsupported files are ignored rather than uploaded.
if [[ -f "$input_path" ]]; then
    audio_files+=("$input_path")
elif [[ -d "$input_path" ]]; then
    while IFS= read -r -d '' audio_file; do
        audio_files+=("$audio_file")
    done < <(
        find "$input_path" -type f \( \
            -iname '*.aac' -o \
            -iname '*.flac' -o \
            -iname '*.m4a' -o \
            -iname '*.mp3' -o \
            -iname '*.mp4' -o \
            -iname '*.ogg' -o \
            -iname '*.wav' -o \
            -iname '*.webm' \
        \) -print0 | sort -z
    )
else
    echo "Input is neither a file nor a directory: $input_path" >&2
    exit 66
fi

# Refuse an empty collection because a successful no-op would be easy to mistake
# for a completed transcription run.
if [[ ${#audio_files[@]} -eq 0 ]]; then
    echo "No supported audio files found under: $input_path" >&2
    exit 66
fi

# Create the destination only after all argument and input checks have passed.
mkdir -p "$output_dir"

# Remove a trailing slash so endpoint construction is stable for either the
# default local URL or a caller-supplied reverse-proxy URL.
server_url=${server_url%/}

# Build the optional authentication header without ever printing its secret.
declare -a auth_arguments=()
if [[ -n "${WHISPER_API_KEY:-}" ]]; then
    auth_arguments+=("-H" "Authorization: Bearer ${WHISPER_API_KEY}")
fi

# Add the language form field only when a known language was supplied, leaving
# Whisper's automatic detection as the default for mixed or unknown recordings.
declare -a language_arguments=()
if [[ -n "$language" ]]; then
    language_arguments+=("-F" "language=$language")
fi

# Process one file at a time so GPU memory use is predictable and each output
# can be associated with exactly one source path.
for audio_file in "${audio_files[@]}"; do
    # Flatten relative path separators into the output name so nested source
    # directories do not cause unplanned output directories to be created.
    if [[ -d "$input_path" ]]; then
        relative_name=${audio_file#"$input_path"/}
    else
        relative_name=$(basename "$audio_file")
    fi
    output_name=${relative_name//\//__}
    output_name=${output_name%.*}.verbose.json
    output_path="$output_dir/$output_name"

    # Preserve an existing response unless the caller explicitly requests a
    # fresh inference run; this protects source evidence from accidental loss.
    if [[ -e "$output_path" && "$overwrite" != true ]]; then
        echo "Skipping existing response: $output_path"
        continue
    fi

    # Use a temporary file so an interrupted HTTP response cannot look like a
    # valid completed JSON transcription in the output directory.
    temporary_output=$(mktemp "$output_dir/.transcription.XXXXXX")
    cleanup_temporary_output() {
        rm -f "$temporary_output"
    }
    trap cleanup_temporary_output EXIT

    # Request verbose JSON so downstream documentation can retain language,
    # duration and segment timestamps instead of losing useful source context.
    echo "Transcribing: $audio_file"
    curl --fail-with-body --silent --show-error \
        "${auth_arguments[@]}" \
        "$server_url/v1/audio/transcriptions" \
        -F "file=@$audio_file" \
        -F 'model=whisper-1' \
        -F 'response_format=verbose_json' \
        "${language_arguments[@]}" \
        > "$temporary_output"

    # A successful HTTP response must still contain JSON before it is promoted
    # to the durable output name. Downstream processing can inspect the response
    # with its available tools without adding a JSON parser dependency here.
    if [[ ! -s "$temporary_output" ]]; then
        echo "Whisper returned an empty response for: $audio_file" >&2
        exit 74
    fi

    mv "$temporary_output" "$output_path"
    trap - EXIT
    echo "Wrote: $output_path"
done
