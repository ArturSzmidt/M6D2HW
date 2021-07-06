import sgMail from '@sendgrid/mail';

export const sendEmail = async (recipientAddress) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: recipientAddress,
    from: process.env.SENDER_EMAIL,
    subject: 'Hello from Strive',
    text: 'bla bla bla bla bla bla bla bla bla bla bla bla',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  };

  await sgMail.send(msg);
};
