import { database } from '../database.js';

const testAddCommand = {
    name: 'testadd',
    category: 'debug',
    noPrefix: true,
    run: async (conn, m) => {
        try {
            const userDb = await database.getUser(m.sender) || { wallet: 0 };
            userDb.wallet += 1000;
            await database.saveUser(m.sender, userDb);
            m.reply(`✅ Sumado ¥1,000. Total actual: ¥${userDb.wallet}`);
        } catch (e) {
            m.reply('❌ Error: ' + e.message);
        }
    }
};

export default testAddCommand;