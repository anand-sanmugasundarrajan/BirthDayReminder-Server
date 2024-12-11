//$Id$
package com.handlers;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import org.json.JSONArray;
import org.json.JSONObject;

import com.zc.cliq.enums.ACTION_TYPE;
import com.zc.cliq.enums.BANNER_STATUS;
import com.zc.cliq.enums.FORM_FIELD_TYPE;
import com.zc.cliq.enums.FORM_MODIFICATION_ACTION_TYPE;
import com.zc.cliq.enums.SLIDE_TYPE;
import com.zc.cliq.enums.SYSTEM_API_ACTION;
import com.zc.cliq.enums.WIDGET_ELEMENT_TYPE;
import com.zc.cliq.enums.WIDGET_NAVIGATION;
import com.zc.cliq.enums.WIDGET_TYPE;
import com.zc.cliq.objects.ButtonObject;
import com.zc.cliq.objects.CardDetails;
import com.zc.cliq.objects.Form;
import com.zc.cliq.objects.FormAction;
import com.zc.cliq.objects.FormChangeResponse;
import com.zc.cliq.objects.FormDynamicFieldResponse;
import com.zc.cliq.objects.FormInput;
import com.zc.cliq.objects.FormModificationAction;
import com.zc.cliq.objects.FormTarget;
import com.zc.cliq.objects.FormValue;
import com.zc.cliq.objects.Message;
import com.zc.cliq.objects.Slide;
import com.zc.cliq.objects.WidgetButton;
import com.zc.cliq.objects.WidgetElement;
import com.zc.cliq.objects.WidgetFooter;
import com.zc.cliq.objects.WidgetHeader;
import com.zc.cliq.objects.WidgetResponse;
import com.zc.cliq.objects.WidgetSection;
import com.zc.cliq.requests.ButtonFunctionRequest;
import com.zc.cliq.requests.FormFunctionRequest;
import com.zc.cliq.requests.WidgetFunctionRequest;
import com.zc.cliq.util.ZCCliqUtil;

public class FunctionHandler implements com.zc.cliq.interfaces.FunctionHandler {

	Logger LOGGER = Logger.getLogger(FunctionHandler.class.getName());

	@Override
	public Map<String, Object> buttonFunctionHandler(ButtonFunctionRequest req) throws Exception {
		Message msg = Message.getInstance("Button function executed");
		return ZCCliqUtil.toMap(msg);
	}

