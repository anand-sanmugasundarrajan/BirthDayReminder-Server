import json
from zcatalyst_cliq.bot_handler import (
    welcome_handler,
    message_handler,
    context_handler,
    mention_handler,
    menu_action_handler,
    webhook_handler,
    participation_handler,
    BotWelcomeHandlerRequest,
    BotMessageHandlerRequest,
    BotContextHandlerRequest,
    BotMentionHandlerRequest,
    BotMenuActionHandlerRequest,
    BotParticipationHandlerRequest,
    BotWebHookHandlerRequest,
    HandlerResponse
)
from zcatalyst_sdk.catalyst_app import CatalystApp
import logging

@welcome_handler
def welcome_handler_fn(req: BotWelcomeHandlerRequest, res: HandlerResponse, *args):
    res.text = f'hello {req.user.first_name}'
    return res


@message_handler
def msg_handler(req: BotMessageHandlerRequest, res: HandlerResponse, *args):
    try:
        msg = req.message
        text = ''
        if not msg:
            text = 'Please enable \'Message\' in bot settings'
        elif msg == 'hi' or msg == 'hello':
            text = f'Hi {req.user.first_name} :smile: . How are you doing ??'

            suggestions = res.new_suggestion_list()

            suggestions.add_suggestions(
                suggestions.new_suggestion('Good'),
                suggestions.new_suggestion('Not Bad'),
                suggestions.new_suggestion('meh'),
                suggestions.new_suggestion('Worst'),
            )
            res.suggestions = suggestions
        elif msg == 'Good' or msg == 'Not Bad':
            text = 'That\'s glad to hear :smile:'
        elif msg == 'meh' or msg == 'Worst':
            text = "Oops! Don't you worry. Your day is definitely going to get better. :grinning:"
        elif msg == 'details':
            text = 'welcome to details collection center :wink:'
            context = res.new_context()
            context.id = 'personal_details'
            context.timeout = 300

            param1 = context.new_param()
            param1.name = 'name'
            param1.question = 'Please enter your name: '
            
            param2 = context.new_param()
            param2.name = 'dept'
            param2.question = 'Please enter your department: '
            param2.add_suggestion('CSE')
            param2.add_suggestion('IT')
            param2.add_suggestion('MECH')

            param3 = context.new_param()
            param3.name = 'cache'
            param3.question = "Do you wish to put this detail in Catalyst Cache ?"
            param3.add_suggestion('YES')
            param3.add_suggestion('NO')
            
            context.add_params(param1, param2, param3)
            res.context = context
        else:
            text = "Oops! Sorry, I'm not programmed yet to do this :sad:"
        res.set_text(text)
        return res
    except Exception as e:
        logging.error(e)
        return
    
@context_handler
def ctx_handler(req: BotContextHandlerRequest, res: HandlerResponse, *args):
    app: CatalystApp = args[0]
    if req.context_id == 'personal_details':
        answer = req.answers
        name = answer.name.text
        dept = answer.dept.text

        text = f'Nice! I have collected your info: \n*Name*: {name} \n*Department*: {dept}'

        if answer.cache.text == 'YES':
            try:
                default_segment = app.cache().segment()
                default_segment.put('Name', name)
                default_segment.put('Department', dept)
                text += '\nThis data is now available in Catalyst Cache\'s default segment.'
            except Exception as e:
                logging.error(e)
        res.set_text(text)
    return res


@mention_handler
def mention_handler(req: BotMentionHandlerRequest, res: HandlerResponse, *args):
    text = f"Hey *{req.user.first_name}*, thanks for mentioning me here. I'm from Catalyst city"
    res.set_text(text)
    return res


@menu_action_handler
def action(req: BotMenuActionHandlerRequest, res: HandlerResponse, *args):
    text = ''
    if req.action_name == 'Say Hi':
        text = 'Hi'
    elif req.action_name == 'Look Angry':
        text = ':angry:'
    else:
        text = 'Menu action triggered :fist:'

    res.set_text(text)
    return res


@participation_handler
def participation(req: BotParticipationHandlerRequest, res: HandlerResponse, *args):
    text = ''
    if req.operation == 'added':
        text = 'Hi. Thanks for adding me to the channel :smile:'
    elif req.operation == 'removed':
        text = 'Bye-Bye :bye-bye:'
    else:
        text = 'I\'m too a participant of this chat :wink:'

    res.set_text(text)
    return res

@webhook_handler
def webhook_fn(req: BotWebHookHandlerRequest, res: HandlerResponse, *args):
    req_body: dict = json.loads(req.body)
    post_json_msg = req_body.get('message')

    res.bot = res.new_bot_details('PostPerson', 'https://www.zoho.com/sites/default/files/catalyst/functions-images/icon-robot.jpg')
    
    card = res.new_card()
    card.title = 'New Mail'
    card.thumbnail = 'https://www.zoho.com/sites/default/files/catalyst/functions-images/mail.svg'
    res.card = card

    button = res.new_button()
    button.label = 'open mail'
    button.type = '+'
    button.hint = 'Click to open the mail in a new tab'

    action = button.new_action_object()
    action.type = 'open.url'

    action_data = action.new_action_data_obj()
    action_data.web = 'https://mail.zoho.com/zm/#mail/folder/inbox/p/${reqBody.messageId}'
    
    action.data = action_data
    button.action= action

    res.add_button(button)

    gif_slide = res.new_slide()
    gif_slide.type = 'images'
    gif_slide.title = ''
    gif_slide.data = ['https://media.giphy.com/media/efyEShk2FJ9X2Kpd7V/giphy.gif']
    res.add_slides(gif_slide)

    return res
