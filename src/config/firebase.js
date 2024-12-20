import admin from 'firebase-admin';
import fs from 'fs';
const serviceAccount = JSON.parse(fs.readFileSync(new URL('../../moodify-12-firebase-adminsdk-vof02-d7862b8c2f.json', import.meta.url)));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;