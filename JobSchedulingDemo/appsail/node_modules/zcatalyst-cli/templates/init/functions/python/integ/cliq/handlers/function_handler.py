from datetime import datetime
from zcatalyst_cliq import function_handler
from zcatalyst_cliq.function_handler import (
    button_function_handler,
    form_submit_handler,
    form_change_handler,
    form_dynamic_field_handler,
    widget_button_handler,
    ButtonFunctionRequest,
    FormFunctionRequest,
    WidgetFunctionRequest,
    HandlerResponse,
    FormChangeResponse,
    FormDynamicFieldResponse,
    WidgetResponse
)


@button_function_handler
def button_fn_handler(req: ButtonFunctionRequest, res: HandlerResponse, *args):
    res.text = 'Button function executed'
    return res



@form_submit_handler
def form_submit(req: FormFunctionRequest, res: HandlerResponse, *args):
    values = req.form.values
    type = None
    if hasattr(values,'type'):
        type = values.type
    if type:
        if type == 'formTab':
            widget_response = function_handler.new_widget_response()
            widget_response.type = 'applet'

            title_section = widget_response.new_widget_section()
            title_section.id = '100'

            edited_by = title_section.new_widget_element()
            edited_by.type = 'title'
            edited_by.text = 'Edited by ' + values.text + ' :wink:'

            time = title_section.new_widget_element()
            time.type = 'subtext'
            time.text = 'Target:buttons\nTime : ' + str(datetime.now())

            title_section.add_elements(edited_by, time)
            widget_response.add_sections(title_section, get_button_section())
            return widget_response
        elif type == 'formsection':
            section = function_handler.new_widget_response().new_widget_section()
            section.id = '102'
            section.type = 'section'

            edited_by = section.new_widget_element()
            edited_by.type = 'title'
            edited_by.text = 'Edited by ' + values.text + ' :wink:'

            section.add_elements(edited_by)

            return section
        else:
            msg = function_handler.new_handler_response().new_message()
            msg.text = 'Applet Button executed successfully'
            msg.type = 'banner'
            msg.status = 'success'
            return msg
        
    text = f"Hi {values.username}, thanks for raising your request. Your request will be processed based on the device availability."
    res.set_text(text)

    card = res.new_card()
    card.title = 'Asset Request'
    res.card = card

    slide = res.new_slide()
    slide.type = 'label'
    slide.title = ''

    data_list = []
    obj1 = {
        'Asset type': values.asset_type.label
    }
    data_list.append(obj1)
    if values.asset_type.value == 'mobile':
        obj2= {
            'Preferred OS': values.mobile_os.label
        }
        data_list.append(obj2)
        obj3 = {
            'Preferred Devices': values.mobile_list.label
        }
        data_list.append(obj3)
    else:
        obj2 = {
            'Device Preferred': values.os_type.label
        }
        data_list.append(obj2)
    slide.data = data_list
    res.add_slides(slide)
    return res


@form_change_handler
def change_form(req: FormFunctionRequest, res: FormChangeResponse, *args):
    target = req.target.name
    values = req.form.values
    field_value = values.asset_type.value

    if target == 'asset_type':
        if field_value == 'laptop':
            select_box_action = res.new_form_modification_action()
            select_box_action.type = 'add_after'
            select_box_action.name = 'asset_type'

            os = select_box_action.new_form_input()
            os.trigger_on_change = True
            os.type = 'select'
            os.name = 'os_type'
            os.label = 'Laptop Type'
            os.hint = 'Choose your preferred OS type'
            os.placeholder = 'Ubuntu'
            os.mandatory = True

            mac = os.new_form_value()
            mac.label = 'Mac OS X'
            mac.value = 'mac'

            windows = os.new_form_value()
            windows.label = 'Windows'
            windows.value = 'windows'

            ubuntu = os.new_form_value()
            ubuntu.label = 'Ubuntu'
            ubuntu.value = 'ubuntu'

            os.add_options(mac, windows, ubuntu)
            select_box_action.input = os

            remove_mobile_OSAction = res.new_form_modification_action()
            remove_mobile_OSAction.type = 'remove'
            remove_mobile_OSAction.name = 'mobile_os'

            remove_mobile_list_action = res.new_form_modification_action()
            remove_mobile_list_action.type = 'remove'
            remove_mobile_list_action.name = 'mobile_list'

            res.add_actions(select_box_action, remove_mobile_OSAction, remove_mobile_list_action)
        
        elif field_value == 'mobile':
            select_box_action = res.new_form_modification_action()
            select_box_action.type = 'add_after'
            select_box_action.name = 'asset_type'

            os = select_box_action.new_form_input()
            os.trigger_on_change = True
            os.type = 'select'
            os.name = 'mobile_os'
            os.label = 'Mobile OS'
            os.hint = 'Choose your preferred mobile OS'
            os.placeholder = 'Android'
            os.mandatory = True

            android = os.new_form_value()
            android.label = 'Android'
            android.value = 'android'

            ios = os.new_form_value()
            ios.label = 'iOS'
            ios.value = 'ios'

            os.add_options(android, ios)
            select_box_action.input = os

            remove_os_type_action = res.new_form_modification_action()
            remove_os_type_action.type = 'remove'
            remove_os_type_action.name = 'os_type'

            res.add_actions(select_box_action, remove_os_type_action)

    elif target == 'mobile_os':
        if field_value:
            mobile_list_action = res.new_form_modification_action()
            mobile_list_action.type = 'add_after'
            mobile_list_action.name = 'mobile_os'

            list_input = mobile_list_action.new_form_input()
            list_input.type = 'dynamic_select'
            list_input.name = 'mobile_list'
            list_input.label = 'Mobile Device'
            list_input.placeholder = 'Choose your preferred mobile device'
            list_input.mandatory = True
            mobile_list_action.input = list_input

            res.add_actions(mobile_list_action)
        else:
            remove_mobile_list_action = res.new_form_modification_action()
            remove_mobile_list_action.type = 'remove'
            remove_mobile_list_action.name = 'mobile_list'

            res.add_actions(remove_mobile_list_action)

    return res


