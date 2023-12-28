#!/bin/sh -e

# Initial failed status
FAILED=0

# Stop the bot
pm2 stop bot

# Fetch latest git and install dependencies. Capture failure if this step fails.
(
    git fetch origin main &&
    git reset --hard FETCH_HEAD &&
    git clean -d -f &&
    npm install --omit=dev
) || FAILED=1

# Restart the bot
pm2 start bot

# Exit script with failure if one has been captured
exit ${FAILED}
