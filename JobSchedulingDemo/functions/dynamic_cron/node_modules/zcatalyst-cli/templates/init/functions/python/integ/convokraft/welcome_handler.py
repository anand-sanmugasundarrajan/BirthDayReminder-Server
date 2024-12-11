import logging

def handle_welcome_request(req_body):
    #  This is your Welcome message Handler. 
    #   You need to write the default Welcome message your want your bot to greet its users. 
    #   The way to return welcome message is as follows : 
    #  {
    #   'welcome_response': {
    #        'message': 'Welcome to your Bot. Please ask your queries'
    #           }
    #  }
    #   Sample code to set the same is available Below.
    logging.info('Handling welcome request')
    
    return {
        'welcome_response': {
            'message': 'Welcome to your Bot. Please ask your queries'
        }
    }
