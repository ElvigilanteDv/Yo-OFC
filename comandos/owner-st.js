import { database } from '../database.js';

const testBCommand = {
    name: 'b',
    category: 'debug',
    desc: 'Consulta técnica de la DB para verificar el guardado real.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const userJid = m.sender;
            
            // Leemos directamente lo que devuelve el motor de base de datos
            const userDb = await database.getUser(userJid);

            if (!userDb) {
                return m.reply(`*⚠️ SIN DATOS*\n\n> No se encontró registro en la DB para:\n> ${userJid}`);
            }

            // Mostramos los valores exactos
            let texto = `*🔍 REVISIÓN DE BASE DE DATOS*\n\n`;
            texto += `» *ID Detectado:* ${userDb.jid}\n`;
            texto += `» *Billetera:* ¥${userDb.wallet}\n`;
            texto += `» *Banco:* ¥${userDb.bank}\n`;
            texto += `» *Tipo de Dato:* ${typeof userDb.wallet}\n`;
            texto += `» *Última Actividad:* ${userDb.last_claim}\n\n`;
            
            if (userDb.wallet == 0) {
                texto += `> *Estado:* ❌ Fallo de persistencia. El bot registra pero no guarda el monto.`;
            } else {
                texto += `> *Estado:* ✅ ÉXITO. La base de datos está guardando correctamente.`;
            }

            await conn.sendMessage(m.chat, { text: texto }, { quoted: m });

        } catch (e) {
            console.error('ERROR EN TESTB:', e);
            m.reply('❌ Error al leer la DB: ' + e.message);
        }
    }
};

export default testBCommand;