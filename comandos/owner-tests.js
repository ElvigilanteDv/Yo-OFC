import { database } from '../database.js';

const testCommand = {
    name: 'test',
    category: 'debug',
    desc: 'Comando de prueba sin cooldown para forzar guardado en DB.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const userJid = m.sender;
            
            // 1. Intentamos obtener al usuario
            let userDb = await database.getUser(userJid);
            
            // 2. Si no existe, creamos el objeto base
            if (!userDb) {
                userDb = { jid: userJid, wallet: 0, bank: 0, last_claim: new Date() };
            }

            // 3. Forzamos la suma
            const premio = 50000;
            const billeteraAntes = parseInt(userDb.wallet) || 0;
            userDb.wallet = billeteraAntes + premio;

            // 4. Intentamos guardar
            await database.saveUser(userJid, userDb);

            // 5. Respuesta de confirmación
            let texto = `*🧪 PRUEBA DE BASE DE DATOS*\n\n`;
            texto += `» *JID:* ${userJid}\n`;
            texto += `» *Antes:* ¥${billeteraAntes.toLocaleString()}\n`;
            texto += `» *Sumado:* ¥${premio.toLocaleString()}\n`;
            texto += `» *Ahora en memoria:* ¥${userDb.wallet.toLocaleString()}\n\n`;
            texto += `> Verifica ahora con #bal o en la consola del VPS.`;

            await conn.sendMessage(m.chat, { text: texto }, { quoted: m });

        } catch (e) {
            console.error('ERROR EN TEST COMMAND:', e);
            m.reply('Error en el test: ' + e.message);
        }
    }
};

export default testCommand;