import org.json.JSONObject;
import java.util.logging.Logger;

public class FallbackHandler {
    Logger LOGGER = Logger.getLogger(FallbackHandler.class.getName());
    public JSONObject handleFallbackRequest(JSONObject reqBody) throws Exception{
        JSONObject jsonResponse = new JSONObject();
        LOGGER.info("Fallback Handler : : TODO : "+ reqBody.get("todo"));
        jsonResponse.put("message", "Fallback Response: Please define this question and try again");
        jsonResponse.put("status", "handled");
        return jsonResponse;
    }
}
