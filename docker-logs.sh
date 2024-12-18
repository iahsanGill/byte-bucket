#!/bin/bash

# List of services
services=("user-service" "storage-service" "usage-monitoring-service" "logging-service")

# Start a new tmux session
tmux new-session -d -s logs

# Create a pane for each service and tail the logs
for i in "${!services[@]}"; do
    if [ $i -eq 0 ]; then
        tmux send-keys "docker logs -f ${services[$i]}" C-m
    else
        tmux split-window -h
        tmux send-keys "docker logs -f ${services[$i]}" C-m
        tmux select-layout tiled
    fi
        tmux select-layout tiled
    fi
done

# Attach to the tmux session
tmux attach-session -t logs