#!/bin/bash

echo -n $(cat /proc/cpuinfo | grep -E "MHz|bogomips")

exit 0
