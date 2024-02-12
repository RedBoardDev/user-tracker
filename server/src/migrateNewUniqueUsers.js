async function getLatestUpdate(connection) {
    try {
        const [lastDate] = await connection.query(`SELECT date FROM unique_user ORDER BY date DESC LIMIT 1`);
        return lastDate[0]?.date;
    } catch (error) {
        console.error('Error getting last unique user date:', error);
        return undefined;
    }
}

function getTodayDate() {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    return (today)
}

async function migrateNewUniqueUsers(connection) {
    try {
        const todayDate = getTodayDate();
        const lastMigrationDate = await getLatestUpdate(connection);

        const [userIds] = await connection.query('SELECT DISTINCT u.userId, u.date FROM users u ORDER BY u.date DESC;');
        for (const row of userIds) {
            if (row.date >= todayDate) {
                continue;
            }
            if (row.date <= lastMigrationDate) {
                break;
            }
            const [existingUser] = await connection.query('SELECT * FROM unique_user WHERE userId = ?', [row.userId]);
            if (existingUser.length === 0) {
                await connection.query('INSERT INTO unique_user (userId, date) VALUES (?, ?)', [row.userId, row.date]);
            }
        }
        console.log('Migration of unique users successfully completed!');
    } catch (error) {
        console.error('Error during migration of unique users:', error);
    }
}

async function migrateAllUniqueUsers(connection) {
    try {
        const todayDate = getTodayDate();

        const [userIds] = await connection.query('SELECT DISTINCT u.userId, u.date FROM users u ORDER BY u.date DESC;');
        for (const row of userIds) {
            if (row.date >= todayDate) {
                continue;
            }
            const [existingUser] = await connection.query('SELECT * FROM unique_user WHERE userId = ?', [row.userId]);
            if (existingUser.length === 0) {
                await connection.query('INSERT INTO unique_user (userId, date) VALUES (?, ?)', [row.userId, row.date]);
            }
        }

        console.log('Migration of unique users successfully completed!');
    } catch (error) {
        console.error('Error during migration of unique users:', error);
    }
}

export { migrateNewUniqueUsers, migrateAllUniqueUsers };
