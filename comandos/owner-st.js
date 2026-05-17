import { database } from '../database.js';

const testBCommand = {
    name: 'testb',
    category: 'debug',
    desc: 'Lectura cruda de la base de datos para depuración.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const userJid = m.sender;
            
            // 1. Llamada directa a la función getUser de database.js
            const userDb = await database.getUser(userJid);

            if (!userDb) {
                return m.reply(`*❌ ERROR DE LECTURA*\n\n> No se encontró ningún registro para:\n> ${userJid}\n\n_Asegúrate de haber usado #test primero._`);
            }

            // 2. Mostrar exactamente qué devuelve la base de datos
            let texto = `*🔍 LECTURA RAW DE DB*\n\n`;
            texto += `» *JID en DB:* ${userDb.jid}\n`;
            texto += `» *Cartera (Raw):* ${userDb.wallet}\n`;
            texto += `» *Banco (Raw):* ${userDb.bank}\n`;
            texto += `» *Tipo de Wallet:* ${typeof userDb.wallet}\n`;
            texto += `» *Último Claim:* ${userDb.last_claim}\n\n`;
            texto += `> Si Cartera dice 0 pero en el VPS ves números, el problema es el normalizeJid.`;

            await conn.sendMessage(m.chat, { text: texto }, { quoted: m });

        } catch (e) {
            console.error('ERROR EN TESTB:', e);
            m.reply('Error en testb: ' + e.message);
        }
    }
};

export default testBCommand;
