var app = require('ifnode')(),
    nodemailer = require('nodemailer'),
    handlebars = require('handlebars'),
    fs = require('fs'),

    emailer = app.Component({
        name: 'emailer'
    });

emailer.initialize = function() {
    var mailerConfig = this.config;

    this.mailTransport = nodemailer.createTransport(mailerConfig.config);
    this.emailTemplateBase = fs.readFileSync(mailerConfig.templatePath, { encoding: "utf8" });
};

emailer.send = function(to, key, lang, data, successCallback, errorCallback) {
    var siteUrl = app.config.site.local.origin(),
        mailerConfig = this.config,
        emailTemplateBase = this.emailTemplateBase,
        mailTransport = this.mailTransport;

    if(!lang) {
        lang = 'en-US';
    }

    app.models.emails.findBy({
        key: key,
        lang: lang
    }, function(emailBase) {
        var emailData = {
                data: data,
                siteUrl: siteUrl
            },
            emailBody = handlebars.compile(emailTemplateBase)({
                header: handlebars.compile(emailBase.header)(emailData),
                body: handlebars.compile(emailBase.body)(emailData)
            });

        console.log('Sending email from ' + mailerConfig.fromEmail + ' to ' + to + ' Title: ' + emailBase.title + '  Data:' + JSON.stringify(emailData));

        mailTransport.sendMail({
            from: mailerConfig.fromEmail,
            to: to,
            subject: "=?utf-8?B?" + (new Buffer(emailBase.title).toString('base64')) + "?=", //supermega hack how to use the nonasci chars in email subject
            html: emailBody
        }, function(error, info) {
            if(error) {
                console.log('ERROR!!! Email send eroor from ' + mailerConfig.fromEmail + ' to ' + to + '. Erorr:', error);
                errorCallback('ERROR_SMTP_CAN_NOT_SEND_EMAIL:' + error);
            } else {
                console.log('Message sent: ' + info.response);
                successCallback();
            }
        });
    }, errorCallback);
};
