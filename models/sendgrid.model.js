const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(assignedUser, user, title, userId) {
    const msg = {
        from: { name: 'MagicEditor', email: 'bashikr@gmail.com' },
        "personalizations": [
            {
                "to": [
                    {
                        "email": assignedUser
                    }
                ],
                "dynamic_template_data": {
                    "emailSender": user,
                    "title": title,
                    "emailReceiver": assignedUser,
                    "id": userId
                }
            }
        ],
        "template_id": "d-0fc1b93063434ddb92c9d9ea44528b2a"
    };

    //ES8
    (async () => {
        try {
            await sgMail.send(msg);
        } catch (error) {
            console.error(error);

            if (error.response) {
                console.error(error.response.body);
            }
        }
    })();
}

module.exports = {
    sendEmail: sendEmail,
};
