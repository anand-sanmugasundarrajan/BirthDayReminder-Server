import org.json.JSONObject;
import java.util.logging.Logger;

public class FailureHandler {
    Logger LOGGER = Logger.getLogger(FailureHandler.class.getName());
    public JSONObject handleFailureRequest(JSONObject reqBody) throws Exception{
        
        // This is your Failure Response Handler. You need to write the Failure Response when the bot Fails during execution of the function. The way to return Failure message is to be returned is as follows : 
        //      {
        //      "message", "Sorry, Something went wrong"
        //      }
        // Sample code to set the same is available Below.
        

        JSONObject jsonResponse = new JSONObject();
        LOGGER.info("Failure Handler : : TODO : " + reqBody.get("todo"));
        jsonResponse.put("message", "Sorry, Something went wrong");
        return jsonResponse;
    }
}
