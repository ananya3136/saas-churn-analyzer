WITH FeatureUsers AS (
    -- Find all users who triggered the 'Import_Contacts' event
    SELECT DISTINCT user_id
    FROM user_events
    WHERE event_name = 'Import_Contacts'
),
ChurnData AS (
    -- Match those users with their subscription status
    SELECT 
        s.user_id, 
        s.status,
        CASE 
            WHEN f.user_id IS NOT NULL THEN 'Used Import Contacts' 
            ELSE 'Did Not Use Feature' 
        END AS feature_usage
    FROM subscriptions s
    LEFT JOIN FeatureUsers f ON s.user_id = f.user_id
)
-- Calculate the final churn metrics
SELECT 
    feature_usage,
    COUNT(*) AS total_users,
    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS churned_users,
    ROUND((SUM(CASE WHEN status = 'cancelled' THEN 1.0 ELSE 0.0 END) / COUNT(*)) * 100, 2) AS churn_rate_percent
FROM ChurnData
GROUP BY feature_usage;