	@Override
	public Map<String, Object> formSubmitHandler(FormFunctionRequest req) throws Exception {
		JSONObject values = req.getForm().getValues();

		String type = values.optString("type", null);
		if (type != null) {
			if (type.equals("formtab")) {
				WidgetResponse widgetResp = WidgetResponse.getInstance();
				widgetResp.setType(WIDGET_TYPE.APPLET);

				WidgetSection titleSection = WidgetSection.getInstance();
				titleSection.setId("100");

				WidgetElement editedBy = WidgetElement.getInstance(WIDGET_ELEMENT_TYPE.TITLE);
				editedBy.setText("Edited by " + values.optString("text") + " :wink:");
				titleSection.addElement(editedBy);

				WidgetElement time = WidgetElement.getInstance(WIDGET_ELEMENT_TYPE.SUBTEXT);
				SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
				time.setText("Target:buttons\nTime : " + sdf.format(new Date()));
				titleSection.addElement(time);

				widgetResp.addSection(titleSection);

				WidgetSection buttonSection = getButtonsSection();
				widgetResp.addSection(buttonSection);

				return ZCCliqUtil.toMap(widgetResp);
			} else if (type.equals("formsection")) {
				WidgetSection section = WidgetSection.getInstance();
				section.setId("102");
				section.setType("section");
				WidgetElement editedBy = WidgetElement.getInstance(WIDGET_ELEMENT_TYPE.TITLE);
				editedBy.setText("Edited by " + values.optString("text") + " :wink:");
				section.addElement(editedBy);

				return ZCCliqUtil.toMap(section);
			} else {
				Message msg = Message.getInstance("Applet Button executed successfully");
				msg.setBannerResponse(BANNER_STATUS.SUCCESS);
				return ZCCliqUtil.toMap(msg);
			}
		}
		String text = new StringBuilder().append("Hi ").append(values.getString("username")).append(", thanks for raising your request. Your request will be processed based on the device availability.").toString();
		Message msg = Message.getInstance(text);
		msg.setCard(CardDetails.getInstance("Asset Request"));
		Slide slide = Slide.getInstance();
		slide.setType(SLIDE_TYPE.LABEL);
		slide.setTitle("");
		JSONArray dataArray = new JSONArray();
		JSONObject obj1 = new JSONObject();
		obj1.put("Asset Type", values.getJSONObject("asset-type").getString("label"));
		dataArray.put(obj1);
		if (values.getJSONObject("asset-type").getString("value").equals("mobile")) {
			JSONObject obj2 = new JSONObject();
			obj2.put("Preferred OS", values.getJSONObject("mobile-os").getString("label"));
			dataArray.put(obj2);
			JSONObject obj3 = new JSONObject();
			obj3.put("Preferred Device", values.getJSONObject("mobile-list").getString("label"));
			dataArray.put(obj3);
		} else {
			JSONObject obj2 = new JSONObject();
			obj2.put("OS/Device Preferred", values.getJSONObject("os-type").getString("label"));
			dataArray.put(obj2);
		}
		slide.setData(dataArray);
		msg.addSlide(slide);
		return ZCCliqUtil.toMap(msg);
	}

	@Override
	public FormChangeResponse formChangeHandler(FormFunctionRequest req) throws Exception {
		FormChangeResponse resp = FormChangeResponse.getInstance();
		String target = req.getTarget().getName();
		JSONObject values = req.getForm().getValues();
		String fieldValue = ((JSONObject) values.get("asset-type")).get("value").toString();
		if (target.equalsIgnoreCase("asset-type")) {

			if (fieldValue.equals("laptop")) {
				FormModificationAction selectBoxAction = FormModificationAction.getInstance();
				selectBoxAction.setType(FORM_MODIFICATION_ACTION_TYPE.ADD_AFTER);
				selectBoxAction.setName("asset-type");
				FormInput OS = FormInput.getIntance();
				OS.setTriggerOnChange(true);
				OS.setType(FORM_FIELD_TYPE.SELECT);
				OS.setName("os-type");
				OS.setLabel("Laptop Type");
				OS.setHint("Choose your preferred OS type");
				OS.setPlaceholder("Ubuntu");
				OS.setMandatory(true);
				FormValue mac = new FormValue();
				mac.setLabel("Mac OS X");
				mac.setValue("mac");
				FormValue windows = new FormValue();
				windows.setLabel("Windows");
				windows.setValue("windows");
				FormValue ubuntu = new FormValue();
				ubuntu.setLabel("Ubuntu");
				ubuntu.setValue("ubuntu");
				OS.addOption(mac);
				OS.addOption(windows);
				OS.addOption(ubuntu);
				selectBoxAction.setInput(OS);

				FormModificationAction removeMobileOSAction = FormModificationAction.getInstance();
				removeMobileOSAction.setType(FORM_MODIFICATION_ACTION_TYPE.REMOVE);
				removeMobileOSAction.setName("mobile-os");

				FormModificationAction removeMobileListAction = FormModificationAction.getInstance();
				removeMobileListAction.setType(FORM_MODIFICATION_ACTION_TYPE.REMOVE);
				removeMobileListAction.setName("mobile-list");

				resp.addAction(selectBoxAction);
				resp.addAction(removeMobileOSAction);
				resp.addAction(removeMobileListAction);
			} else if (fieldValue.equals("mobile")) {
				FormModificationAction selectBoxAction = FormModificationAction.getInstance();
				selectBoxAction.setType(FORM_MODIFICATION_ACTION_TYPE.ADD_AFTER);
				selectBoxAction.setName("asset-type");
				FormInput OS = FormInput.getIntance();
				OS.setTriggerOnChange(true);
				OS.setType(FORM_FIELD_TYPE.SELECT);
				OS.setName("mobile-os");
				OS.setLabel("Mobile OS");
				OS.setHint("Choose your preferred mobile OS");
				OS.setPlaceholder("Android");
				OS.setMandatory(true);
				FormValue android = new FormValue();
				android.setLabel("Android");
				android.setValue("android");
				FormValue ios = new FormValue();
				ios.setLabel("iOS");
				ios.setValue("ios");
				OS.addOption(android);
				OS.addOption(ios);
				selectBoxAction.setInput(OS);

				FormModificationAction removeOSTypeAction = FormModificationAction.getInstance();
				removeOSTypeAction.setType(FORM_MODIFICATION_ACTION_TYPE.REMOVE);
				removeOSTypeAction.setName("os-type");

				resp.addAction(selectBoxAction);
				resp.addAction(removeOSTypeAction);
			}

		} else if (target.equalsIgnoreCase("mobile-os")) {

			if (fieldValue != null) {
				FormModificationAction mobileListAction = FormModificationAction.getInstance();
				mobileListAction.setType(FORM_MODIFICATION_ACTION_TYPE.ADD_AFTER);
				mobileListAction.setName("mobile-os");
				FormInput listInput = FormInput.getIntance();
				listInput.setType(FORM_FIELD_TYPE.DYNAMIC_SELECT);
				listInput.setName("mobile-list");
				listInput.setLabel("Mobile Device");
				listInput.setPlaceholder("Choose your preferred mobile device");
				listInput.setMandatory(true);
				mobileListAction.setInput(listInput);

				resp.addAction(mobileListAction);
			} else {
				FormModificationAction removeMobileListAction = FormModificationAction.getInstance();
				removeMobileListAction.setType(FORM_MODIFICATION_ACTION_TYPE.REMOVE);
				removeMobileListAction.setName("mobile-list");
				resp.addAction(removeMobileListAction);
			}
		}
		return resp;
	}

