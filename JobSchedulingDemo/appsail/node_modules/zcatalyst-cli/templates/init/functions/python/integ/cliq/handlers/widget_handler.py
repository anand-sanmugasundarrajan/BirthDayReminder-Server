import datetime
from zcatalyst_cliq.widget_handler import (
    view_handler,
    WidgetExecutionHandlerRequest,
    WidgetResponse
)


@view_handler
def view_handler(req: WidgetExecutionHandlerRequest, res: WidgetResponse, *args):
    res.type = 'applet'

    catalyst_tab = res.new_widget_tab('catalystTab', 'Zoho Catalyst')
    cliq_tab = res.new_widget_tab('cliqTab', 'Zoho Cliq')
    info_tab = res.new_widget_tab('infoTab', 'Empty view')
    button_tab = res.new_widget_tab('buttonTab', 'Button types')

    res.add_tab(catalyst_tab, cliq_tab, info_tab, button_tab)
    res.active_tab = catalyst_tab.id

    if req.event == 'load' or req.event == 'tab_click' and req.target.id == 'catalystTab' or req.event == 'refresh' and req.target.id == 'catalystTab':
        #Datastore
        datastore_section = res.new_widget_section()
        datastore_section.id = '1'

        divider = datastore_section.new_widget_element() #common divider
        divider.type = 'divider'
        
        ds_title = datastore_section.new_widget_element()
        ds_title.type = 'title'
        ds_title.text = 'Datastore'

        ds_button = ds_title.new_widget_button()
        ds_button.type = 'open.url'
        ds_button.label = 'Link'
        ds_button.url = 'https://www.zoho.com/catalyst/help/data-store.html'
        ds_title.add_widget_buttons(ds_button)

        ds_text = datastore_section.new_widget_element()
        ds_text.type = 'text'
        ds_text.text = 'The Data Store in Catalyst is a cloud-based relational database management system which stores the persistent data of your application.'

        datastore_section.add_elements(ds_title, ds_text, divider)

        #Functions
        function_section = res.new_widget_section()
        function_section.id = '2'

        fn_title = function_section.new_widget_element()
        fn_title.type = 'title'
        fn_title.text = 'Functions'
        fn_button = fn_title.new_widget_button()
        fn_button.type = 'invoke.function'
        fn_button.label = 'Click here'
        fn_button.name = 'PyFnWidgetButton' # ** ENTER YOUR WIDGET FUNCTION NAME **
        fn_button.id = 'widgetFn'
        fn_title.add_widget_buttons(fn_button)

        fn_text = function_section.new_widget_element()
        fn_text.type = 'text'
        fn_text.text = 'Catalyst Functions are custom-built coding structures which contain the intense business logic of your application.'

        function_section.add_elements(fn_title, fn_text, divider)

        #AutoML
        auto_ml_Section = res.new_widget_section()
        auto_ml_Section.id = '3'

        auto_ml_title = auto_ml_Section.new_widget_element()
        auto_ml_title.type = 'title'
        auto_ml_title.text = 'AutoML'

        auto_ml_text = auto_ml_Section.new_widget_element()
        auto_ml_text.type = 'text'
        auto_ml_text.text = 'AutoML (Automated Machine Learning) is the process of automating the end-to-end traditional machine learning model and' \
                          +' applying it to solve the real-world problems.'

        auto_ml_Section.add_elements(auto_ml_title, auto_ml_text)

        res.add_sections(datastore_section, function_section, auto_ml_Section)

    elif req.event == 'tab_click' or req.event == 'refresh':
        target = req.target.id

        res.active_tab = target
        if target == 'infoTab':
            res.data_type = 'info'
            info = res.new_widget_info()
            info.title = 'Sorry! No tables found.'
            info.description = 'Catalyst Datastore can be used to create and manage tables to store persistent data of your applications!'
            info.image_url = 'https://www.zohowebstatic.com/sites/default/files/styles/product-home-page/public/catalyst-icon.png'

            link_btn = info.new_widget_button()
            link_btn.label = 'Visit Zoho Catalyst'
            link_btn.type = 'open.url'
            link_btn.url = 'https://console.catalyst.zoho.com'
            info.button = link_btn
            res.info = info
            return res

        elif target == 'cliqTab':
            
            # Bot
            bot_section = res.new_widget_section()
            bot_section.id = '4'

            divider = bot_section.new_widget_element() # common divider
            divider.type = 'divider'

            bot_title = bot_section.new_widget_element()
            bot_title.type = 'title'
            bot_title.text = 'Bot'

            bot_text = bot_section.new_widget_element()
            bot_text.type = 'text'
            bot_text.text =  'Bot is your system powered contact or your colleague with which you can interact with as you do with any other person.' \
                            +' The bot can be programmed to respond to your queries, to perform action on your behalf and to notify you for any important event.'

            bot_section.add_elements(bot_title, bot_text, divider)

            # widget
            widget_section = res.new_widget_section()
            widget_section.id = '5'

            widget_title = widget_section.new_widget_element()
            widget_title.type = 'title'
            widget_title.text = 'Widgets'

            widget_text = widget_section.new_widget_element()
            widget_text.type = 'text'
            widget_text.text =  'Widgets are a great way to customize your Cliq home screen. Imagine having a custom view of all the important data and functionality from the different apps that you use every day.'

            widget_section.add_elements(widget_title, widget_text, divider)

            # Connections
            connection_section = res.new_widget_section()
            connection_section.id = '6'

            connectionTitle = connection_section.new_widget_element()
            connectionTitle.type = 'title'
            connectionTitle.text = 'Connections'

            connectionText = connection_section.new_widget_element()
            connectionText.type = 'text'
            connectionText.text = 'Connections is an interface to integrate third party services with your Zoho Service, in this case, Cliq.' \
                                  +' These connections are used in an URL invocation task to access authenticated data.' \
                                  +' To establish a connection, it is necessary to provide a Connection Name, Authentication Type amongst other details.'

            connection_section.add_elements(connectionTitle, connectionText, divider)

            res.add_sections(bot_section, widget_section, connection_section)

        elif target == 'buttonTab':
            # Time
            title_section = res.new_widget_section()
            title_section.id = '100'

            time = title_section.new_widget_element()
            time.type = 'subtext'
            time.text = 'Target:buttons\nTime : ' + str(datetime.datetime.now())

            title_section.add_elements(time)

            # Buttons - Row1
            button_section = res.new_widget_section()

            title = button_section.new_widget_element()
            title.type = 'title'
            title.text = 'Buttons'

            button_element1 = button_section.new_widget_element()
            button_element1.type = 'buttons'

            button1 = button_element1.new_widget_button()
            button1.label = 'link'
            button1.type = 'open.url'
            button1.url = 'https://www.zoho.com'

            button2 = button_element1.new_widget_button()
            button2.label = 'Applet Button'
            button2.type = 'invoke.function'
            button2.name = 'PyFnWidgetButton'
            button2.id = 'banner'

            button3 = button_element1.new_widget_button()
            button3.label = 'Open Channel'
            button3.type = 'system.api'
            button3.set_api('joinchannel/{{id}}', 'CT_1407724818712687474_72317143') # ** ENTER YOUR CHANNEL ID HERE **

            button4 = button_element1.new_widget_button()
            button4.label = 'Preview'
            button4.type = 'preview.url'
            button4.url = 'https://www.zoho.com/catalyst/features.html'

            button_element1.add_widget_buttons(button1, button2, button3, button4)

            # Buttons - Row2

            button_element2 = button_section.new_widget_element()
            button_element2.type = 'buttons'

            button5 = button_element2.new_widget_button()
            button5.label = 'Edit Section'
            button5.type = 'invoke.function'
            button5.name = 'PyFnWidgetButton'
            button5.id = 'section'

            button6 = button_element2.new_button_object()
            button6.label = 'Form Edit Section'
            button6.type = 'invoke.function'
            button6.name = 'PyFnWidgetButton'
            button6.id = 'formsection'

            button7 = button_element2.new_button_object()
            button7.label = 'Banner'
            button7.type = 'invoke.function'
            button7.name = 'PyFnWidgetButton'
            button7.id = 'banner'

            button8 = button_element2.new_button_object()
            button8.label = 'Edit Whole Tab'
            button8.type = 'invoke.function'
            button8.name = 'PyFnWidgetButton'
            button8.id = 'tab'

            button9 = button_element2.new_button_object()
            button9.label = 'Form Edit Tab'
            button9.type = 'invoke.function'
            button9.name = 'PyFnWidgetButton'
            button9.id = 'formTab'

            button_element2.add_widget_buttons(button5, button6, button7, button8, button9)

            button_section.add_elements(title, button_element1, button_element2)
            button_section.id = '101'

            res.add_sections(title_section, button_section)

    first_nav = {
        'label': 'Page : 1',
        'type': 'invoke.function',
        'name': 'PyFnWidgetButton',
        'id': 'breadcrumbs'
    }
   
    link_button = {
        'label': 'Link',
        'type': 'open.url',
        'url': 'https://www.zoho.com'
    }

    banner_button = {
        'label': 'Banner',
        'type': 'invoke.function',
        'name': 'PyFnWidgetButton',
        'id': 'banner'
    }

    res.header = {
        'title' : 'Header 1',
        'navigation' : 'new',
        'buttons' : [first_nav, link_button, banner_button]
    }

    res.footer = {
        'text' : 'Footer text',
        'buttons' : [link_button, banner_button]
    }
    return res
