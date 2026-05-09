#!/usr/bin/env bash
# Builds perry to wasm and drops the bindings into src/wasm/perry/.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PEARTERM_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
OUT_DIR="${PEARTERM_ROOT}/src/wasm/perry"

PERRY_REPO="${PERRY_REPO:-https://github.com/cbloodsworth/perry.git}"
PERRY_REF="${PERRY_REF:-main}"
PERRY_SRC="${PERRY_SRC:-}"

if ! command -v wasm-pack >/dev/null 2>&1; then
    echo "error: wasm-pack not found. Install with:" >&2
    echo "  curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh" >&2
    exit 1
fi

if [[ -n "${PERRY_SRC}" ]]; then
    echo "Using local perry checkout at ${PERRY_SRC}"
    PERRY_DIR="${PERRY_SRC}"
else
    PERRY_DIR="$(mktemp -d -t perry-XXXXXX)"
    trap 'rm -rf "${PERRY_DIR}"' EXIT
    echo "Cloning ${PERRY_REPO} (${PERRY_REF}) into ${PERRY_DIR}"
    git clone --depth 1 --branch "${PERRY_REF}" "${PERRY_REPO}" "${PERRY_DIR}"
fi

mkdir -p "${OUT_DIR}"
echo "Building perry to wasm: ${OUT_DIR}"
wasm-pack build "${PERRY_DIR}" \
    --target web \
    --out-dir "${OUT_DIR}" \
    --features wasm

echo "perry wasm bindings written to ${OUT_DIR}"