const { TWILIO_AUTH_TOKEN, ACCOUNT_TWILIO_SID, TWILIO_NUM_SMS_FROM, TWILIO_NUM_WP_FROM, TWILIO_NUM_TO, MAIL_GMAIL, PASS_GMAIL, NODEMAILER_EMAIL, NODEMAILER_EMAIL_PASSW } = require("../../config/globals");
const twilioClient = require("twilio")(ACCOUNT_TWILIO_SID, TWILIO_AUTH_TOKEN);
const nodemailer = require("nodemailer");
const { newUserEmailContent } = require("../../utils/emailHTML");
const logger = require("../../utils/logger");

const transporterEthereal = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: NODEMAILER_EMAIL,
    pass: NODEMAILER_EMAIL_PASSW,
  },
});

// const transporterGmail = nodemailer.createTransport({
//   service: 'gmail',
//   port: 587,
//   auth: {
//       user: MAIL_GMAIL,
//       pass: PASS_GMAIL
//   }
// });

const sendMailSignup = async (user) => {
  await transporterEthereal.sendMail({
    from: "QuieroVino",
    to: user.email,
    subject: `Nuevo registro`,
    html: newUserEmailContent(user),
  });
  // await transporterGmail.sendMail({
  //   from: "QuieroVino",
  //   to: user.email,
  //   subject: `Nuevo registro`,
  //   html: newUserEmailContent(user),
  // });
  logger.info("Alerta de mail por nuevo usuario enviada");
};

const sendNotificationOrder = async (first_name, email, total, products) => {
  try {
    await transporterEthereal.sendMail({
      from: "QuieroVino",
      to: email,
      subject: `QuieroVino: Nuevo pedido de ${first_name} (${email})`,
      html: `<h3>Detalle de compra en Quiero Vino: </h3>
                <p>Valor total: $${total}</p>
                <ul>Productos: 
                    ${products.map((product) => {
                      return `<li>Nombre: ${product.name} - Precio: $${product.price} - Cantidad: ${product.qty} </li>
                      `;
                    })}
                </ul>    
            `,
    });
    // await transporterGmail.sendMail({
    //   from: "QuieroVino",
    //   to: email,
    //   subject: `QuieroVino: Nuevo pedido de ${first_name} (${email})`,
    //   html: `<h3>Detalle de compra en Quiero Vino: </h3>
    //             <p>Valor total: $${total}</p>
    //             <ul>Productos: 
    //                 ${products.map((product) => {
    //                   return `<li>Nombre: ${product.name} - Precio: $${product.price} - Cantidad: ${product.qty} </li>
    //                   `;
    //                 })}
    //             </ul>    
    //         `,
    // });

    logger.info("Alerta de mail por nueva orden enviada");

    await twilioClient.messages.create({
      body: `
      QuieroVino: Nuevo pedido de ${first_name} (${email})
      Detalle de compra: 
      Valor total: $${total}
      Lista de productos: 
      ${products.map((product) => {
        return `Nombre: ${product.name}
      Precio: ${product.price} Cantidad: ${product.qty}
      `
      })}
      `,
      from: "whatsapp:"+TWILIO_NUM_WP_FROM,
      to: "whatsapp:+549"+TWILIO_NUM_TO,
    });
    logger.info("Alerta de whatsapp por nueva orden enviada");

    await twilioClient.messages.create({
      body: `
      QuieroVino:
      Tu pedido fue recibido y se encuentra en proceso.
      Te enviamos el comprobante del la orden por correo. 
      `,
      from: TWILIO_NUM_SMS_FROM,
      to: "+54"+TWILIO_NUM_TO,
    });
    logger.info("Alerta de sms por nueva orden enviada");

  } catch (error) {
    logger.error(`Error al enviar mail: ${error}`);
  }
};

module.exports = notificationService = () => ({
  async alertNewUser(userData) {
    try {
      await sendMailSignup(userData);
    } catch (error) {
      logger.error(error);
    }
  },

  async alertNewOrder(order) {
    const { first_name, email, phone } = order.user;
    const { total, products } = order;
    try {
      await sendNotificationOrder(first_name, email, total, products);
    } catch (error) {
      logger.error(error);
    }
  },

});

