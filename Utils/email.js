const nodemailer = require("nodemailer");

const sendEmail = async (option) => {
  // CREATE A TRANSPORTER
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 25,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const emailOptions = {
    from: "MEDEX Support <support@medex.com>",
    to: option.email,
    subject: option.subject,
    text: option.message,
    html: `<p>${option.message}</p>`,
  };

  await transport.sendMail(emailOptions);
};

module.exports = sendEmail;