	@Override
	public FormDynamicFieldResponse formDynamicFieldHandler(FormFunctionRequest req) throws Exception {
		FormDynamicFieldResponse resp = FormDynamicFieldResponse.getInstance();
		FormTarget target = req.getTarget();
		String query = target.getQuery();
		JSONObject values = req.getForm().getValues();
		if (target.getName().equals("mobile-list") && !values.get("mobile-os").toString().isEmpty()) {
			String device = values.getJSONObject("mobile-os").getString("value");
			if (device.equals("android")) {
				Arrays.stream(new String[] { "One Plus 6T", "One Plus 6", "Google Pixel 3", "Google Pixel 2XL" }).filter(phone -> phone.contains(query)).forEach(phone -> resp.addOption(new FormValue(phone, phone.toLowerCase().replace(" ", "_"))));
			} else if (device.equals("ios")) {
				Arrays.stream(new String[] { "IPhone XR", "IPhone XS", "IPhone X", "Iphone 8 Plus" }).filter(phone -> phone.contains(query)).forEach(phone -> resp.addOption(new FormValue(phone, phone.toLowerCase().replace(" ", "_"))));
			}
		}
		return resp;
	}

	@Override
	public Map<String, Object> widgetButtonHandler(WidgetFunctionRequest req) throws Exception {
		ButtonObject target = req.getTarget();
		String id = target.getId();
		switch (id) {
		case "tab": {

			WidgetResponse widgetResp = WidgetResponse.getInstance();
			widgetResp.setType(WIDGET_TYPE.APPLET);

			// Time
			WidgetElement time = WidgetElement.getInstance(WIDGET_ELEMENT_TYPE.SUBTEXT);
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
			time.setText("Target:buttons\nTime : " + sdf.format(new Date()));
			WidgetSection titleSection = WidgetSection.getInstance();
			titleSection.addElement(time);
			titleSection.setId("100");
			widgetResp.addSection(titleSection);

			WidgetSection buttonSection = getButtonsSection();

			widgetResp.addSection(buttonSection);
			return ZCCliqUtil.toMap(widgetResp);
		}

		case "section": {
			WidgetSection section = WidgetSection.getInstance();
			section.setId("102");
			section.setType("section");
			WidgetElement element = WidgetElement.getInstance(WIDGET_ELEMENT_TYPE.TITLE);
			element.setText("Edited :wink:");
			section.addElement(element);
			return ZCCliqUtil.toMap(section);
		}

		case "formtab":
		case "formsection": {
			Form form = Form.getInstance();
			form.setTitle("Zylker Annual Marathon");
			form.setName("a");
			form.setHint("Register yourself for the Zylker Annual Marathon!");
			form.setButtonLabel("Submit");
			FormInput input1 = FormInput.getIntance();
			input1.setType(FORM_FIELD_TYPE.TEXT);
			input1.setName("text");
			input1.setLabel("Name");
			input1.setPlaceholder("Scott Fischer");
			input1.setMinLength("0");
			input1.setMaxLength("25");
			input1.setMandatory(true);

			FormInput input2 = FormInput.getIntance();
			input2.setType(FORM_FIELD_TYPE.HIDDEN);
			input2.setName("type");
			input2.setValue(id);

			form.addFormInput(input1);
			form.addFormInput(input2);
			form.setAction(FormAction.getInstance("appletForm"));// ** ENTER YOUR FORM FUNCTION NAME HERE **
			return ZCCliqUtil.toMap(form);
		}

		case "breadcrumbs":

			Integer page = Integer.parseInt(target.getLabel().split("Page : ")[1].trim()) + 1;
			WidgetResponse widgetResp = WidgetResponse.getInstance();
			widgetResp.setType(WIDGET_TYPE.APPLET);
			WidgetElement elem = WidgetElement.getInstance(WIDGET_ELEMENT_TYPE.SUBTEXT);
			elem.setText("Page " + page);
			WidgetSection titleSection = WidgetSection.getInstance();
			titleSection.addElement(elem);
			titleSection.setId("12345");
			widgetResp.addSection(titleSection);

			WidgetButton fistNav = new WidgetButton();
			fistNav.setLabel("Page : " + page);
			fistNav.setType(ACTION_TYPE.INVOKE_FUNCTION);
			fistNav.setName("appletFunction");
			fistNav.setId("breadcrumbs");

			WidgetButton linkButton = new WidgetButton();
			linkButton.setLabel("Link");
			linkButton.setType(ACTION_TYPE.OPEN_URL);
			linkButton.setUrl("https://www.zoho.com");

			WidgetButton bannerBtn = new WidgetButton();
			bannerBtn.setLabel("Banner");
			bannerBtn.setType(ACTION_TYPE.INVOKE_FUNCTION);
			bannerBtn.setName("appletFunction");
			bannerBtn.setId("banner");

			WidgetHeader header = WidgetHeader.getInstance();
			header.setTitle("Header " + page);
			header.setNavigation(WIDGET_NAVIGATION.CONTINUE);
			List<WidgetButton> headerButtons = new ArrayList<WidgetButton>();
			headerButtons.add(fistNav);
			headerButtons.add(bannerBtn);
			headerButtons.add(linkButton);
			header.setButtons(headerButtons);
			widgetResp.setHeader(header);

			WidgetFooter footer = WidgetFooter.getInstance();
			footer.setText("Footer Text");
			List<WidgetButton> footerButtons = new ArrayList<WidgetButton>();
			footerButtons.add(bannerBtn);
			footerButtons.add(linkButton);
			footer.setButtons(footerButtons);
			widgetResp.setFooter(footer);

			return ZCCliqUtil.toMap(widgetResp);

		case "banner":
		default: {
			Message msg = Message.getInstance("Applet Button executed successfully");
			msg.setBannerResponse(BANNER_STATUS.SUCCESS);
			return ZCCliqUtil.toMap(msg);
		}
		}
	}

