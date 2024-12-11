import logger from "./logger.js";

// Handle the fallback functionality
export default function handleFallback(request) {
  logger.info('Handling fallback request');
  
  return {
    "status" : "handled",
    "message": "Fallback Response: Please define this question and try again"
  };
}
