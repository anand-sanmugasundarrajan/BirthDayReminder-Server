from typing import List
import zcatalyst_cliq.command_handler as command
from zcatalyst_cliq.command_handler import (
    execution_handler,
    suggestion_handler,
    CommandHandlerRequest,
    CommandSuggestion,
    HandlerResponse
)

@execution_handler
def executor(req: CommandHandlerRequest, res: HandlerResponse, *args):
    text = ''
    cmd = req.name
    if cmd == 'catalyst':
        suggestions = req.selections
        if not suggestions:
            text = 'Please select a suggestion from the command'
        else:
            prefix = 'Take a look at our '
            if suggestions[0].title == 'API doc':
                text = prefix + '[API Documentation](https://www.zoho.com/catalyst/help/api/introduction/overview.html)'
            elif suggestions[0].title == 'CLI doc':
                text = prefix + '[CLI Documentation](https://www.zoho.com/catalyst/help/cli-command-reference.html)'
            else:
                text = prefix + '[help documentation](https://www.zoho.com/catalyst/help/)'
    elif cmd == 'raisereq':
        return get_form()
    else:
        text = 'Command executed successfully!'
    res.text = text
    return res


@suggestion_handler
def suggester(req: CommandHandlerRequest, res: List[CommandSuggestion], *args):
    if req.name == 'catalyst':
        suggestion1 = command.new_command_suggestion()
        suggestion1.title = 'API doc'
        suggestion1.description = 'Catalyst API documentation'
        suggestion1.imageurl = 'https://www.zohowebstatic.com/sites/default/files/styles/product-home-page/public/catalyst-icon.png'

        suggestion2 = command.new_command_suggestion()
        suggestion2.title = 'CLI doc'
        suggestion2.description = 'Catalyst CLI documentation'
        suggestion2.imageurl = 'https://www.zohowebstatic.com/sites/default/files/styles/product-home-page/public/catalyst-icon.png'

        suggestion3 = command.new_command_suggestion()
        suggestion3.title = 'Help docs'
        suggestion3.description = 'Catalyst help documentation'
        suggestion3.imageurl = 'https://www.zohowebstatic.com/sites/default/files/styles/product-home-page/public/catalyst-icon.png'

        res.extend([suggestion1,suggestion2,suggestion3])
        return res


def get_form():
    form = command.new_handler_response().new_form()
    form.title = 'Asset Request'
    form.hint = 'Raise your asset request'
    form.name = 'ID'
    form.button_label = 'Raise Request'
    form.version = 1

    actions = form.new_form_actions_obj()
    actions.submit = actions.new_form_action('PyFnForm')  # ENTER YOUR FORM FUNCTION NAME HERE

    form.actions = actions

    user_name = form.new_form_input()
    user_name.type = 'text'
    user_name.name = 'username'
    user_name.label = 'Name'
    user_name.hint = 'Please enter your name'
    user_name.placeholder = 'John Reese'
    user_name.mandatory = True
    user_name.value = 'Harold Finch'
    form.add_inputs(user_name)

    email = form.new_form_input()
    email.type = 'text'
    email.format = 'email'
    email.name = 'email'
    email.label = 'Email'
    email.hint = 'Enter your email address'
    email.placeholder = "johnreese@poi.com"
    email.mandatory = True
    email.value = "haroldfinch@samaritan.com"
    
    asset_type = form.new_form_input()
    asset_type.type = 'select'
    asset_type.trigger_on_change = True
    asset_type.name = 'asset_type'
    asset_type.label = "Asset Type"
    asset_type.hint = "Choose your request asset type"
    asset_type.placeholder = "Mobile"
    asset_type.mandatory = True
    asset_type.add_options(asset_type.new_form_value('Laptop', 'laptop'))
    asset_type.add_options(asset_type.new_form_value('Mobile', 'mobile'))
    
    form.add_inputs(email, asset_type)
    return form
