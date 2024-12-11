//$Id$
package com.handlers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.json.JSONObject;

import com.zc.cliq.enums.ACTION_TYPE;
import com.zc.cliq.enums.BUTTON_TYPE;
import com.zc.cliq.enums.CHANNEL_OPERATION;
import com.zc.cliq.enums.SLIDE_TYPE;
import com.zc.cliq.objects.Action;
import com.zc.cliq.objects.ActionData;
import com.zc.cliq.objects.BotContext;
import com.zc.cliq.objects.BotContextParam;
import com.zc.cliq.objects.BotSuggestion;
import com.zc.cliq.objects.ButtonObject;
import com.zc.cliq.objects.CardDetails;
import com.zc.cliq.objects.Message;
import com.zc.cliq.objects.Slide;
import com.zc.cliq.requests.BotContextHandlerRequest;
import com.zc.cliq.requests.BotMentionHandlerRequest;
import com.zc.cliq.requests.BotMenuActionHandlerRequest;
import com.zc.cliq.requests.BotMessageHandlerRequest;
import com.zc.cliq.requests.BotParticipationHandlerRequest;
import com.zc.cliq.requests.BotWebhookHandlerRequest;
import com.zc.cliq.requests.BotWelcomeHandlerRequest;
import com.zc.cliq.util.ZCCliqUtil;
import com.zc.component.cache.ZCCache;

public class BotHandler implements com.zc.cliq.interfaces.BotHandler {
	Logger LOGGER = Logger.getLogger(BotHandler.class.getName());

	@Override
	public Map<String, Object> welcomeHandler(BotWelcomeHandlerRequest req) {
		String uName = req.getUser() != null ? req.getUser().getFirstName() : "user";
		String text = "Hello " + uName + ". Thank you for subscribing :smile:";
		Message msg = Message.getInstance(text);
		return ZCCliqUtil.toMap(msg);
	}

	@Override
	public Map<String, Object> messageHandler(BotMessageHandlerRequest req) {
		try {
			String message = req.getMessage();
			Map<String, Object> resp = new HashMap<String, Object>();

			String text;
			if (message == null) {
				text = "Please enable 'Message' in bot settings";
			} else if (message.equalsIgnoreCase("hi") || message.equalsIgnoreCase("hey")) {
				text = "Hi " + req.getUser().getFirstName() + " :smile: How are you doing?";
				BotSuggestion suggestion = BotSuggestion.getInstance();
				suggestion.addSuggestion("Good");
				suggestion.addSuggestion("Not bad");
				suggestion.addSuggestion("Meh");
				suggestion.addSuggestion("Worst");
				resp.put("suggestions", suggestion);
			} else if (message.equalsIgnoreCase("Good") || message.equalsIgnoreCase("Not bad")) {
				text = "That's glad to hear :smile:";
			} else if (message.equalsIgnoreCase("Meh") || message.equalsIgnoreCase("Worst")) {
				text = "Oops! Don't you worry. Your day is definitely going to get better. :grinning:";
			} else if (message.equalsIgnoreCase("details")) {
				text = "Welcome to details collection center :wink:";

				BotContext context = BotContext.getInstance();
				context.setId("personal_details");
				context.setTimeout(300);

				BotContextParam param1 = BotContextParam.getInstance();
				param1.setName("name");
				param1.setQuestion("Please enter your name: ");

				BotContextParam param2 = BotContextParam.getInstance();
				param2.setName("dept");
				param2.setQuestion("Please enter your department: ");
				param2.addSuggestion("CSE");
				param2.addSuggestion("IT");
				param2.addSuggestion("MECH");

				BotContextParam param3 = BotContextParam.getInstance();
				param3.setName("cache");
				param3.setQuestion("Do you wish to put this detail in Catalyst Cache ?");
				param3.addSuggestion("YES");
				param3.addSuggestion("NO");

				context.setParams(param1, param2, param3);
				resp.put("context", context);
			} else if (message.equalsIgnoreCase("button")) {

				Message msg = Message.getInstance("Here's your button");
				ButtonObject btnObj = new ButtonObject();
				btnObj.setType(BUTTON_TYPE.RED_OUTLINE);
				btnObj.setLabel("Button1");
				Action action = new Action();
				action.setType(ACTION_TYPE.INVOKE_FUNCTION);
				ActionData actionData = new ActionData();
				actionData.setName("btnFunction");// ** ENTER YOUR BUTTON FUNCTION NAME HERE **
				action.setData(actionData);
				btnObj.setAction(action);
				msg.addButton(btnObj);
				return ZCCliqUtil.toMap(msg);
			} else {
				text = "Sorry, I'm not programmed yet to do this :sad:";
			}

			resp.put("text", text);
			return resp;

		} catch (Exception ex) {
			LOGGER.log(Level.SEVERE, "Exception in message handler. ", ex);
			throw ex;
		}
	}

