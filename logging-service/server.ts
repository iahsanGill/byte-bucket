import listenToLoggingChannel from "./services/logging.service";

// Start listening for log events
listenToLoggingChannel();

console.log("Logging Service is running and listening to logging-channel");
