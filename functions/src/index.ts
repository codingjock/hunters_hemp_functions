import * as functions from "firebase-functions";
import { uid } from "uid";
import * as sgMail from "@sendgrid/mail";
import * as admin from 'firebase-admin';
admin.initializeApp();



// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const joinMailingList = functions.https.onRequest(async (request, response) => {
	functions.logger.info(request.body, { structuredData: true });
	response.set("Access-Control-Allow-Origin", "*"); // you can also whitelist a specific domain like "http://127.0.0.1:4000"
	// response.set("Access-Control-Allow-Origin", "http://localhost:64489, https://www.huntershempmt.com, https://huntershempmt.com"); // you can also whitelist a specific domain like "http://127.0.0.1:4000"
	response.set("Access-Control-Allow-Headers", "Content-Type");
	response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  try {
	const db = admin.firestore();
	var body = JSON.parse(request.body);
	console.log(body);
	await db.collection('hunters_hemp_users').doc(body["email"]).set({
		"email": body["email"],
		"emailOptIn": true,
		"emailOptInDateTime": new Date().toUTCString()
	}, { merge: true });
	response.send(body);
  } catch (error) {
	console.log(error);
    response.status(400).send({
      errorText: "An error occured while trying to process your request"
    });
  }
  
});
export const createOrder = functions.https.onRequest(async (request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.set("Access-Control-Allow-Origin", "*"); // you can also whitelist a specific domain like "http://127.0.0.1:4000"
  response.set("Access-Control-Allow-Headers", "Content-Type");
  response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  try {
    let orderId: string = uid(8);
    var body = JSON.parse(request.body);
    // request.body["order_number"] = orderId;
    console.log(request.body);
    sgMail.setApiKey("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");

    let orderData = {
      "first_name": body["first_name"],
      "last_name": body["last_name"],
      "email": body["email"],
      "address_line_1": body["address_line_1"],
      "address_line_2": body["address_line_2"],
      "city": body["city"],
      "state_province_region": body["state_province_region"],
      "postal_code": body["postal_code"],
      "country": body["country"],
      "phone_number": body["phone_number"],
      "Sender_Name": "Hunters",
      "Sender_Email": "sales@huntershempmt.com",
      "Sender_Address": "",
      "Sender_City": "Manhattan",
      "Sender_State": "MT",
      "Sender_Zip": 59741,
      "Sender_Country": "United States",
      "order_number": orderId,
      "order_total": body["order_total"],
      "huntersHempVenmoAccount": "@HuntersH-2019"
    };
    const msg = {
      to: [body["email"], "sales@huntershempmt.com"], // Change to your recipient
      from: "sales@huntershempmt.com", // Change to your verified sender
      templateId: "d-c79c085b1a904832a28df63886c47347",
      dynamicTemplateData: orderData,
    };
	console.log(msg);

	const db = admin.firestore();
	const res = await db.collection("hunters_hemp_orders").doc(orderData.order_number).set(orderData);
	console.log(res);
	response.send(orderData);

    sgMail
      .send(msg)
      .then(async () => {
        console.log("Email sent");
        
      })
      .catch((error) => {
        console.error(error);
        response.status(400).send("There was an error processing the request");
      });
  } catch (error) {
    console.log(error);
    response.status(400).send({
      errorText: "An error occured while trying to process your request"
    });

  }

});
