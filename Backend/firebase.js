const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// On Render/Vercel set FIREBASE_SERVICE_ACCOUNT_JSON to the full service-account JSON.
// Locally, fall back to the gitignored firebase.admin.json file.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
    : require('./firebase.admin.json');

const app = initializeApp({
    credential: cert(serviceAccount),
});

const adminAuth = getAuth(app);

module.exports = adminAuth;
