import { database } from '../database.js';

const testBCommand = {
    name: 'testb',
    category: 'debug',
    desc: 'Prueba de lectura en SQLite.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const userJid = m.sender;
            const userDb = await database.getUser(userJid);

            if (!userDb) {
                return m.reply(`*⚠️ SIN REGISTRO FÍSICO*`);
            }

            let texto = `*🔍 TEST SQLITE (LECTURA)*\n\n`;
            texto += `» *ID en Disco:* ${userDb.jid}\n`;
            texto += `» *Billetera:* ¥${userDb.wallet}\n`;
            texto += `» *Banco:* ¥${userDb.bank}\n`;
            texto += `» *Formato:* SQLite (better-sqlite3)\n\n`;
            
            if (userDb.wallet >= 50000) {
                texto += `> *Estado:* ✅ ÉXITO. El archivo database.db es persistente.`;
            } else {
                texto += `> *Estado:* ❌ ERROR. Los datos no se mantienen.`;
            }

            await conn.sendMessage(m.chat, { text: texto }, { quoted: m });

        } catch (e) {
            m.reply('❌ Error en SQLite Read: ' + e.message);
        }
    }
};

export default testBCommand;