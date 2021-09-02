const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const STRINGS = require("../utils/texts");
const ENV = process.env;

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: ENV.MAILER_HOST,
      auth: {
        user: ENV.MAILER_SENDER_EMAIL,
        pass: ENV.MAILER_PASSWORD,
      },
    });
  }


  async requestEmailVerification(to, token) {
    let from = `${ENV.APP_NAME} <no-reply${ENV.MAILER_DOMAIN}>`;
    if (!to) 
    res
    .status(400)
    .send(response(STRINGS.TEXTS.STRINGS.ERRORS.userNotFound));
    // Email Starts
    const filePath = path.join(
      __dirname,
      "../html_templates/userCreated.html"
    );
    let link = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const source = fs.readFileSync(filePath, "utf-8").toString();
    const template = handlebars.compile(source);
    const replacements = {
      name: to.email ,
      email: to.email,
      link: link,
    };
    const htmlToSend = template(replacements);

    await this.transporter.sendMail({
      from,
      to: Array.isArray(to.email) ? to.join() : to.email,
      subject: STRINGS.TEXTS.requestEmailVerificationSubject,
      html: htmlToSend,
    });

    return;
  }

  async sendForgotPasswordEmail(to, token) {
    let from = `${ENV.APP_NAME} <no-reply${ENV.MAILER_DOMAIN}>`;
    if (!to) 
    res
    .status(400)
    .send(response(STRINGS.TEXTS.STRINGS.ERRORS.userNotFound));
    // Email Starts
    const filePath = path.join(
      __dirname,
      "../html_templates/requestResetPassword.html"
    );
    let link = `${process.env.CLIENT_URL}/forgot-password/${token}`;

    const source = fs.readFileSync(filePath, "utf-8").toString();
    const template = handlebars.compile(source);
    const replacements = {
      name: to.email ,
      email: to.email,
      link: link,
    };
    const htmlToSend = template(replacements);

    await this.transporter.sendMail({
      from,
      to: Array.isArray(to.email) ? to.join() : to.email,
      subject: STRINGS.TEXTS.requestEmailVerificationSubject,
      html: htmlToSend,
    });

    return;
  }


}

module.exports = MailService;