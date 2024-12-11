'use strict';
import Cliq from 'zcatalyst-integ-cliq';
const functionHandler = Cliq.CliqFunction();

functionHandler.buttonFunctionHandler(async (req, res) => {
    res.setText('Button function executed');
    return res;
});

functionHandler.formSubmitHandler(async (req, res) => {

    const values = req.form.values;

    const type = values.type;
    if(type !== undefined) {
        if(comp(type, 'formtab')) {
            const widgetResponse = functionHandler.newWidgetResponse();
            widgetResponse.type = 'applet';

            const titleSection = widgetResponse.newWidgetSection();
            titleSection.id = '100';

            const editedBy = titleSection.newWidgetElement();
            editedBy.type = 'title';
            editedBy.text = 'Edited by ' + values.text + ' :wink:';

            const time = titleSection.newWidgetElement();
            time.type = 'subtext';
            time.text = 'Target:buttons\nTime : ' + new Date().toISOString().replace('T', ' ').replace('Z', '');

            titleSection.addElement(editedBy, time);
            widgetResponse.addSection(titleSection, getButtonSection());
            return widgetResponse;
        }
        else if (comp(type, 'formsection')) {
            const section = functionHandler.newWidgetResponse().newWidgetSection();
            section.id = '102';
            section.type = 'section';

            const editedBy = section.newWidgetElement();
            editedBy.type = 'title';
            editedBy.text = 'Edited by ' + values.text + ' :wink:';

            section.addElement(editedBy);

            return section;
        }
        else {
            const msg = functionHandler.newHandlerResponse().newMessage();
            msg.text = 'Applet Button executed successfully';
            msg.type = 'banner';
            msg.status = 'success';
            return msg;
        }
    }

    const text = `Hi ${values.username}, thanks for raising your request. Your request will be processed based on the device availability.`;
    res.setText(text);
    const card = res.newCard();
    card.title = 'Asset Request';
    res.card = card;

    const slide = res.newSlide();
    slide.type = 'label';
    slide.title = '';

    const dataArr = [];
    const obj1 = {
        'Asset type': values['asset-type'].label
    };
    dataArr.push(obj1);
    if(comp(values['asset-type'].value, 'mobile')) {
        const obj2= {
            'Preferred OS': values['mobile-os'].label
        }
        dataArr.push(obj2);
        const obj3 = {
            'Preferred Devices': values['mobile-list'].label
        }
        dataArr.push(obj3);
    }
    else {
        const obj2 = {
            'Device Preferred': values['os-type'].label
        }
        dataArr.push(obj2);
    }
    slide.data = dataArr;
    res.addSlide(slide);
    return res;
});

functionHandler.formChangeHandler(async (req, res) => {
    const target = req.target.name;
    const values = req.form.values;
    const fieldValue = values['asset-type'].value;

    if(comp(target, 'asset-type')) {

        if(fieldValue !== undefined && comp(fieldValue, 'laptop')) {
            const selectBoxAction = res.newFormModificationAction();
            selectBoxAction.type = 'add_after';
            selectBoxAction.name = 'asset-type';

            const os = selectBoxAction.newFormInput();
            os.trigger_on_change = true;
            os.type = 'select';
            os.name = 'os-type';
            os.label = 'Laptop Type';
            os.hint = 'Choose your preferred OS type';
            os.placeholder = 'Ubuntu';
            os.mandatory = true;

            const mac = os.newFormValue();
            mac.label = 'Mac OS X';
            mac.value = 'mac';

            const windows = os.newFormValue();
            windows.label = 'Windows';
            windows.value = 'windows';

            const ubuntu = os.newFormValue();
            ubuntu.label = 'Ubuntu';
            ubuntu.value = 'ubuntu';

            os.addOption(mac, windows, ubuntu);
            selectBoxAction.input = os;

            const removeMobileOSAction = res.newFormModificationAction();
            removeMobileOSAction.type = 'remove';
            removeMobileOSAction.name = 'mobile-os';

            const removeMobileListAction = res.newFormModificationAction();
            removeMobileListAction.type = 'remove';
            removeMobileListAction.name = 'mobile-list';

            res.addAction(selectBoxAction, removeMobileOSAction, removeMobileListAction);

        }
        else if (fieldValue !== undefined && comp(fieldValue,'mobile')) {
            const selectBoxAction = res.newFormModificationAction();
            selectBoxAction.type = 'add_after';
            selectBoxAction.name = 'asset-type';

            const os = selectBoxAction.newFormInput();
            os.trigger_on_change = true;
            os.type = 'select';
            os.name = 'mobile-os';
            os.label = 'Mobile OS';
            os.hint = 'Choose your preferred mobile OS';
            os.placeholder = 'Android';
            os.mandatory = true;

            const android = os.newFormValue();
            android.label = 'Android';
            android.value = 'android';

            const ios = os.newFormValue();
            ios.label = 'iOS';
            ios.value = 'ios';

            os.addOption(android, ios);
            selectBoxAction.input = os;

            const removeOSTypeAction = res.newFormModificationAction();
            removeOSTypeAction.type = 'remove';
            removeOSTypeAction.name = 'os-type';

            res.addAction(selectBoxAction, removeOSTypeAction);
        }
    }
    else if (comp(target, 'mobile-os')) {
        if(fieldValue !== undefined) {
            const mobileListAction = res.newFormModificationAction();
            mobileListAction.type = 'add_after';
            mobileListAction.name = 'mobile-os';

            const listInput = mobileListAction.newFormInput();
            listInput.type = 'dynamic_select';
            listInput.name = 'mobile-list';
            listInput.label = 'Mobile Device';
            listInput.placeholder = 'Choose your preferred mobile device';
            listInput.mandatory = true;
            mobileListAction.input = listInput;

            res.addAction(mobileListAction);
        }
        else {
            const removeMobileListAction = res.newFormModificationAction();
            removeMobileListAction.type = 'remove';
            removeMobileListAction.name = 'mobile-list';

            res.addAction(removeMobileListAction);
        }
    }

    return res;
});

