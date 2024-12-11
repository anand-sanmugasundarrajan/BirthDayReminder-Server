'use strict';

import Cliq from 'zcatalyst-integ-cliq';
const widget = Cliq.widget();

widget.viewHandler(async (req, res) => {
    res.type = 'applet';

    const catalystTab = res.newWidgetTab('catalystTab', 'Zoho Catalyst');
    const cliqTab = res.newWidgetTab('cliqTab', 'Zoho Cliq');
    const infoTab = res.newWidgetTab('infoTab', 'Empty view');
    const buttonTab = res.newWidgetTab('buttonTab', 'Button types');

    res.addTab(catalystTab, cliqTab, infoTab, buttonTab);
    res.active_tab = catalystTab.id;

    if(comp(req.event, 'load') || comp(req.event, 'tab_click') && comp(req.target.id, 'catalystTab') || comp(req.event, 'refresh') && comp(req.target.id, 'catalystTab')) {

        // Datastore
        const datastoreSection = res.newWidgetSection();
        datastoreSection.id = '1';

        const divider = datastoreSection.newWidgetElement(); // common divider
        divider.type = 'divider';
        
        const dsTitle = datastoreSection.newWidgetElement();
        dsTitle.type = 'title';
        dsTitle.text = 'Datastore';
        const dsButton = dsTitle.newWidgetButton();
        dsButton.type = 'open.url';
        dsButton.label = 'Link';
        dsButton.url = 'https://www.zoho.com/catalyst/help/data-store.html';
        dsTitle.addWidgetButton(dsButton);

        const dsText = datastoreSection.newWidgetElement();
        dsText.type = 'text';
        dsText.text = 'The Data Store in Catalyst is a cloud-based relational database management system which stores the persistent data of your application.';

        datastoreSection.addElement(dsTitle, dsText, divider);

        // Functions
        const functionSection = res.newWidgetSection();
        functionSection.id = '2';

        const fnTitle = functionSection.newWidgetElement();
        fnTitle.type = 'title';
        fnTitle.text = 'Functions';
        const fnButton = fnTitle.newWidgetButton();
        fnButton.type = 'invoke.function';
        fnButton.label = 'Click here';
        fnButton.name = 'appletFunction';// ** ENTER YOUR WIDGET FUNCTION NAME **
        fnButton.id = 'widgetFn';
        fnTitle.addWidgetButton(fnButton);

        const fnText = functionSection.newWidgetElement();
        fnText.type = 'text';
        fnText.text = 'Catalyst Functions are custom-built coding structures which contain the intense business logic of your application.';

        functionSection.addElement(fnTitle, fnText, divider);

        // AutoML
        const autoMLSection = res.newWidgetSection();
        autoMLSection.id = '3';

        const autoMLTitle = autoMLSection.newWidgetElement();
        autoMLTitle.type = 'title';
        autoMLTitle.text = 'AutoML';

        const autoMLText = autoMLSection.newWidgetElement();
        autoMLText.type = 'text';
        autoMLText.text = 'AutoML (Automated Machine Learning) is the process of automating the end-to-end traditional machine learning model and'
                          +' applying it to solve the real-world problems.';

        autoMLSection.addElement(autoMLTitle, autoMLText);

        res.addSection(datastoreSection, functionSection, autoMLSection);

    }
    else if(comp(req.event, 'tab_click') || comp(req.event, 'refresh')) {
        const target = req.target.id;

        res.active_tab = target;
        if(comp(target, 'infoTab')) {
            res.data_type = 'info';
            const info = res.newWidgetInfo();
            info.title = 'Sorry! No tables found.';
            info.description = 'Catalyst Datastore can be used to create and manage tables to store persistent data of your applications!';
            info.image_url = 'https://www.zohowebstatic.com/sites/default/files/styles/product-home-page/public/catalyst-icon.png';

            const linkBtn = info.newWidgetButton();
            linkBtn.label = 'Visit Zoho Catalyst';
            linkBtn.type = 'open.url';
            linkBtn.url = 'https://console.catalyst.zoho.com';
            info.button = linkBtn;
            res.info = info;
            return res;
        }
        else if (comp(target, 'cliqTab')) {
            
            // Bot
            const botSection = res.newWidgetSection();
            botSection.id = 4;

            const divider = botSection.newWidgetElement(); // common divider
            divider.type = 'divider';

            const botTitle = botSection.newWidgetElement();
            botTitle.type = 'title';
            botTitle.text = 'Bot';

            const botText = botSection.newWidgetElement()
            botText.type = 'text';
            botText.text =  'Bot is your system powered contact or your colleague with which you can interact with as you do with any other person.'
                            +' The bot can be programmed to respond to your queries, to perform action on your behalf and to notify you for any important event.';

            botSection.addElement(botTitle, botText, divider);

            //widget
            const widgetSection = res.newWidgetSection();
            widgetSection.id = '5';

            const widgetTitle = widgetSection.newWidgetElement();
            widgetTitle.type = 'title';
            widgetTitle.text = 'Widgets';

            const widgetText = widgetSection.newWidgetElement();
            widgetText.type = 'text';
            widgetText.text =  'Widgets are a great way to customize your Cliq home screen. Imagine having a custom view of all the important data and functionality from the different apps that you use every day.';

            widgetSection.addElement(widgetTitle, widgetText, divider);

            // Connections
            const connectionSection = res.newWidgetSection();
            connectionSection.id = '6';

            const connectionTitle = connectionSection.newWidgetElement();
            connectionTitle.type = 'title';
            connectionTitle.text = 'Connections';

            const connectionText = connectionSection.newWidgetElement();
            connectionText.type = 'text';
            connectionText.text = 'Connections is an interface to integrate third party services with your Zoho Service, in this case, Cliq.'
                                  +' These connections are used in an URL invocation task to access authenticated data.'
                                  +' To establish a connection, it is necessary to provide a Connection Name, Authentication Type amongst other details.';

            connectionSection.addElement(connectionTitle, connectionText, divider);

            res.addSection(botSection, widgetSection, connectionSection);

        }
        else if(comp(target, 'buttonTab')) {
            //Time
            const titleSection = res.newWidgetSection();
            titleSection.id = '100';

            const time = titleSection.newWidgetElement();
            time.type = 'subtext';
            time.text = 'Target:buttons\nTime : ' + new Date().toISOString().replace('T', ' ').replace('Z', '');

            titleSection.addElement(time);

            //Buttons - Row1
            const buttonSection = res.newWidgetSection();

            const title = buttonSection.newWidgetElement();
            title.type = 'title';
            title.text = 'Buttons';

            const buttonElement1 = buttonSection.newWidgetElement();
            buttonElement1.type = 'buttons';
            const buttonsList1 = [];

            const button1 = buttonElement1.newWidgetButton();
            button1.label = 'link';
            button1.type = 'open.url';
            button1.url = 'https://www.zoho.com';

            const button2 = buttonElement1.newWidgetButton();
            button2.label = 'Applet Button';
            button2.type = 'invoke.function';
            button2.name = 'appletFunction';
            button2.id = 'banner';

            const button3 = buttonElement1.newWidgetButton();
            button3.label = 'Open Channel';
            button3.type = 'system.api';
            button3.setApi('joinchannel/{{id}}', 'CD_1283959962893705602_14598233');// ** ENTER YOUR CHANNEL ID HERE **

            const button4 = buttonElement1.newWidgetButton();
            button4.label = 'Preview';
            button4.type = 'preview.url';
            button4.url = 'https://www.zoho.com/catalyst/features.html';

            buttonsList1.push(button1, button2, button3, button4);

            buttonElement1.addWidgetButton(...buttonsList1);

            //Buttons - Row2

            const buttonElement2 = buttonSection.newWidgetElement();
            buttonElement2.type = 'buttons';

            const button5 = buttonElement2.newWidgetButton();
            button5.label = 'Edit Section';
            button5.type = 'invoke.function';
            button5.name = 'appletFunction';
            button5.id = 'section';

            const button6 = buttonElement2.newWidgetButton();
            button6.label = 'Form Edit Section';
            button6.type = 'invoke.function';
            button6.name = 'appletFunction';
            button6.id = 'formsection';

            const button7 = buttonElement2.newWidgetButton();
            button7.label = 'Banner';
            button7.type = 'invoke.function';
            button7.name = 'appletFunction';
            button7.id = 'banner';

            const button8 = buttonElement2.newWidgetButton();
            button8.label = 'Edit Whole Tab';
            button8.type = 'invoke.function';
            button8.name = 'appletFunction';
            button8.id = 'tab';

            const button9 = buttonElement2.newWidgetButton();
            button9.label = 'Form Edit Tab';
            button9.type = 'invoke.function';
            button9.name = 'appletFunction';
            button9.id = 'formTab';

            buttonElement2.addWidgetButton(button5, button6, button7, button8, button9);

            buttonSection.addElement(title, buttonElement1, buttonElement2);
            buttonSection.id = '101';

            res.addSection(titleSection, buttonSection);
        }
    }

    const firstNav = {
        label: 'Page : 1',
        type: 'invoke.function',
        name: 'appletFunction',
        id: 'breadcrumbs'
    };
   
    const linkButton = {
        label: 'Link',
        type: 'open.url',
        url: 'https://www.zoho.com'
    };

    const bannerButton = {
        label: 'Banner',
        type: 'invoke.function',
        name: 'appletFunction',
        id: 'banner'
    };

    res.header = {
        title : 'Header 1',
        navigation : 'new',
        buttons : [firstNav, linkButton, bannerButton]
    };

    res.footer = {
        text : 'Footer text',
        buttons : [linkButton, bannerButton]
    };
    return res;
});

function comp(var1, var2) {
    return var1.toUpperCase() === var2.toUpperCase();
}
