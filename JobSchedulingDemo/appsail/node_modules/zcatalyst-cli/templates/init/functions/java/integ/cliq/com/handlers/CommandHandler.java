//$Id$
package com.handlers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.zc.cliq.enums.FORM_FIELD_TEXT_FORMAT;
import com.zc.cliq.enums.FORM_FIELD_TYPE;
import com.zc.cliq.objects.CommandSuggestion;
import com.zc.cliq.objects.Form;
import com.zc.cliq.objects.FormActionsObject;
import com.zc.cliq.objects.FormInput;
import com.zc.cliq.objects.FormValue;
import com.zc.cliq.requests.CommandHandlerRequest;
import com.zc.cliq.util.ZCCliqUtil;

public class CommandHandler implements com.zc.cliq.interfaces.CommandHandler {
	@Override
	public Map<String, Object> executionHandler(CommandHandlerRequest req) throws Exception {

		Map<String, Object> resp = new HashMap<String, Object>();
		String text;
		String commandName = req.getName();
		if (commandName.equals("catalystresource")) {
			List<CommandSuggestion> suggestions = req.getSelections();
			if (suggestions == null || suggestions.isEmpty()) {
				text = "Please select a suggestion from the command";
			} else {
				String prefix = "Take a look at our ";
				if (suggestions.get(0).getTitle().equals("API doc")) {
					text = prefix + "[API Documentation](https://www.zoho.com/catalyst/help/api/introduction/overview.html)";
				} else if (suggestions.get(0).getTitle().equals("CLI doc")) {
					text = prefix + "[CLI Documentation](https://www.zoho.com/catalyst/help/cli-command-reference.html)";
				} else {
					text = prefix + "[help documentation](https://www.zoho.com/catalyst/help/)";
				}
			}
		} else if (commandName.equals("getform")) {
			return getForm();
		} else {
			text = "Command executed successfully!";
		}

		resp.put("text", text);
		return resp;
	}

	@Override
	public List<CommandSuggestion> suggestionHandler(CommandHandlerRequest req) {
		List<CommandSuggestion> suggestionList = new ArrayList<CommandSuggestion>();
		if (req.getName().equals("catalystresource")) {
			CommandSuggestion sugg1 = CommandSuggestion.getInstance("API doc", "Catalyst API documentation", "https://www.zohowebstatic.com/sites/default/files/styles/product-home-page/public/catalyst-icon.png");
			CommandSuggestion sugg2 = CommandSuggestion.getInstance("CLI doc", "Catalyst CLI documentation", "https://www.zohowebstatic.com/sites/default/files/styles/product-home-page/public/catalyst-icon.png");
			CommandSuggestion sugg3 = CommandSuggestion.getInstance("Help doc", "Catalyst Help documentation", "https://www.zohowebstatic.com/sites/default/files/styles/product-home-page/public/catalyst-icon.png");
			suggestionList.add(sugg1);
			suggestionList.add(sugg2);
			suggestionList.add(sugg3);
		}
		return suggestionList;
	}

	private static Map<String, Object> getForm() {
		Form form = Form.getInstance();
		form.setTitle("Asset Request");
		form.setHint("Raise your asset request");
		form.setName("ID");
		form.setButtonLabel("Raise Request");
		form.setVersion(1);

		FormActionsObject actions = FormActionsObject.getInstance();
		actions.setSubmitAction("formFunctionLatest"); // ** ENTER YOUR FORM FUNCTION NAME HERE **

		form.setActions(actions);

		FormInput username = FormInput.getIntance();
		username.setType(FORM_FIELD_TYPE.TEXT);
		username.setName("username");
		username.setLabel("Name");
		username.setHint("Please enter your name");
		username.setPlaceholder("John Reese");
		username.setMandatory(true);
		username.setValue("Harold Finch");
		form.addFormInput(username);

		FormInput email = FormInput.getIntance();
		email.setType(FORM_FIELD_TYPE.TEXT);
		email.setFormat(FORM_FIELD_TEXT_FORMAT.EMAIL);
		email.setName("email");
		email.setLabel("Email");
		email.setHint("Enter your email address");
		email.setPlaceholder("johnreese@poi.com");
		email.setMandatory(true);
		email.setValue("haroldfinch@samaritan.com");
		form.addFormInput(email);

		FormInput assetType = FormInput.getIntance();
		assetType.setType(FORM_FIELD_TYPE.SELECT);
		assetType.setTriggerOnChange(true);
		assetType.setName("asset-type");
		assetType.setLabel("Asset Type");
		assetType.setHint("Choose your request asset type");
		assetType.setPlaceholder("Mobile");
		assetType.setMandatory(true);
		assetType.addOption(new FormValue("Laptop", "laptop"));
		assetType.addOption(new FormValue("Mobile", "mobile"));
		form.addFormInput(assetType);

		return ZCCliqUtil.toMap(form);
	}
}
