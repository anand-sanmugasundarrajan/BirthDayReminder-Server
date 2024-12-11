import logging

def handle_failure_request(req_body):
    #  This is your Failure Response Handler. 
    #    You need to write the Failure Response when the bot Fails during execution of the function. 
    #    The way to return Failure message is to be returned is as follows : 
    #       {
    #           'message': 'Sorry, Something went wrong'
    #       }
    #   Sample code to set the same is available Below.
    logging.info('Handling failure request')
    
    return {
        'message': 'Failure Response: Please define this question and try again'
    }
