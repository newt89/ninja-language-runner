#!/usr/bin/env bash

MODEL_PATH="$HOME/.local/share/piper/en_US-lessac-high.onnx"
TMP_DIR="/tmp/piper_narrator"
CHUNK_SIZE=1200
PLAYER="mpv"

mkdir -p "$TMP_DIR"
rm -f "$TMP_DIR"/*

# =========================
# INPUT HANDLING
# =========================

INPUT_TEXT=""

if [ -p /dev/stdin ]; then
    # piped input
    INPUT_TEXT=$(cat)
elif [ -n "$1" ] && [ -f "$1" ]; then
    # file input
    INPUT_TEXT=$(cat "$1")
else
    # interactive input
    echo "Paste your text below. Press CTRL+D when done:"
    INPUT_TEXT=$(cat)
fi

if [ -z "$INPUT_TEXT" ]; then
    echo "No input provided."
    exit 1
fi

echo "$INPUT_TEXT" > "$TMP_DIR/full.txt"

# =========================
# SPLIT INTO CHUNKS
# =========================

awk -v size="$CHUNK_SIZE" '
{
    text = text $0 " "
}
END {
    while (length(text) > size) {
        split_point = size
        for (i = size; i > size-200 && i > 0; i--) {
            if (substr(text, i, 1) ~ /[.!?]/) {
                split_point = i+1
                break
            }
        }
        print substr(text, 1, split_point)
        text = substr(text, split_point+1)
    }
    if (length(text) > 0) print text
}
' "$TMP_DIR/full.txt" > "$TMP_DIR/chunks.txt"

# =========================
# SYNTH + PLAY
# =========================

i=0

while IFS= read -r chunk; do
    chunk_file="$TMP_DIR/chunk_$i.txt"

    echo "$chunk" > "$chunk_file"

    echo "[+] Speaking chunk $i..."

    piper \
        --model "$MODEL_PATH" \
        --input_file "$chunk_file" \
        | $PLAYER --no-terminal --really-quiet -

    ((i++))

done < "$TMP_DIR/chunks.txt"

echo "[✓] Done."
