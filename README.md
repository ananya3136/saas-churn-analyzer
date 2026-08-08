#  SaaS User Churn & Retention Analytics Pipeline

## Executive Summary
This project acts as the technical foundation for a Product Management case study. I architected a cloud-hosted PostgreSQL database and analyzed a 1,000-user cohort to identify a critical bottleneck. The analysis uncovered that users interacting with the `Import_Contacts` feature experienced a **70% churn rate**, leading to a proposal for a new asynchronous system architecture.

## Project Structure
*   `seed.js`: Node.js script utilizing `@faker-js/faker` and `pg` to populate the cloud database with realistic SaaS event data.
*   `analysis.sql`: The optimized SQL query used to isolate the failing feature and calculate the churn differential.
*   `README.md`: Project documentation.

## Tech Stack
*   **Database:** PostgreSQL (Supabase)
*   **Scripting:** Node.js
*   **Analytics:** SQL (CTEs, Window Functions, Conditional Aggregation)