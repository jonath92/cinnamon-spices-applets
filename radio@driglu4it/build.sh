#!/usr/bin/env bash
CURRENT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
UUID="$(basename "$CURRENT_DIR")"
FILES_DIR=${CURRENT_DIR}/files/${UUID}

VERSION=4.6

rm -rf 
ln -s ${FILES_DIR}/icons ${FILES_DIR}/${VERSION}

npx lerna run build && cinnamon-install-spice applet && xdotool key ctrl+alt+0xff1b