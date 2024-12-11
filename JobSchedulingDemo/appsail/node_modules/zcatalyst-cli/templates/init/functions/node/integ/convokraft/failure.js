import logger from "./logger.js";

// Handle the failure functionality
export default function handleFailure(request) {
  logger.info('Handling failure request');
  
  return {
    "message": "Failure Response: Please define this question and try again"
  };
}
