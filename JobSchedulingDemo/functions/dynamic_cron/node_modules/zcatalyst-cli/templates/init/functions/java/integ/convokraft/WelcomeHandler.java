import org.json.JSONObject;
import java.util.logging.Logger;

public class WelcomeHandler {
    Logger LOGGER = Logger.getLogger(WelcomeHandler.class.getName());
    public JSONObject handleWelcomeRequest(JSONObject reqBody) throws Exception{
        LOGGER.info("Welcome Handler: : TODO : "+ reqBody.get("todo"));
        // This is your Welcome message Handler. You need to write the default Welcome message your want your bot to greet its users. The way to return welcome message is as follows : 
        //      {
        //      "welcome_response" : {
        //      "message", "Welcome to your Bot. Please ask your queries"
        //      }
        //      }
        // Sample code to set the same is available Below.
        
        JSONObject welcomeResponse = new JSONObject();
        welcomeResponse.put("message", "Welcome to your Bot. Please ask your queries");
        JSONObject jsonResponse = new JSONObject();
        jsonResponse.put("welcome_response", welcomeResponse);
        return jsonResponse;
    }
}
