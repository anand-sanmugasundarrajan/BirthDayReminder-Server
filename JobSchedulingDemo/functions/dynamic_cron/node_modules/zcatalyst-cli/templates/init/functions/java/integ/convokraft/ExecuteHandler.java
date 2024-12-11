import org.json.JSONObject;
import java.util.logging.Logger;

public class ExecuteHandler {
    Logger LOGGER = Logger.getLogger(ExecuteHandler.class.getName());
    public JSONObject handleExecuteRequest(JSONObject reqBody) throws Exception{
        LOGGER.info("Execution Handler : : " + reqBody.get("todo") + " : : : : Action : : : "+reqBody.getJSONObject("action").get("namespace"));
        JSONObject jsonResponse = new JSONObject();
        String message = "Bot Execute handler response:";
        
        // This is where Your Execution Logic will be written, The Request body will have the params. you can fetch them from reqBody.getJSONObject("params") . 
        // After computation set the RESPONSE as follows : jsonResponse.put("message", "Result of addition is " + result);. 
        // For example below code will add two numbers coming as params number1 and number2 and setting result
        //      JSONObject params = reqBody.getJSONObject("params");
        //      Long result = params.getLong("number1") + params.getLong("number2");
        //      message = message + " " + result;
        jsonResponse.put("message", message);
        return jsonResponse;
    }
}
