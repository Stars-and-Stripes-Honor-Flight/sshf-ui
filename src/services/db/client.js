import nano from 'nano';

const dbUrl = process.env.NEXT_PUBLIC_DB_URL;
const dbUser = process.env.NEXT_PUBLIC_DB_USER;
const dbPass = process.env.NEXT_PUBLIC_DB_PASS;

// Database connection is initialized once and reused
const db = nano(dbUrl, {    
    auth: {
        username: dbUser,
        password: dbPass
    }
});

export default db;