import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const backupCommand = {
    name: 'backup',
    alias: ['test', 'getdb'],
    category: 'owner',
    isOwner: true,
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const realOwnerNumber = (typeof config.owner[0] === 'string' ? config.owner[0] : config.owner[0][0]).replace(/\D/g, '');
            const senderNumber = m.sender.split('@')[0].replace(/\D/g, '');
            const isRealOwner = senderNumber === realOwnerNumber || m.key.fromMe;

            if (!isRealOwner) {
                return m.reply(`*${config.visuals.emoji2}* \`ACCESO DENEGADO\`\n\nNo tienes permisos para extraer copias de seguridad del servidor.`);
            }

            const folder = args[0];
            let file = args[1];

            if (!folder || !file) {
                return m.reply(`*${config.visuals.emoji2} \`PARÁMETROS INCOMPLETOS\` ${config.visuals.emoji2}*\n\nDebes especificar la carpeta y el archivo.\n\n> Ejemplo: #backup economy economy`);
            }

            file = file.replace(/\.json$/i, '');

            const dbPath = path.resolve(`./config/database/${folder}/${file}.json`);

            if (!fs.existsSync(dbPath)) {
                return m.reply(`*${config.visuals.emoji2} \`ARCHIVO NO ENCONTRADO\` ${config.visuals.emoji2}*\n\nLa ruta \`config/database/${folder}/${file}.json\` no existe.`);
            }

            const dbContent = fs.readFileSync(dbPath, 'utf-8');

            if (dbContent.length > 4000) {
                await conn.sendMessage(m.chat, { 
                    document: fs.readFileSync(dbPath), 
                    mimetype: 'application/json', 
                    fileName: `${file}.json`,
                    caption: `*${config.visuals.emoji3} \`BACKUP COMPLETADO\` ${config.visuals.emoji3}*\n\nArchivo: ${file}.json`
                }, { quoted: m });
            } else {
                const texto = `*${config.visuals.emoji3} \`RESPALDO DE DATOS\` ${config.visuals.emoji3}*\n\n*Archivo:* ${file}.json\n\n\`\`\`${dbContent}\`\`\``;
                await conn.sendMessage(m.chat, { text: texto }, { quoted: m });
            }

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2} \`ERROR CRÍTICO\` ${config.visuals.emoji2}*`);
        }
    }
};

export default backupCommand;