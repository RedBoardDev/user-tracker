async function getLatestUpdate(connection) {
    try {
        const [lastDate] = await connection.query(`SELECT date FROM count_user ORDER BY date DESC LIMIT 1`);
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

async function countNewUniqueUsers(connection) {
    try {

        const todayDate = getTodayDate();
        const lastMigrationDate = await getLatestUpdate(connection);

        const results = await connection.query('SELECT DATE_FORMAT(date, "%Y-%m-%d") AS formattedDate FROM unique_user ORDER BY date DESC');
        const dateCounts = {};
        const rows = results[0];
        for (const row of rows) {
            if (row.date >= todayDate) {
                continue;
            }
            if (row.date <= lastMigrationDate) {
                break;
            }
            const date = row.formattedDate;
            if (!dateCounts[date]) {
                dateCounts[date] = 0;
            }
            dateCounts[date]++;
        }
        for (const date in dateCounts) {
            const count = dateCounts[date];
            const [existingUser] = await connection.query('SELECT * FROM count_user WHERE date = ?', [date]);
            if (existingUser.length === 0) {
                await connection.query('INSERT INTO count_user (total_unique_user, date) VALUES (?, ?)', [count, date]);
            }
        }
        console.log('The number of unique users has been counted');
    } catch (error) {
        console.error('An error occurred while counting unique users:', error);
    }
}

async function countAllUniqueUsers(connection) {
    try {
        const results = await connection.query('SELECT DATE_FORMAT(date, "%Y-%m-%d") AS formattedDate FROM unique_user');

        const dateCounts = {};
        const rows = results[0];
        for (const row of rows) {
            const date = row.formattedDate;
            if (!dateCounts[date]) {
                dateCounts[date] = 0;
            }
            dateCounts[date]++;
        }
        for (const date in dateCounts) {
            const count = dateCounts[date];
            const [existingUser] = await connection.query('SELECT * FROM count_user WHERE date = ?', [date]);
            if (existingUser.length === 0) {
                await connection.query('INSERT INTO count_user (total_unique_user, date) VALUES (?, ?)', [count, date]);
            }
        }
        console.log('The number of unique users has been counted');
    } catch (error) {
        console.error('An error occurred while counting unique users:', error);
    }
}

export { countNewUniqueUsers, countAllUniqueUsers };
