from zcatalyst_cliq.message_action_handler import (
    execution_handler,
    MessageActionHandlerRequest,
    HandlerResponse
)


@execution_handler
def msg_action(req: MessageActionHandlerRequest, res: HandlerResponse, *args):
    text = ''
    msg_type = req.message.type
    name = 'user'
    if hasattr(req,'user'):
        name =  req.user.first_name
    text = f"Hey {name}, You have performed an action on a *{msg_type}*."  \
            + "Manipulate the message variable and perform your own action."
    res.set_text(text)
    return res
