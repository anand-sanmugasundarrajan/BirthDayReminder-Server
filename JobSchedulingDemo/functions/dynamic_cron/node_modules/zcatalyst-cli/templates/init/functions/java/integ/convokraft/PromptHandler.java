import org.json.JSONObject;
import java.util.logging.Logger;

public class PromptHandler {
    Logger LOGGER = Logger.getLogger(PromptHandler.class.getName());

    public JSONObject handlePromptRequest(JSONObject reqBody) throws Exception {
        JSONObject jsonResponse = new JSONObject();
        LOGGER.info("Prompt Handler : : TODO : " + reqBody.get("todo"));
        if (reqBody.isNull("paramsToPrompt") || reqBody.getJSONArray("paramsToPrompt").length() == 0) {
            jsonResponse.put("todo", "execute");
            return jsonResponse;
        }
        jsonResponse.put("todo", "prompt");
        return jsonResponse;
    }
}
