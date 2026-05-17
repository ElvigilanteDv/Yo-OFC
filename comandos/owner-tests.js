import { database } from '../database.js';

const testCommand = {
    name: 'test',
    category: 'debug',
    desc: 'Prueba de escritura en SQLite.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const userJid = m.sender;
            const premio = 50000;

            const userDb = { 
                wallet: premio, 
                bank: 0, 
                genre: 'Developer', 
                marry: null, 
                last_claim: new Date().toISOString() 
            };

            await database.saveUser(userJid, userDb);

            let texto = `*🧪 TEST SQLITE (ESCRITURA)*\n\n`;
            texto += `» *ID:* ${userJid}\n`;
            texto += `» *Estado:* Datos enviados al archivo local.\n`;
            texto += `» *Monto:* ¥${premio.toLocaleString()}\n\n`;
            texto += `> Usa #testb para verificar la persistencia.`;

            await conn.sendMessage(m.chat, { text: texto }, { quoted: m });

        } catch (e) {
            m.reply('❌ Error en SQLite Write: ' + e.message);
        }
    }
};

export default testCommand;