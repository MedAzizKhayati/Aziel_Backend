import * as nodemailer from 'nodemailer';

// async..await is not allowed in global scope, must use a wrapper
export const sendEmail = async (email: string, fristname:string) => {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.sendinblue.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'bouhamedfarioula@gmail.com', // generated ethereal user
      pass: process.env.SENDGRID_API_KEY, // generated ethereal password
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Aziel 👻" <barackobama@gmail.com>', // sender address
    to: email, // list of receivers
    subject: 'Confirmation Email', // Subject line
    text: 'Thank you for signing up '+ fristname +'. Welcome to Aziel', // plain text body
    //html: `<b>Hello world?</b> <a href="${link}">confirm Email</a>`, // html body
  });

  console.log('Message sent: %s', info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
};