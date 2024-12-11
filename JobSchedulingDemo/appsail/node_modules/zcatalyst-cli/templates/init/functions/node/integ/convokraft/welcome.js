import logger from "./logger.js";

// Handle the welcome functionality
export default function handleWelcome(request) {
  logger.info('Handling welcome request');
  
  return {
    "welcome_response": {
      "message": "Welcome to your Bot. Please ask your queries"
    }
  };
}
