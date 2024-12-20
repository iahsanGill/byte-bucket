#!/bin/bash

# List of services
containers=("user-service" "storage-service" "usage-monitoring-service" "logging-service" "view-generator-service")

# Start a new tmux session
tmux new-session -d -s logs

# Create a pane for each service and tail the logs
for i in "${!containers[@]}"; do
    if [ $i -eq 0 ]; then
        tmux rename-window -t logs:0 logs
        tmux send-keys "docker logs -f ${containers[$i]}" C-m
    else
        tmux split-window -h
        tmux send-keys "docker logs -f ${containers[$i]}" C-m
        tmux select-layout tiled
    fi
done

# Attach to the tmux session
tmux attach-session -t logs