	@Override
	public Map<String, Object> contextHandler(BotContextHandlerRequest req) {
		Map<String, Object> resp = new HashMap<String, Object>();
		if (req.getContextId().equals("personal_details")) {
			Map<String, String> answers = req.getAnswers();
			StringBuilder str = new StringBuilder();
			str.append("*Name*: ").append(answers.get("name")).append("\n");
			str.append("*Department*: ").append(answers.get("dept")).append("\n");

			if(answers.get("cache").equals("YES")) {
				try {
					ZCCache cache = ZCCache.getInstance();
					cache.putCacheValue("Name", answers.get("name"), 1L);
					cache.putCacheValue("Department", answers.get("dept"), 1L);
					str.append("This data is now available in Catalyst Cache's default segment.");
				} catch(Exception ex) {
					System.out.print("Error putting the value to cache: " + ex.toString());
				}
			}

			resp.put("text", "Nice ! I have collected your info: \n" + str.toString());
		}
		return resp;
	}

	@Override
	public Map<String, Object> mentionHandler(BotMentionHandlerRequest req) {
		String text = "Hey *" + req.getUser().getFirstName() + "*, thanks for mentioning me here. I'm from Catalyst city";
		Map<String, Object> resp = new HashMap<String, Object>();
		resp.put("text", text);
		return resp;
	}

	@Override
	public Map<String, Object> menuActionHandler(BotMenuActionHandlerRequest req) {
		Map<String, Object> resp = new HashMap<String, Object>();
		String text;
		if (req.getActionName().equals("Say Hi")) {
			text = "Hi";
		} else if (req.getActionName().equals("Look Angry")) {
			text = ":angry:";
		} else {
			text = "Menu action triggered :fist:";
		}
		resp.put("text", text);
		return resp;
	}

	@Override
	public Map<String, Object> webhookHandler(BotWebhookHandlerRequest req) throws Exception {
		// Sample handler class for incoming mails in ZohoMail
		// Please configure the bot in ZohoMail's outgoing webhooks
		JSONObject reqBody = req.getBody();
		String summary;
		String bodyStr = new StringBuilder("*From*: ").append(reqBody.getString("fromAddress")).append("\n*Subject*: ").append(reqBody.getString("subject")).append("\n*Content*: ").append((summary = reqBody.getString("summary")).length() > 100 ? summary.substring(0, 100) : summary).toString();
		Message msg = Message.getInstance(bodyStr);
		msg.setBot("PostPerson", "https://www.zoho.com/sites/default/files/catalyst/functions-images/icon-robot.jpg");
		CardDetails card = CardDetails.getInstance();
		card.setTitle("New Mail");
		card.setThumbnail("https://www.zoho.com/sites/default/files/catalyst/functions-images/mail.svg");
		msg.setCard(card);

		ButtonObject button = new ButtonObject();
		button.setLabel("Open mail");
		button.setType(BUTTON_TYPE.GREEN_OUTLINE);
		button.setHint("Click to open the mail in a new tab");
		Action action = new Action();
		action.setType(ACTION_TYPE.OPEN_URL);
		ActionData actionData = new ActionData();
		actionData.setWeb("https://mail.zoho.com/zm/#mail/folder/inbox/p/" + reqBody.getLong("messageId"));
		action.setData(actionData);
		button.setAction(action);

		msg.addButton(button);

		Slide gifSlide = Slide.getInstance();
		gifSlide.setType(SLIDE_TYPE.IMAGES);
		gifSlide.setTitle("");
		List<String> obj = new ArrayList<String>() {
			{
				add("https://media.giphy.com/media/efyEShk2FJ9X2Kpd7V/giphy.gif");
			}
		};
		gifSlide.setData(obj);

		msg.addSlide(gifSlide);

		return ZCCliqUtil.toMap(msg);
	}

	@Override
	public Map<String, Object> participationHandler(BotParticipationHandlerRequest req) throws Exception {
		String text;
		if (req.getOperation().equals(CHANNEL_OPERATION.ADDED)) {
			text = "Hi. Thanks for adding me to the channel :smile:";
		} else if (req.getOperation().equals(CHANNEL_OPERATION.REMOVED)) {
			text = "Bye-Bye :bye-bye:";
		} else {
			text = "I'm too a participant of this chat :wink:";
		}
		Message msg = Message.getInstance(text);
		return ZCCliqUtil.toMap(msg);
	}
}
