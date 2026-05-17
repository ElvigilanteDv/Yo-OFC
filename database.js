import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    user: 'Dev-FelixOfc',
    host: 'localhost',
    database: 'kazumadb',
    password: 'Mantis2026',
    port: 5432,
});

const normalizeJid = (jid) => {
    if (!jid) return null;
    return jid.split('@')[0].split(':')[0] + '@s.whatsapp.net';
};

export const query = (text, params) => pool.query(text, params);

export const database = {
    getChat: async (jid) => {
        const res = await pool.query('SELECT * FROM chats WHERE jid = $1', [jid]);
        return res.rows[0] || null;
    },
    getUser: async (jid) => {
        const cleanJid = normalizeJid(jid);
        const res = await pool.query('SELECT * FROM users WHERE jid = $1', [cleanJid]);
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
        const cleanJid = normalizeJid(jid);
        const { wallet, bank, genre, marry, last_claim } = data;
        const q = `
            INSERT INTO users (jid, wallet, bank, genre, marry, last_claim)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (jid) DO UPDATE SET
            wallet = EXCLUDED.wallet,
            bank = EXCLUDED.bank,
            genre = EXCLUDED.genre,
            marry = EXCLUDED.marry,
            last_claim = EXCLUDED.last_claim;
        `;
        await pool.query(q, [cleanJid, wallet || 0, bank || 0, genre || 'No definido', marry || null, last_claim || '1970-01-01 00:00:00']);
    },
    getHarem: async (groupJid, userJid) => {
        const cleanUserJid = normalizeJid(userJid);
        const q = 'SELECT character_id FROM gacha_ownership WHERE group_jid = $1 AND user_jid = $2';
        const res = await pool.query(q, [groupJid, cleanUserJid]);
        return res.rows;
    },
    claimCharacter: async (groupJid, userJid, charId) => {
        const cleanUserJid = normalizeJid(userJid);
        const q = `
            INSERT INTO gacha_ownership (group_jid, user_jid, character_id, status)
            VALUES ($1, $2, $3, 'domado')
            ON CONFLICT (group_jid, character_id) DO UPDATE SET
            user_jid = EXCLUDED.user_jid,
            status = 'domado';
        `;
        await pool.query(q, [groupJid, cleanUserJid, charId]);
    },
    getCharacterOwner: async (groupJid, charId) => {
        const q = 'SELECT user_jid, status FROM gacha_ownership WHERE group_jid = $1 AND character_id = $2';
        const res = await pool.query(q, [groupJid, charId]);
        return res.rows[0] || null;
    },
    listShop: async (groupJid) => {
        const q = 'SELECT * FROM gacha_shop WHERE group_jid = $1 ORDER BY listed_at DESC';
        const res = await pool.query(q, [groupJid]);
        return res.rows;
    },
    listCharacter: async (groupJid, sellerJid, charId, charName, price) => {
        const cleanSellerJid = normalizeJid(sellerJid);
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('INSERT INTO gacha_shop (group_jid, seller_jid, character_id, character_name, sale_price) VALUES ($1, $2, $3, $4, $5)', [groupJid, cleanSellerJid, charId, charName, price]);
            await client.query("UPDATE gacha_ownership SET status = 'en_venta' WHERE group_jid = $1 AND character_id = $2", [groupJid, charId]);
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },
    buyCharacter: async (groupJid, buyerJid, charId, price) => {
        const cleanBuyerJid = normalizeJid(buyerJid);
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const shopRes = await client.query('SELECT seller_jid FROM gacha_shop WHERE group_jid = $1 AND character_id = $2', [groupJid, charId]);
            const sellerJid = shopRes.rows[0].seller_jid;
            await client.query('UPDATE users SET wallet = wallet - $1 WHERE jid = $2', [price, cleanBuyerJid]);
            await client.query('UPDATE users SET wallet = wallet + $1 WHERE jid = $2', [price, sellerJid]);
            await client.query("UPDATE gacha_ownership SET user_jid = $1, status = 'domado' WHERE group_jid = $2 AND character_id = $3", [cleanBuyerJid, groupJid, charId]);
            await client.query('DELETE FROM gacha_shop WHERE group_jid = $1 AND character_id = $2', [groupJid, charId]);
            await client.query('COMMIT');
            return sellerJid;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
};