const nodemailer = require('nodemailer');
const pug = require('pug');

// 'juice': Given HTML, juice will inline your CSS properties into the style attribute.
// check video "#28 17:27" && https://www.npmjs.com/package/juice
const juice = require('juice'); 
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');

const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

const generateHTML = (filename, options = {}) => {
    const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
    // console.log(html);
    return html;
}

exports.send = async (options) => {
    const html = generateHTML(options.filename, options);
    const text = htmlToText.fromString(html);

    const mailOptions = {
        from: 'rfvbnju@hotmail.com',
        to: options.user.email,
        subject: options.subject,
        html,
        text
    };

    /**
     * This func has 'async', the 'promisify' helps 'sendMail' 
     * to be the 'await' part.
     */
    const sendMail = promisify(transport.sendMail, transport);
    return sendMail(mailOptions);
}