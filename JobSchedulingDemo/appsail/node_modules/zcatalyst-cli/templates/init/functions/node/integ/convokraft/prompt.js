import logger from "./logger.js";

// Handle the failure functionality
export default function handlePrompt(request) {
  logger.info('Handling Prompt request');
  logger.info('Params : ' + JSON.stringify(request.params));
  if(request.paramsToPrompt === undefined || request.paramsToPrompt.length === 0) {
    //This section will move the Bot to Execute handler as all params to prompt is completed.
    return {
      "todo" : "execute"
    };
  }
  //This section will let the Bot to filter each param using request.params. 
  //And the Previous Param that was prompted to user will be present in request.previousParam.name. 
  //We can write validation logics using that.
  return {
    "todo" : "prompt"
  };
}
