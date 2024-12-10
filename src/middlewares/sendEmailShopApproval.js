const { createTransport } = require("nodemailer");

const sendShopApprovalMail = async (email, shopName) => {
    const transport = createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.Gmail,
            pass: process.env.Password,
        },
    });

    const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Shop Approval Confirmation</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f9;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #eee5da;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    color: #679089;
                }
                h3 {
                    color: #f18966;
                p {
                    line-height: 1.5;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Congratulations, ${shopName}!</h1>
                <p>We are excited to inform you that your shop registration has been successfully approved.</p>
                <p>Your shop is now active and ready for customers. You can start managing your products and orders right away.</p>
                <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
                <p>Thank you for joining us, and we wish you success!</p>
                <p style="font-style: italic;">Best regards,</p>
                <h3>BigFour CO.,LTD</h3>
            </div>
        </body>
        </html>
    `;

    await transport.sendMail({
        from: process.env.Gmail,
        to: email,
        subject: "Shop Registration Approved",
        html,
    });
};

module.exports = sendShopApprovalMail;
