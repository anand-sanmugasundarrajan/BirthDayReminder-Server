import logger from "./logger.js";

// Handle the execute functionality
export default function handleExecute(request) {
  logger.info('Handling execute request');
  let result = "";
//      This is where Your Execution Logic will be written, The Request body will have the params. you can fetch them from request.params 
//      After computation set the RESPONSE as follows : {"message": "Result of addition is " + result}. 
//      For example below code will add two numbers coming as params number1 and number2 and setting result
//      const params = request.params;
//      result = parseInt(params.number1) + parseInt(params.number2);

  return {
    "message": "Bot Response : " + result
  };
}
