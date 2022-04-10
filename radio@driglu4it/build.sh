#!/usr/bin/env bash
CURRENT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
UUID="$(basename "$CURRENT_DIR")"
FILES_DIR=${CURRENT_DIR}/files/${UUID}
VERSION=4.6
OUTPUT_DIR=${FILES_DIR}/${VERSION}

rm -rf ${OUTPUT_DIR} 
mkdir ${OUTPUT_DIR}
ln -s ${FILES_DIR}/icons ${OUTPUT_DIR}

cp ${CURRENT_DIR}/assets/* ${OUTPUT_DIR}

npx lerna run build && cinnamon-install-spice applet && xdotool key ctrl+alt+0xff1b