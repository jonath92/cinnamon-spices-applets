#!/bin/bash

CURRENT_DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

APPLET_NAME=$(basename $CURRENT_DIR)
LOCAL_TESTING_DIR=$HOME/.local/share/cinnamon/applets/${APPLET_NAME}/${CINNAMON_VERSION}
BUILD_DIR=${CURRENT_DIR}/files/${APPLET_NAME}/${CINNAMON_VERSION}

# --parent = no error if existing, make parent directories as needed
rm -r ${LOCAL_TESTING_DIR}

cp -r ${BUILD_DIR} ${LOCAL_TESTING_DIR}

# Restart cinnamon to adopt the changes
xdotool key ctrl+alt+0xff1b