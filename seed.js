require('dotenv').config();
const { Client } = require('pg');
const { faker } = require('@faker-js/faker');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function runSeeder() {
    try {
        await client.connect();
        console.log("🟢 Connected to Supabase PostgreSQL");

        // 1. Create the database tables
        await client.query(`
            DROP TABLE IF EXISTS user_events, subscriptions, users CASCADE;
            
            CREATE TABLE users (
                id UUID PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255),
                signup_date DATE,
                plan_type VARCHAR(50)
            );

            CREATE TABLE subscriptions (
                id UUID PRIMARY KEY,
                user_id UUID REFERENCES users(id),
                status VARCHAR(50),
                cancellation_date TIMESTAMP
            );

            CREATE TABLE user_events (
                id UUID PRIMARY KEY,
                user_id UUID REFERENCES users(id),
                event_name VARCHAR(100),
                event_timestamp TIMESTAMP
            );
        `);
        console.log("🟢 Tables Created Successfully");

        // 2. Generate 1,000 Users with realistic activity
        console.log("⏳ Generating 1,000 users and their activity data. Please wait...");
        
        for (let i = 0; i < 1000; i++) {
            const userId = faker.string.uuid();
            const signupDate = faker.date.past({ years: 1 });
            
            // Insert User Profile
            await client.query(
                `INSERT INTO users (id, name, email, signup_date, plan_type) VALUES ($1, $2, $3, $4, $5)`,
                [userId, faker.person.fullName(), faker.internet.email(), signupDate, 'Pro']
            );

            const usedBuggyFeature = Math.random() > 0.5;
            let status = 'active';
            let cancelDate = null;

            // Generate "Account Created" Event
            let eventTime = new Date(signupDate);
            await client.query(
                `INSERT INTO user_events (id, user_id, event_name, event_timestamp) VALUES ($1, $2, $3, $4)`,
                [faker.string.uuid(), userId, 'Account_Created', eventTime]
            );

            // Simulate the "Product Bug" (Users who use 'Import_Contacts' have a high chance of cancelling)
            if (usedBuggyFeature) {
                eventTime.setHours(eventTime.getHours() + 24);
                await client.query(
                    `INSERT INTO user_events (id, user_id, event_name, event_timestamp) VALUES ($1, $2, $3, $4)`,
                    [faker.string.uuid(), userId, 'Import_Contacts', eventTime]
                );

                if (Math.random() < 0.70) { // 70% churn rate for this specific feature
                    status = 'cancelled';
                    eventTime.setHours(eventTime.getHours() + 2);
                    cancelDate = eventTime;
                    
                    await client.query(
                        `INSERT INTO user_events (id, user_id, event_name, event_timestamp) VALUES ($1, $2, $3, $4)`,
                        [faker.string.uuid(), userId, 'Subscription_Cancelled', eventTime]
                    );
                }
            }

            // Insert Subscription Record
            await client.query(
                `INSERT INTO subscriptions (id, user_id, status, cancellation_date) VALUES ($1, $2, $3, $4)`,
                [faker.string.uuid(), userId, status, cancelDate]
            );
        }
        
        console.log("✅ Database successfully seeded! All 1,000 users generated.");
    } catch (err) {
        console.error("🔴 Error executing script:", err);
    } finally {
        await client.end();
    }
}

runSeeder();