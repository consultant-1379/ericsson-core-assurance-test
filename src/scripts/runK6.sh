#!/bin/sh

k6 run --summary-export summary.json --out json=test-output.json /tests/main.js --http-debug
while true ; do sleep 2700s ; done > /dev/null
