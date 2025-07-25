-- Update user stats for existing users with swing data
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Loop through all users who have swing data but no user stats
    FOR user_record IN 
        SELECT DISTINCT user_id 
        FROM swing_data 
        WHERE user_id NOT IN (SELECT user_id FROM user_stats)
    LOOP
        -- Call the update function for each user
        PERFORM update_user_stats(user_record.user_id);
    END LOOP;
    
    -- Also update existing user stats to make sure they're current
    FOR user_record IN 
        SELECT DISTINCT user_id 
        FROM swing_data
    LOOP
        PERFORM update_user_stats(user_record.user_id);
    END LOOP;
END $$;