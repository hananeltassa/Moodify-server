import admin from "firebase-admin";
import serviceAccount from "../moodify-12-firebase-adminsdk-vof02-d7862b8c2f.json"; 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
