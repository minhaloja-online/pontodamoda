/* ==========================================================
   FIREBASE — inicialização única, compartilhada pelo site todo
   ========================================================== */
import { firebaseConfig, isConfigured } from "./config.js";

export { isConfigured };

let app = null, db = null, auth = null, sdk = null;

export async function getFirebase(){
  if(!isConfigured) return null;
  if(app) return { app, db, auth, ...sdk };

  const V = "10.12.5";
  const base = `https://www.gstatic.com/firebasejs/${V}`;

  const [core, fs, au] = await Promise.all([
    import(`${base}/firebase-app.js`),
    import(`${base}/firebase-firestore.js`),
    import(`${base}/firebase-auth.js`)
  ]);

  app  = core.initializeApp(firebaseConfig);
  db   = fs.getFirestore(app);
  auth = au.getAuth(app);

  sdk = {
    // firestore
    collection: fs.collection, doc: fs.doc, getDoc: fs.getDoc, getDocs: fs.getDocs,
    setDoc: fs.setDoc, addDoc: fs.addDoc, updateDoc: fs.updateDoc, deleteDoc: fs.deleteDoc,
    query: fs.query, where: fs.where, orderBy: fs.orderBy, limit: fs.limit,
    writeBatch: fs.writeBatch, serverTimestamp: fs.serverTimestamp,
    // auth
    signInWithEmailAndPassword: au.signInWithEmailAndPassword,
    createUserWithEmailAndPassword: au.createUserWithEmailAndPassword,
    signOut: au.signOut, onAuthStateChanged: au.onAuthStateChanged
  };

  return { app, db, auth, ...sdk };
}
