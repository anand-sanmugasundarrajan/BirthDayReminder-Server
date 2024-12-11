'use strict';
const path = require("path")
const express = require('express');
const app = express();
const catalyst = require('zcatalyst-sdk-node');
const catalystApp = catalyst.initialize(req);

const { CatalystApp } = require("zcatalyst-sdk-node/lib/catalyst-app")

app.use(express.json());

app.use("/", express.static(path.join(__dirname, "client")));

app.post('/execute/insertReminder', async (req, res) => {
    console.log("Request body:", req.body);
    try {
        const datastores = catalystApp.datastore();
        const table = datastores.table('24071000000189087');
        await insertReminder(req.body, table, catalystApp);
        res.status(200).json({ status: 200, message: "Reminder added successfully" });
    } catch (error) {
        console.error('Error adding reminder:', error);
        res.status(500).json({ Error: error.message });
    }
});

app.post('/execute/getReminder', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const datastores = catalystApp.datastore();
        const table = datastores.table('24071000000189087');
        const reminders = await getReminders(catalystApp, table);
        res.status(200).json(reminders);
    } catch (error) {
        console.error('Error retrieving reminders:', error);
        res.status(500).json({ Error: error.message });
    }
});

app.put('/execute/updateReminder', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const datastores = catalystApp.datastore();
        const table = datastores.table('24071000000189087');
        await updateReminder(req.body, table, catalystApp);
        res.status(200).json({ status: 200, message: "Reminder updated successfully" });
    } catch (error) {
        console.error('Error updating reminder:', error);
        res.status(500).json({ Error: error.message });
    }
});

app.patch('/execute/toggleAutoSend', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const datastores = catalystApp.datastore();
        const table = datastores.table('24071000000189087');
        await toggleAutoSend(req.body, table, catalystApp);
        res.status(200).json({ status: 200, message: "Auto send toggled status successfully" });
    } catch (error) {
        console.error('Error toggling status:', error);
        res.status(500).json({ Error: error.message });
    }
});

app.delete('/execute/deleteReminder', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const datastores = catalystApp.datastore();
        const table = datastores.table('24071000000189087');
        await deleteReminder(req.body, table, catalystApp);
        res.status(200).json({ status: 200, message: "Reminder deleted successfully" });
    } catch (error) {
        console.error('Error deleting reminder:', error);
        res.status(500).json({ Error: error.message });
    }
});
module.exports = app;

app.listen(process.env.X_ZOHO_CATALYST_LISTEN_PORT || 9000, () => {
    console.log("Server Started")
})


async function toggleAutoSend(requestBody, table, catalystApp) {
    const { id, status } = requestBody;
    const enableStatus = status === 'enable';

    const zcql = catalystApp.zcql();
    const query = `SELECT * FROM BirthDayReminder WHERE ROWID = '${id}'`;
    const response = await zcql.executeZCQLQuery(query);

    if (!response || response.length === 0) throw new Error('Reminder not found.');

    const row = response[0].BirthDayReminder;
    row.AutoSend = enableStatus;

    const jobScheduling = catalystApp.jobScheduling();
    if (!enableStatus) {
        await jobScheduling.CRON.deleteCron(`bday_${id.substring(10, 17)}`);
    } else {
        await scheduleCronJob(row, catalystApp);
    }

    const updateQuery = `UPDATE BirthDayReminder SET AutoSend = ${enableStatus} WHERE ROWID = '${id}'`;
    await zcql.executeZCQLQuery(updateQuery);
}

async function insertReminder(requestBody, table, catalystApp) {

    const { name, birthday, message, email, template, userId } = requestBody;

    if (!name || !birthday || !message || !email) throw new Error('Missing required fields.');

    const row = { Name: name, BirthDay: birthday, Message: message, Email: email, template: template, userId: userId };

    try {
        const insertedRow = await table.insertRow(row);
        console.log('Row inserted:', insertedRow);
        await scheduleCronJob(insertedRow, catalystApp);
    } catch (error) {
        console.error('Error inserting reminder:', error);
        throw error;
    }
}

async function getReminders(catalystApp, table) {
    try {
        const zcql = catalystApp.zcql();
        const query = 'SELECT * FROM BirthDayReminder';
        const response = await zcql.executeZCQLQuery(query);

        if (!Array.isArray(response)) throw new Error('Invalid response from ZCQL query');

        return response.map(row => {
            const reminder = row.BirthDayReminder;
            return {
                ID: reminder.ROWID || 'N/A',
                Name: reminder.Name || 'N/A',
                BirthDay: reminder.BirthDay || 'N/A',
                Message: reminder.Message || 'N/A',
                Email: reminder.Email || 'N/A',
                AutoSend: reminder.AutoSend || false
            };
        });

    } catch (error) {
        console.error('Error retrieving reminders:', error.message);
        throw error;
    }
}

