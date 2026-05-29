#!/bin/bash

set -euo pipefail

OSU_ROOT="${1:?Usage: $0 <osu_repo_path> <output_path>}"
OUTPUT="${2:?Usage: $0 <osu_repo_path> <output_path>}"
PROJECT="$OSU_ROOT/Tools/ModDefaultSettingsExporter"

dotnet build "$PROJECT" --nologo --verbosity quiet
dotnet run --project "$PROJECT" --no-build -- --output "$OUTPUT"
