import logging

def handle_prompt_request(req_body):
    logging.info('Handling Prompt request')
    #   This is your Prompt Response Handler. 
    #   This section will let the Bot to filter each param using req_body.get('params'). 
    #   We can write validation logics using that.
    
    if 'paramsToPrompt' not in req_body or len(req_body['paramsToPrompt']) == 0:
        return {
            'todo': 'execute'
        }
    #You can use req_body.get('previousParam').get('name') to understand the last parameter that was prompted 
    #and its value can be taken from req_body.get('params')
    return {
        'todo': 'prompt'
    }
       