@form_dynamic_field_handler
def handle_dynamic_field(req: FormFunctionRequest, res: FormDynamicFieldResponse, *args):
    target = req.target
    values = req.form.values

    if target.name == 'mobile_list' and values.mobile_os:
        device = values.mobile_os.value
        if device == 'android':
            mobile_list = ['One Plus 6T', 'One Plus 6', 'Google Pixel 3', 'Google Pixel 4']
            for mobile in mobile_list:
                res.add_options(res.new_form_value(mobile,mobile.lower().replace(' ','_')))
        elif device == 'ios':
            mobile_list = ['IPhone XR', 'IPhone XS', 'IPhone X', 'IPhone 13']
            for mobile in mobile_list:
                res.add_options(res.new_form_value(mobile,mobile.lower().replace(' ','_')))
    return res


@widget_button_handler
def widget_button(req: WidgetFunctionRequest, res: WidgetResponse, *args):

    id = req.target.id
    if id == 'tab':
        res.type = 'applet'

        title_section = res.new_widget_section()
        title_section.id = '100'

        time = title_section.new_widget_element()
        time.type = 'subtext'
        time.text = 'Target:buttons\nTime : ' + str(datetime.now())

        title_section.add_elements(time)
        res.add_sections(title_section, get_button_section())

        return res
    
    elif id == 'section':
        section = res.new_widget_section()
        section.id = '102'
        section.type = 'section'
        element = section.new_widget_element()
        element.type = 'title'
        element.text = 'Edited :wink: '

        section.add_elements(element)
        return section

    elif id == 'formTab' or id == 'formsection':
        form = function_handler.new_handler_response().new_form()
        form.title = 'Zylker Annual Marathon'
        form.name = 'a'
        form.hint = 'Register yourself for the Zylker Annual Marathon'
        form.button_label = 'Submit'

        input1 = form.new_form_input()
        input1.type = 'text'
        input1.name = 'text'
        input1.label = 'Name'
        input1.placeholder = 'Scott Fischer'
        input1.min_length = '0'
        input1.max_length = '25'
        input1.mandatory = True

        input2 = form.new_form_input()
        input2.type = 'hidden'
        input2.name = 'type'
        input2.value = id

        form.add_inputs(input1, input2)
        form.action = form.new_form_action('PyFnForm') # ** ENTER YOUR FORM FUNCTION NAME HERE **
        return form

    elif id == 'breadcrumbs':
        page = str(int(req.target.label.split("Page : ")[1].rstrip()) + 1)

        
        section = res.new_widget_section()
        section.id = '12345'

        elem = section.new_widget_element()
        elem.type = 'subtext'
        elem.text = 'Page : ' + page
        section.add_elements(elem)
        res.add_sections(section)

        first_nav = {
            'label': 'Page : ' + page,
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
            'title' : 'Header ' + page,
            'navigation' : 'continue',
            'buttons' : [first_nav, link_button, banner_button]
        }

        res.footer = {
            'text' : 'Footer text',
            'buttons' : [link_button, banner_button]
        }

        res.type = 'applet'
        return res
    else:
        msg = function_handler.new_handler_response().new_message()
        msg.text = 'Applet Button executed successfully'
        msg.type = 'banner'
        msg.status = 'success'
        return msg



def get_button_section():
    widget_response = function_handler.new_widget_response()

    button_section = widget_response.new_widget_section()

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
    button2.label = 'Banner'
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

    button_element1.add_widget_buttons(button1,button2,button3)

    #Buttons - Row2
    button_element2 = button_section.new_widget_element()
    button_element2.type = 'buttons'

    button5 = button_element2.new_widget_button()
    button5.label = 'Edit Section'
    button5.type = 'invoke.function'
    button5.name = 'PyFnWidgetButton'
    button5.id = 'section'

    button6 = button_element2.new_widget_button()
    button6.label = 'Form Edit Section'
    button6.type = 'invoke.function'
    button6.name = 'PyFnWidgetButton'
    button6.id = 'formsection'

    button7 = button_element2.new_widget_button()
    button7.label = 'Banner'
    button7.type = 'invoke.function'
    button7.name = 'PyFnWidgetButton'
    button7.id = 'banner'

    button8 = button_element2.new_widget_button()
    button8.label = 'Edit Whole Tab'
    button8.type = 'invoke.function'
    button8.name = 'PyFnWidgetButton'
    button8.id = 'tab'

    button9 = button_element2.new_widget_button()
    button9.label = 'Form Edit Tab'
    button9.type = 'invoke.function'
    button9.name = 'PyFnWidgetButton'
    button9.id = 'formTab'

    button_element2.add_widget_buttons(button5, button6, button7, button8, button9)

    button_section.add_elements(title, button_element1, button_element2)
    button_section.id = '101'

    return button_section
