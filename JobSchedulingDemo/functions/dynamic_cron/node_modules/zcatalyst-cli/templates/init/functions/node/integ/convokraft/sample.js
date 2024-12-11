import logger from './logger.js';
import IntegResponse from './integ-response.js';
import handleWelcome from './welcome.js';
import handleFallback from './fallback.js';
import handlePrompt from './prompt.js';
import handleExecute from './execute.js';
import handleFailure from './failure.js';
import { inspect } from 'util';

export default async (request, response) => {
  let jsonResponse = {};

  try {
    logger.info('REQUEST FLOW FOR : : : ' + request.todo);
    switch (request.todo) {
      case "welcome":
        jsonResponse = handleWelcome(request);
        break;
      case "prompt": 
        jsonResponse = handlePrompt(request);
        break;
      case "execute":
        jsonResponse = handleExecute(request);
        break;
      case "fallback":
        jsonResponse = handleFallback(request);
        break;
      case "failure":
        jsonResponse = handleFailure(request);
        break;
      default:
        jsonResponse = {
          "message": "Error Trying to parse your details"
        };
    }
  } catch (err) {
    logger.error('Error while executing handler: ' + err);
    logger.error('REQUEST OBJECT: ' + inspect(request));

    jsonResponse = {
      "message": "Error Trying to parse your details"
    };
  }
  //The Response has to be encapuslated into an IntegResponse Object
  response.end(new IntegResponse(jsonResponse));
};
