const nodemailer = require('nodemailer');

const { emailAPIKey } = require('../environment.js');
const { logInfo } = require('./errors.js')

const host = "smtp.sendgrid.net";
const username = "apikey";

const transporter = nodemailer.createTransport({
  host: host,
  port: 465,
  secure: true,
  auth: {
    user: username,
    pass: emailAPIKey,
  },
});

exports.sendEmailVerificationEmail = async ({email, tokenKey}) => {
  let link = "https://ambassadors.jmkride.com/verify-email?key=" + tokenKey;
  await transporter.sendMail({
    from: '"JMKRIDE" <noreply@jmkride-internal.link>',
    to: email,
    subject: "Please verify your email.",
    html: (
      "<h1>JMKRIDE Ambassador Email Verification</h1>" +
      "<p>Hi there!<br>Thank you for signing up to be an Ambassador " +
      "for JMKRIDE! We need to verify your email for account security, " +
      "so please <a href='" + link + "'>click here to verify your email</a>, " +
      "or copy and paste the following link into your browser:<br>" + link +
      "<br><br><br>Thanks for being a part of our community!<br>- JMKRIDE"
    ),
  });
}

exports.sendTestEmail = async () => {
  await transporter.sendMail({
    from: '"JMKRIDE" <noreply@jmkride-internal.link>',
    to: "jeff@jmkride.com",
    subject: "Test email",
    text: "Test text",
  });
  console.log("sent.");
}
