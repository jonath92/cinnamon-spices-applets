#!/bin/bash

CURRENT_DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
APPLET_NAME=$(basename $CURRENT_DIR)
CINNAMON_VERSION=4.6
LOCAL_TESTING_DIR=$HOME/.local/share/cinnamon/applets/${APPLET_NAME}/${CINNAMON_VERSION}
BUILD_DIR=${CURRENT_DIR}/files/${APPLET_NAME}/${CINNAMON_VERSION}

npx webpack
# when webpack succeeded. Must be directly behind the command
if [ $? -eq 0 ]; then 

    # Creates the directory including parents if not already existing, removes existing content if dir exist, copies the build dir recursively.  
    mkdir -p ${LOCAL_TESTING_DIR}
    rm -r ${LOCAL_TESTING_DIR}
    cp -r ${BUILD_DIR} ${LOCAL_TESTING_DIR}

    # # Restart cinnamon to adopt the changes
    xdotool key ctrl+alt+0xff1b
fi