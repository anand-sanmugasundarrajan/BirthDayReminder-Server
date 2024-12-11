//$Id$
package com.handlers;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.logging.Logger;

import com.zc.cliq.enums.ACTION_TYPE;
import com.zc.cliq.enums.SYSTEM_API_ACTION;
import com.zc.cliq.enums.WIDGET_DATATYPE;
import com.zc.cliq.enums.WIDGET_ELEMENT_TYPE;
import com.zc.cliq.enums.WIDGET_EVENT;
import com.zc.cliq.enums.WIDGET_NAVIGATION;
import com.zc.cliq.enums.WIDGET_TYPE;
import com.zc.cliq.objects.WidgetButton;
import com.zc.cliq.objects.WidgetElement;
import com.zc.cliq.objects.WidgetFooter;
import com.zc.cliq.objects.WidgetHeader;
import com.zc.cliq.objects.WidgetInfo;
import com.zc.cliq.objects.WidgetResponse;
import com.zc.cliq.objects.WidgetSection;
import com.zc.cliq.objects.WidgetTab;
import com.zc.cliq.requests.WidgetExecutionHandlerRequest;

public class WidgetHandler implements com.zc.cliq.interfaces.WidgetHandler {
	Logger LOGGER = Logger.getLogger(WidgetHandler.class.getName());

