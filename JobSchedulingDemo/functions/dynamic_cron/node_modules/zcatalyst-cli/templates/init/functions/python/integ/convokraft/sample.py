import logging
import json
from welcome_handler import handle_welcome_request
from prompt_handler import handle_prompt_request
from fallback_handler import handle_fallback_request
from execute_handler import handle_execute_request
from failure_handler import handle_failure_request

def handler(request, response):
    handler_resp = {}

    try:
        req_body = request.get_request_body()
        todo = req_body.get('todo')
        
        if todo == 'welcome':
            handler_resp = handle_welcome_request(req_body)
        elif todo == 'prompt':
            handler_resp = handle_prompt_request(req_body)
        elif todo == 'execute':
            handler_resp = handle_execute_request(req_body)
        elif todo == 'fallback':
            handler_resp = handle_fallback_request(req_body)
        elif todo == 'failure':
            handler_resp = handle_failure_request(req_body)
        else:
            handler_resp['message'] = 'Error Trying to parse your details'

    except Exception as e:
        logging.error(f'Exception while executing handler: {e}')
        logging.error(f'REQUEST BODY: {req_body}')
        handler_resp['message'] = 'Error Trying to parse your details'

    response.set_status(200)
    response.set_content_type('application/json')
    response.send(json.dumps(handler_resp))
