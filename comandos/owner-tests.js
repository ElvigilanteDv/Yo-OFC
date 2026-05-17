import { database, query } from '../database.js';

const testCommand = {
    name: 'test',
    category: 'debug',
    desc: 'Fuerza la escritura limpia en PostgreSQL eliminando registros previos.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const userJid = m.sender;
            
            // 1. Limpieza previa: Borramos al usuario de la DB para evitar conflictos de UPDATE
            await query('DELETE FROM users WHERE jid = $1', [userJid.split('@')[0].split(':')[0] + '@s.whatsapp.net']);

            // 2. Definimos el objeto con dinero real
            const premio = 50000;
            const userDb = { 
                wallet: premio, 
                bank: 0, 
                genre: 'Developer', 
                marry: null, 
                last_claim: new Date() 
            };

            // 3. Guardado directo usando la función del database.js
            await database.saveUser(userJid, userDb);

            // 4. Verificación inmediata
            let texto = `*🧪 TEST DE ESCRITURA FORZADA*\n\n`;
            texto += `» *Usuario:* ${userJid}\n`;
            texto += `» *Acción:* Registro reseteado e insertado.\n`;
            texto += `» *Monto inyectado:* ¥${premio.toLocaleString()}\n\n`;
            texto += `> **IMPORTANTE:** Si después de esto #testb sigue marcando 0, el problema es que tu tabla 'users' no acepta el comando UPDATE o los tipos de datos están mal definidos.`;

            await conn.sendMessage(m.chat, { text: texto }, { quoted: m });

        } catch (e) {
            console.error('ERROR EN TEST:', e);
            m.reply('❌ Fallo en la inyección de datos: ' + e.message);
        }
    }
};

export default testCommand;