	@Override
	public WidgetResponse viewHandler(WidgetExecutionHandlerRequest req) throws Exception {

		WidgetResponse widgetResp = WidgetResponse.getInstance();
		widgetResp.setType(WIDGET_TYPE.APPLET);
		WidgetTab catalystTab = WidgetTab.getInstance("catalystTab", "Zoho Catalyst");
		WidgetTab cliqTab = WidgetTab.getInstance("cliqTab", "Zoho Cliq");
		WidgetTab infotab = WidgetTab.getInstance("infoTab", "Empty view");
		WidgetTab buttonTab = WidgetTab.getInstance("buttonTab", "Button types");

		widgetResp.addTabs(catalystTab, cliqTab, infotab, buttonTab);
		widgetResp.setActiveTab(catalystTab);

		if (req.getEvent().equals(WIDGET_EVENT.LOAD) || (req.getEvent().equals(WIDGET_EVENT.TAB_CLICK) && req.getTarget().getId().equals("catalystTab")) || (req.getEvent().equals(WIDGET_EVENT.REFRESH) && req.getTarget().getId().equals("catalystTab"))) {

			WidgetElement divider = WidgetElement.getInstance(WIDGET_ELEMENT_TYPE.DIVIDER);

			// Datastore
			WidgetElement dsTitle = WidgetElement.getInstance(WIDGET_ELEMENT_TYPE.TITLE);
			dsTitle.setText("Datastore");
			WidgetButton dsButton = new WidgetButton();
			dsButton.setType(ACTION_TYPE.OPEN_URL);
			dsButton.setLabel("Link");
			dsButton.setUrl("https://www.zoho.com/catalyst/help/data-store.html");
			dsTitle.addWidgetButton(dsButton);
			WidgetElement dsText = WidgetElement.getInstance(WIDGET_ELEMENT_TYPE.TEXT);
			dsText.setText("The Data Store in Catalyst is a cloud-based relational database management system which stores the persistent data of your application.");
			WidgetSection datastoreSection = WidgetSection.getInstance();
			datastoreSection.setId("1");
			datastoreSection.addElements(dsTitle, dsText, divider);
			widgetResp.addSection(datastoreSection);

			// Functions
			WidgetElement fnTitle = WidgetElement.getInstance(WIDGET_ELEMENT_TYPE.TITLE);
			fnTitle.setText("Functions");
			WidgetButton fnButton = new WidgetButton();
			fnButton.setType(ACTION_TYPE.INVOKE_FUNCTION);
			fnButton.setLabel("Click here");
			fnButton.setName("appletFunction");// ** ENTER YOUR WIDGET FUNCTION NAME **
			fnButton.setId("widgetFn");
			fnTitle.addWidgetButton(fnButton);
			WidgetElement fnText = WidgetElement.getInstance(WIDGET_ELEMENT_TYPE.TEXT);
			fnText.setText("Catalyst Functions are custom-built coding structures which contain the intense business logic of your application.");
			WidgetSection functionsSection = WidgetSection.getInstance();
			functionsSection.addElements(fnTitle, fnText, divider);
			functionsSection.setId("2");
			widgetResp.addSection(functionsSection);

			// AutoML
			WidgetElement automlTitle = WidgetElement.getInstance(WIDGET_ELEMENT_TYPE.TITLE);
			WidgetElement automlText = WidgetElement.getInstance(WIDGET_ELEMENT_TYPE.TEXT);
			automlTitle.setText("AutoML");
			automlText.setText("AutoML (Automated Machine Learning) is the process of automating the end-to-end traditional machine learning model and applying it to solve the real-world problems.");
			WidgetSection autoMLSection = WidgetSection.getInstance();
			autoMLSection.addElements(automlTitle, automlText);
			autoMLSection.setId("3");
			widgetResp.addSection(autoMLSection);

		} else if (req.getEvent().equals(WIDGET_EVENT.REFRESH) || req.getEvent().equals(WIDGET_EVENT.TAB_CLICK)) {

			String target = req.getTarget().getId();

			widgetResp.setActiveTab(target);
			if (target.equals("infoTab")) {

				widgetResp.setDataType(WIDGET_DATATYPE.INFO);
				WidgetInfo info = new WidgetInfo();
				info.setTitle("Sorry! No tables found.");
				info.setDescription("Catalyst Datastore can be used to create and manage tables to store persistent data of your applications!");
				info.setImageUrl("https://www.zohowebstatic.com/sites/default/files/styles/product-home-page/public/catalyst-icon.png");
				WidgetButton linkBtn = new WidgetButton();
				linkBtn.setLabel("Visit Zoho Catalyst");
				linkBtn.setType(ACTION_TYPE.OPEN_URL);
				linkBtn.setUrl("https://console.catalyst.zoho.com");
				info.setButton(linkBtn);
				widgetResp.setInfo(info);

				return widgetResp;
			} else if (target.equals("cliqTab")) {

				WidgetElement divider = WidgetElement.getInstance(WIDGET_ELEMENT_TYPE.DIVIDER);

				// Bot
				WidgetElement botTitle = WidgetElement.getInstance(WIDGET_ELEMENT_TYPE.TITLE);
				WidgetElement botText = WidgetElement.getInstance(WIDGET_ELEMENT_TYPE.TEXT);
				botTitle.setText("Bot");
				botText.setText("Bot is your system powered contact or your colleague with which you can interact with as you do with any other person. The bot can be programmed to respond to your queries, to perform action on your behalf and to notify you for any important event.");
				WidgetSection botSection = WidgetSection.getInstance();
				botSection.addElements(botTitle, botText, divider);
				botSection.setId("4");
				widgetResp.addSection(botSection);

				// Widgets
				WidgetElement widgetTitle = WidgetElement.getInstance(WIDGET_ELEMENT_TYPE.TITLE);
				WidgetElement widgetText = WidgetElement.getInstance(WIDGET_ELEMENT_TYPE.TEXT);
				widgetTitle.setText("Widgets");
				widgetText.setText("Widgets are a great way to customize your Cliq home screen. Imagine having a custom view of all the important data and functionality from the different apps that you use every day.");
				WidgetSection widgetsSection = WidgetSection.getInstance();
				widgetsSection.addElements(widgetTitle, widgetText, divider);
				widgetsSection.setId("5");
				widgetResp.addSection(widgetsSection);

				// Connections
				WidgetElement connTitle = WidgetElement.getInstance(WIDGET_ELEMENT_TYPE.TITLE);
				WidgetElement connText = WidgetElement.getInstance(WIDGET_ELEMENT_TYPE.TEXT);
				connTitle.setText("Connections");
				connText.setText("Connections is an interface to integrate third party services with your Zoho Service, in this case, Cliq. These connections are used in an URL invocation task to access authenticated data. To establish a connection, it is necessary to provide a Connection Name, Authentication Type amongst other details.");
				WidgetSection connectionsSection = WidgetSection.getInstance();
				connectionsSection.addElements(connTitle, connText);
				connectionsSection.setId("6");
				widgetResp.addSection(connectionsSection);

			} else if (target.equals("buttonTab")) {

				// Time
				WidgetElement time = WidgetElement.getInstance(WIDGET_ELEMENT_TYPE.SUBTEXT);
				SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
				time.setText("Target:buttons\nTime : " + sdf.format(new Date()));
				WidgetSection titleSection = WidgetSection.getInstance();
				titleSection.setId("100");
				titleSection.addElement(time);
				widgetResp.addSection(titleSection);

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
				button2.setLabel("Applet Button");
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

				widgetResp.addSection(buttonSection);
			}

		}

		WidgetButton fistNav = new WidgetButton();
		fistNav.setLabel("Page : 1");
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
		header.setTitle("Header 1");
		header.setNavigation(WIDGET_NAVIGATION.NEW);
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

		return widgetResp;
	}
}
