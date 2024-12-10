const { createTransport } = require("nodemailer");


const sendMail = async (email, subject, newPass) => {
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
      <title>Your verify code</title>
      <style>
          body{
              font-family: Arial, san-serif;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
          }
          .container{
              background-color: #eee5da;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              text-align: center;
          }
           h1{
              color: #679089;
           }
           p{
              margin-bottom: 20px;
           }
           .otp{
              font-size: 36px;
              color: #f18966;
              margin-bottom: 30px;
           }
      </style>
    </head>
    <body>
     <div class="container">
      <h1>New Password</h1>
      <p>Hello ${email} your verify code for reset password is:</p>
      <p class="Password" style="color: #f18966; font-weigth: bold;">${newPass}</p>
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

module.exports = {
  sendMail,
};
