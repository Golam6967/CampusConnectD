const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// On Render/Vercel set FIREBASE_SERVICE_ACCOUNT_JSON to the full service-account JSON.
// Locally, fall back to the gitignored firebase.admin.json file.
let rawServiceAccount = (process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '').trim();
// Tolerate a stray wrapping quote (some .env importers keep it).
if (/^['"]\{/.test(rawServiceAccount) && rawServiceAccount.endsWith(rawServiceAccount[0])) {
    rawServiceAccount = rawServiceAccount.slice(1, -1);
}

const serviceAccount = rawServiceAccount
    ? JSON.parse(rawServiceAccount)
    : require('./firebase.admin.json');

const app = initializeApp({
    credential: cert(serviceAccount),
});

const adminAuth = getAuth(app);

module.exports = adminAuth;
