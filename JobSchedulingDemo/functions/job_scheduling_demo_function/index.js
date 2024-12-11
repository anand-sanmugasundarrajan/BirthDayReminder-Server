'use strict';

const catalyst = require('zcatalyst-sdk-node');

module.exports = async (jobRequest, context) => {
    const catalystApp = catalyst.initialize(context);

    try {

        const recipientEmail = 'adhitya.balamurugan@zohocorp.com'; 
        const alertSubject = 'Alert Notification';
        const alertMessage = 'This is an alert message triggered by the preferred cron job.';


        await catalystApp.email().sendMail({
            from_email: 'adhitya.balamurugan@zohocorp.com', 
            to_email: [recipientEmail],
            subject: alertSubject,
            content: alertMessage,
            html_mode: false 
        });

        console.log(`Alert email sent successfully to ${recipientEmail}`);
        context.closeWithSuccess('Alert email sent successfully.');
    } catch (error) {
        console.error('Error:', error);
        context.closeWithFailure('Failed to send alert email.');
    }
};