	private WidgetSection getButtonsSection() {
		WidgetSection buttonSection = WidgetSection.getInstance();

		// Buttons - Row1
		WidgetElement title = WidgetElement.getInstance(WIDGET_ELEMENT_TYPE.TITLE);
		title.setText("Buttons");

		WidgetElement buttonElement1 = WidgetElement.getInstance(WIDGET_ELEMENT_TYPE.BUTTONS);
		List<WidgetButton> buttonsList1 = new ArrayList<WidgetButton>();
		WidgetButton button1 = new WidgetButton();
		button1.setLabel("Link");
		button1.setType(ACTION_TYPE.OPEN_URL);
		button1.setUrl("https://www.zoho.com");

		WidgetButton button2 = new WidgetButton();
		button2.setLabel("Banner");
		button2.setType(ACTION_TYPE.INVOKE_FUNCTION);
		button2.setName("appletFunction");
		button2.setId("banner");

		WidgetButton button3 = new WidgetButton();
		button3.setLabel("Open Channel");
		button3.setType(ACTION_TYPE.SYSTEM_API);
		button3.setApi(SYSTEM_API_ACTION.JOIN_CHANNEL, "CD_1283959962893705602_14598233");// ** ENTER YOUR CHANNEL ID HERE **

		WidgetButton button4 = new WidgetButton();
		button4.setLabel("Preview");
		button4.setType(ACTION_TYPE.PREVIEW_URL);
		button4.setUrl("https://www.zoho.com/catalyst/features.html");

		buttonsList1.add(button1);
		buttonsList1.add(button2);
		buttonsList1.add(button3);
		buttonsList1.add(button4);

		buttonElement1.setButtons(buttonsList1);

		// Buttons - Row2
		WidgetElement buttonElement2 = WidgetElement.getInstance(WIDGET_ELEMENT_TYPE.BUTTONS);
		List<WidgetButton> buttonsList2 = new ArrayList<WidgetButton>();
		WidgetButton button5 = new WidgetButton();
		button5.setLabel("Edit Section");
		button5.setType(ACTION_TYPE.INVOKE_FUNCTION);
		button5.setName("appletFunction");
		button5.setId("section");

		WidgetButton button6 = new WidgetButton();
		button6.setLabel("Form Edit Section");
		button6.setType(ACTION_TYPE.INVOKE_FUNCTION);
		button6.setName("appletFunction");
		button6.setId("formsection");

		WidgetButton button7 = new WidgetButton();
		button7.setLabel("Banner");
		button7.setType(ACTION_TYPE.INVOKE_FUNCTION);
		button7.setName("appletFunction");
		button7.setId("banner");

		WidgetButton button8 = new WidgetButton();
		button8.setLabel("Edit Whole Tab");
		button8.setType(ACTION_TYPE.INVOKE_FUNCTION);
		button8.setName("appletFunction");
		button8.setId("tab");

		WidgetButton button9 = new WidgetButton();
		button9.setLabel("Form Edit Tab");
		button9.setType(ACTION_TYPE.INVOKE_FUNCTION);
		button9.setName("appletFunction");
		button9.setId("formtab");

		buttonsList2.add(button5);
		buttonsList2.add(button6);
		buttonsList2.add(button7);
		buttonsList2.add(button8);
		buttonsList2.add(button9);

		buttonElement2.setButtons(buttonsList2);

		buttonSection.addElement(title);
		buttonSection.addElement(buttonElement1);
		buttonSection.addElement(buttonElement2);
		buttonSection.setId("101");

		return buttonSection;
	}
}
