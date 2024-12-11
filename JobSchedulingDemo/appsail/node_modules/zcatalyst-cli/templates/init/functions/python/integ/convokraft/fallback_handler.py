import logging

def handle_fallback_request(req_body):
    #   This is your Fallback Response Handler. 
    #   You need to write the Fallback Response when the bot doesn't know what to respond to users. 
    #   The way to return fallback message is to be returned is as follows : 
    #       {
    #        'message': 'Fallback Response: Please define this question and try again'
    #       }
    #   Sample code to set the same is available Below.
    logging.info('Handling fallback request')
    
    return {
        'message': 'Fallback Response: Please define this question and try again',
        'status':'handled'
    }