functionHandler.formDynamicFieldHandler(async (req, res) => {
    const target = req.target;
    let query = target.query;
    const values = req.form.values;

    if(comp(target.name, 'mobile-list') && values['mobile-os'] !== undefined) {
        const device = values['mobile-os'].value;
        if(comp(device, 'android')) {
            const arr = ['One Plus 6T', 'One Plus 6', 'Google Pixel 3', 'Google Pixel 2XL'];
            arr.filter((phone) => phone.match(new RegExp(query, 'i'))).
            forEach((phone) => res.addOption(res.newFormValue(phone, phone.toLowerCase().replace(new RegExp(' ', 'g'), '_'))));
        }
        else if (comp(device, 'ios')){
            const arr = ['IPhone XR', 'IPhone XS', 'IPhone X', 'IPhone 8 Plus'];
            arr.filter((phone) => phone.match(new RegExp(query,'i')))
            .forEach((phone) => res.addOption(res.newFormValue(phone, phone.toLowerCase().replace(new RegExp(' ', 'g'), '_'))));
        }
    }
    return res;
});

functionHandler.widgetButtonHandler(async (req, res) => {
    const id = req.target.id;
    switch(id) {
        case 'tab': {
            res.type = 'applet';

            const titleSection = res.newWidgetSection();
            titleSection.id = '100';

            const time = titleSection.newWidgetElement();
            time.type = 'subtext';
            time.text = 'Target:buttons\nTime : ' + new Date().toISOString().replace('T', ' ').replace('Z', '');

            titleSection.addElement(time);
            res.addSection(titleSection, getButtonSection());

            return res;
        }
        case 'section' : {
            const section = res.newWidgetSection();
            section.id = '102';
            section.type = 'section';
            const element = section.newWidgetElement();
            element.type = 'title';
            element.text = 'Edited :wink: ';

            section.addElement(element);
            return section;
        }
        case 'formTab':
        case 'formsection': {
            const form = functionHandler.newHandlerResponse().newForm();
            form.title = 'Zylker Annual Marathon';
            form.name = 'a';
            form.hint = 'Register yourself for the Zylker Annual Marathon';
            form.button_label = 'Submit';

            const input1 = form.newFormInput();
            input1.type = 'text';
            input1.name = 'text';
            input1.label = 'Name';
            input1.placeholder = 'Scott Fischer';
            input1.min_length = '0';
            input1.max_length = '25';
            input1.mandatory = true;

            const input2 = form.newFormInput();
            input2.type = 'hidden';
            input2.name = 'type';
            input2.value = id;

            form.addInputs(input1, input2);
            form.action = form.newFormAction('appletForm');// ** ENTER YOUR FORM FUNCTION NAME HERE **
            return form;
        }
        case 'breadcrumbs': {
            const page = parseInt(req.target.label.split("Page : ")[1].trim()) + 1;
            
            const section = res.newWidgetSection();
            section.id = '12345';

            const elem = section.newWidgetElement();
            elem.type = 'subtext';
            elem.text = 'Page : ' + page;
            section.addElement(elem);
            res.addSection(section);

            const firstNav = {
                label: 'Page : ' + page,
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
                title : 'Header ' + page,
                navigation : 'continue',
                buttons : [firstNav, linkButton, bannerButton]
            };

            res.footer = {
                text : 'Footer text',
                buttons : [linkButton, bannerButton]
            };

            res.type = 'applet';
            return res;
        }
        default: {
            const msg = functionHandler.newHandlerResponse().newMessage();
            msg.text = 'Applet Button executed successfully';
            msg.type = 'banner';
            msg.status = 'success';
            return msg;
        }
    }
});

function getButtonSection() {
    const widgetResponse = functionHandler.newWidgetResponse();

    const buttonSection = widgetResponse.newWidgetSection();

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
    button2.label = 'Banner';
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

    return buttonSection;
}

function comp(var1, var2) {
    return var1.toUpperCase() === var2.toUpperCase();
}
