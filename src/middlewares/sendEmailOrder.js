const { createTransport } = require("nodemailer");

const sendMail = async (email, subject, orderDetails) => {
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
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Order Confirmation</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background-color: #f4f4f9;
                }
                .container {
                    background-color: #eee5da;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    text-align: left;
                    max-width: 600px;
                    margin: 20px;
                }
                h1 {
                    color: #679089;
                    margin-bottom: 10px;
                }
                h3 {
                   color: #f18966;
                }
                p {
                    margin: 10px 0;
                    line-height: 1.5;
                }
                .order-details {
                    margin-top: 20px;
                    padding: 15px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    background-color: #fafafa;
                }
                .order-details h2 {
                    margin-top: 0;
                }
                .order-details p {
                    margin: 5px 0;
                }
            </style>
            </head>
            <body>
            <div class="container">
                <h1>Order Confirmation</h1>
                <p>Dear ${email},</p>
                <p>Thank you for your order! Your order has been successfully placed.</p>
                <div class="order-details">
                <h2>Order Details</h2>
                <p><strong>Order ID:</strong> ${orderDetails.id}</p>
                <p><strong>Date:</strong> ${orderDetails.date}</p>
                <p><strong>Total:</strong> ${orderDetails.total} ${orderDetails.currency}</p>
                </div>
                <p>We hope you enjoy your purchase. If you have any questions, feel free to contact us.</p>
                <p style="font-style: italic;">Best regards,</p>
                <h3>BigFour Co.,LTD</h3>
            </div>
            </body>
        </html>
    `;

    await transport.sendMail({
        from: process.env.Gmail,
        to: email,
        subject: subject,
        html,
    });
};

module.exports = sendMail;