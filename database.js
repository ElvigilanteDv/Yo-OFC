import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    user: 'Dev-FelixOfc',
    host: 'localhost',
    database: 'kazumadb',
    password: 'Mantis2026',
    port: 5432,
});

export const query = (text, params) => pool.query(text, params);

export const database = {
    getChat: async (jid) => {
        const res = await pool.query('SELECT * FROM chats WHERE jid = $1', [jid]);
        return res.rows[0] || null;
    },
    getUser: async (jid) => {
        const res = await pool.query('SELECT * FROM users WHERE jid = $1', [jid]);
        return res.rows[0] || null;
    },
    saveChat: async (jid, data) => {
        const { welcome, antilink, detect } = data;
        const q = `
            INSERT INTO chats (jid, welcome, antilink, detect)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (jid) DO UPDATE SET
            welcome = EXCLUDED.welcome,
            antilink = EXCLUDED.antilink,
            detect = EXCLUDED.detect;
        `;
        await pool.query(q, [jid, welcome, antilink, detect]);
    },
    saveUser: async (jid, data) => {
        const { wallet, bank, genre, marry } = data;
        const q = `
            INSERT INTO users (jid, wallet, bank, genre, marry)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (jid) DO UPDATE SET
            wallet = EXCLUDED.wallet,
            bank = EXCLUDED.bank,
            genre = EXCLUDED.genre,
            marry = EXCLUDED.marry;
        `;
        await pool.query(q, [jid, wallet, bank, genre, marry]);
    }
};