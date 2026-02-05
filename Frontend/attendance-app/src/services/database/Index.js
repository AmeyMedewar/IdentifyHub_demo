/**
 * Database Service - Main Export
 * 
 * Yaha se database change karo!
 * Sirf is file mein ek line change karni hai future mein
 */

import FirebaseAdapter from './FirebaseAdapter';
// Future databases:
// import MongoAdapter from './MongoAdapter';
// import SupabaseAdapter from './SupabaseAdapter';
// import BackendAPIAdapter from './BackendAPIAdapter';

// ✅ DATABASE YAHA CHANGE KARO - BAS EK LINE!
const database = new FirebaseAdapter();
// const database = new MongoAdapter();
// const database = new BackendAPIAdapter();

export default database;