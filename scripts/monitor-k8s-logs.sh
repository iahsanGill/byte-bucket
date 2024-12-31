#!/bin/bash

# Name of the tmux session
SESSION_NAME="k8s-logs"

# Pod names and their respective namespaces (if required, modify this section)
PODS=($(kubectl get pods | sed "1d" | awk '{print $1}'))

# Print the array to verify
echo "Pods: ${PODS[@]}"

# Create a new tmux session
tmux new-session -d -s $SESSION_NAME

# Iterate over pods and create a new pane for each
for i in "${!PODS[@]}"; do
  if [ $i -ne 0 ]; then
    tmux split-window -v
  fi
  tmux select-pane -t $i
  tmux send-keys "kubectl logs -f ${PODS[$i]} --all-containers=true" C-m
done

# Resize panes equally
tmux select-layout tiled

# Attach to the session
tmux attach-session -t $SESSION_NAME