async function updateReminder(requestBody, table, catalystApp) {
    const { id, name, birthday, message, email, template } = requestBody;
    const jobScheduling = catalystApp.jobScheduling();
    if (!id || !name || !birthday || !message || !email) throw new Error('Missing required fields.');
    const zcql = catalystApp.zcql();
    const query = `SELECT AutoSend FROM BirthDayReminder WHERE ROWID = '${id}'`;
    const response = await zcql.executeZCQLQuery(query);
    const AutoSend = response[0]?.BirthDayReminder?.AutoSend || false;
    const row = { ROWID: id, Name: name, BirthDay: birthday, Message: message, Email: email, template: template };
    if (AutoSend) {
        await jobScheduling.CRON.deleteCron(`bday_${id.substring(10, 17)}`);
        try {
            await table.updateRow(row);
            console.log('Row updated:', row);
            await scheduleCronJob(row, catalystApp);
        } catch (error) {
            console.error('Error updating reminder:', error);
            throw error;
        }
    } else {
        try {
            await table.updateRow(row);
            console.log('Row updated:', row);
        } catch (error) {
            console.error('Error updating reminder:', error);
            throw error;
        }
    }
}

async function deleteReminder(requestBody, table, catalystApp) {
    const { id } = requestBody;
    if (!id) throw new Error('ID is missing.');

    const zcql = catalystApp.zcql();
    const query = `SELECT AutoSend FROM BirthDayReminder WHERE ROWID = '${id}'`;
    const response = await zcql.executeZCQLQuery(query);
    const AutoSend = response[0]?.BirthDayReminder?.AutoSend || false;

    const jobScheduling = catalystApp.jobScheduling();
    if (AutoSend) {
        await jobScheduling.CRON.deleteCron(`bday_${id.substring(10, 17)}`);
    }

    await table.deleteRow(id);
    console.log('Reminder deleted:', id);
}

// async function scheduleCronJob(row, catalystApp) {
//     const jobScheduling = catalystApp.jobScheduling();
//     const { ROWID, BirthDay, Name, Email, Message, template } = row;
//     const jobMeta = {
//         job_name: `bday_${ROWID.substring(10, 17)}`,
//         jobpool_name: 'test',
//         jobpool_id: '24071000000189896',
//         target_type: 'FUNCTION',
//         target_name: 'dynamic_cron',
//         job_service_identifier: 'default',
//         retries: 2,
//         retry_interval: 900,
//         params: { id: ROWID, name: Name, email: Email, message: Message, birthday: BirthDay, template: template }
//     };

//     const dob = new Date(BirthDay);
//     const cronDetail = {
//         cron_name: `bday_${ROWID.substring(10, 17)}`,
//         description: `Birthday reminder for ${Name}`,
//         cron_status: true,
//         cron_type: 'CALENDAR',
//         cron_detail: {
//             hour: 0,
//             minute: 0,
//             second: 0,
//             days: [dob.getDate()],
//             months: [dob.getMonth()],
//             repetition_type: 'YEARLY'
//         },
//         job_meta: {
//             job_name: `bday_${ROWID.substring(10, 17)}`,
//             jobpool_name: 'test',
//             jobpool_id: '24071000000189896',
//             target_type: 'FUNCTION',
//             target_name: 'dynamic_cron',
//             job_service_identifier: 'default',
//             retries: 2,
//             retry_interval: 900,
//             params: { id: ROWID, name: Name, email: Email, message: Message, birthday: BirthDay, template: template }
//         }
//     };

//     try {
//         const yearlyCronDetails = await jobScheduling.CRON.createCron(cronDetail);
//         console.log('Yearly cron created:', yearlyCronDetails);
//     } catch (error) {
//         console.error('Error scheduling cron job:', error);
//         throw error;
//     }
// }

async function scheduleCronJob(row, catalystApp) {
    const jobScheduling = catalystApp.jobScheduling();
    const { ROWID, BirthDay, Name, Email, Message, template } = row;

    const jobMeta = {
        job_name: `bday_${ROWID.substring(10, 17)}`,
        jobpool_name: 'test',
        jobpool_id: '24071000000189896',
        target_type: 'FUNCTION',
        target_name: 'dynamic_cron',
        job_service_identifier: 'default',
        retries: 2,
        retry_interval: 900,
        params: { id: ROWID, name: Name, email: Email, message: Message, birthday: BirthDay, template: template }
    };

    const dob = new Date(BirthDay);
    const month = dob.getMonth() + 1; 
    const day = dob.getDate();
    const hour = 0; 
    const minute = 0; 
    const second = 0; 

    const cronExpression = `${minute} ${hour} ${day} ${month} *`;

    const cronDetail = {
        cron_name: `bday_${ROWID.substring(10, 17)}`,
        description: `Birthday reminder for ${Name}`,
        cron_status: true,
        cron_type: 'CRONEXPRESSION', 
        cron_expression: cronExpression,
        job_meta: jobMeta 
    };

    try {
        const yearlyCronDetails = await jobScheduling.CRON.createCron(cronDetail);
        console.log('Yearly cron created:', yearlyCronDetails);
    } catch (error) {
        console.error('Error scheduling cron job:', error);
        throw error;
    }
}

