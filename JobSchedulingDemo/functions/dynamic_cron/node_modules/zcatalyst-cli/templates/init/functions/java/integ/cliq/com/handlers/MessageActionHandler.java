//$Id$
package com.handlers;

import java.util.Map;

import com.zc.cliq.enums.RESPONSE_TYPE;
import com.zc.cliq.objects.Message;
import com.zc.cliq.requests.MessageActionHandlerRequest;
import com.zc.cliq.util.ZCCliqUtil;

public class MessageActionHandler implements com.zc.cliq.interfaces.MessageActionHandler {
	@Override
	public Map<String, Object> executionHandler(MessageActionHandlerRequest req) throws Exception {
		RESPONSE_TYPE msgType = req.getMessage().getType();
		String firstName = req.getUser() != null ? req.getUser().getFirstName() : "user";

		String text = "Hey " + firstName + ", You have performed an action on a *" + msgType.getKey() + "*. Manipulate the message variable and perform your own action.";

		Message resp = Message.getInstance();
		resp.setText(text);

		return ZCCliqUtil.toMap(resp);
	}

}
