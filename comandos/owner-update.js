import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import { config } from '../config.js';

const execPromise = promisify(exec);

const updateCommand = {
    name: 'update',
    alias: ['actualizar', 'gitpull', 'up'],
    category: 'owner',
    isOwner: true, 
    noPrefix: true,
    isGroup: false,

    run: async (conn, m) => {
        const from = m.key.remoteJid;

        try {
            const realOwnerNumber = (typeof config.owner[0] === 'string' ? config.owner[0] : config.owner[0][0]).replace(/\D/g, '');
            const senderNumber = m.sender.split('@')[0].replace(/\D/g, '');
            const isRealOwner = senderNumber === realOwnerNumber || m.key.fromMe;

            if (!isRealOwner) {
                return m.reply(`*${config.visuals.emoji2}* \`ACCESO DENEGADO\`\n\nSolo el desarrollador principal puede sincronizar cambios del repositorio.`);
            }

            await conn.sendMessage(from, { react: { text: '⌚', key: m.key } });

            const { stdout } = await execPromise('git pull');

            if (stdout.includes('Already up to date')) {
                await conn.sendMessage(from, { react: { text: '⏸️', key: m.key } });
                return await conn.sendMessage(from, { 
                    text: '✅ *Sincronización Completa*\n\nEl repositorio de GitHub y el servidor ya están en la misma versión. No hay cambios pendientes.' 
                }, { quoted: m });
            }

            if (global.loadCommands) {
                await global.loadCommands(); 
            }

            await conn.sendMessage(from, { react: { text: '☑️', key: m.key } });

            let updateMsg = `✅ *Actualización realizada exitosamente*\n\n`;
            updateMsg += `*Detalles del Update:* \n`;
            updateMsg += `\`\`\`${stdout}\`\`\``;

            await conn.sendMessage(from, { text: updateMsg }, { quoted: m });

        } catch (error) {
            console.error(error);
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            await conn.sendMessage(from, { text: `❌ *Error al actualizar:* \n\n${error.message}` }, { quoted: m });
        }
    }
};

export default updateCommand;
