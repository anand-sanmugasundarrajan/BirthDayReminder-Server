'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const catalyst = require('zcatalyst-sdk-node');

module.exports = async (jobRequest, context) => {
    const catalystApp = catalyst.initialize(context);
    const smartbrowz = catalystApp.smartbrowz();
    const filestore = catalystApp.filestore();

    try {
        const { id, name, email, message, birthday, template } = jobRequest.getAllJobParams();

        const templateId = template;

        //push notification implementation 
        //Get a pushNotification instance 
        const pushNotification = catalystApp.pushNotification();
        // get the details of the current user as a promise
        let userManagement = catalystApp.userManagement();
        let userPromise = userManagement.getCurrentUser();
        userPromise.then(currentUser => {
            console.log(currentUser.user_id);
        });
        
        catalystApp.pushNotification().web().sendNotification("Hi there! The task you scheduled has been completed.",currentUser.user_id);


        const inputStream = await smartbrowz.generateFromTemplate(templateId, {
            template_data: { Name: name, Message: message, BirthDay: birthday, Email: email }
        });

        if (!inputStream || typeof inputStream.pipe !== 'function') {
            throw new Error('Invalid input stream received from smartbrowz');
        }

        const filepath = path.join(os.tmpdir(), `${id}.pdf`);
        await new Promise((resolve, reject) => {
            const fileStream = fs.createWriteStream(filepath);
            inputStream.pipe(fileStream)
                .on('finish', resolve)
                .on('error', reject);
        });

        const folder = filestore.folder('24071000000189857');
        const fileUploadResponse = await folder.uploadFile({
            code: fs.createReadStream(filepath),
            name: `${id}.pdf`
        });
        console.log('File uploaded successfully:', fileUploadResponse);

        await catalystApp.email().sendMail({
            from_email: 'adhitya.balamurugan@zohocorp.com',
            to_email: [email],
            html_mode: true,
            subject: `Birthday Wishes for ${name}`,
            content: `Hello ${name},<br><br>${message}`,
            attachments: [fs.createReadStream(filepath)]
        });

        console.log(`Email sent successfully to ${email}`);
        fs.unlinkSync(filepath);

        context.closeWithSuccess('Email sent successfully.');
    } catch (error) {
        console.error('Error:', error);
        context.closeWithFailure('Failed to send email.');
    }
};
