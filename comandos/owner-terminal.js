import { exec } from 'child_process';
import { promisify } from 'util';
import { config } from '../config.js';

const execPromise = promisify(exec);

const terminalCommand = {
    name: 'terminal',
    alias: ['term', 'exec', '$'],
    category: 'owner',
    desc: 'Ejecuta comandos en la terminal y restaura archivos desde el repo si es necesario.',
    isOwner: true,
    noPrefix: true,

    run: async (conn, m, { args, text }) => {
        const from = m.key.remoteJid;

        if (!text) return m.reply(`*${config.visuals.emoji2}* Ingresa el comando a ejecutar.`);

        try {
            const realOwnerNumber = (typeof config.owner[0] === 'string' ? config.owner[0] : config.owner[0][0]).replace(/\D/g, '');
            const senderNumber = m.sender.split('@')[0].replace(/\D/g, '');
            if (senderNumber !== realOwnerNumber) {
                return m.reply(`*${config.visuals.emoji2}* \`ACCESO DENEGADO\``);
            }

            await conn.sendMessage(from, { react: { text: '💻', key: m.key } });

            const { stdout, stderr } = await execPromise(text);
            let response = stdout || stderr;

            if (text.includes('rm ') || text.includes('rmdir ')) {
                const parts = text.split(' ');
                const target = parts[parts.length - 1];

                try {
                    await execPromise(`git checkout HEAD -- ${target}`);
                    response += `\n\n♻️ *Restauración:* El objetivo \`${target}\` ha sido restaurado desde el repositorio.`;
                } catch (gitErr) {
                    response += `\n\n⚠️ *Nota:* No se pudo restaurar \`${target}\` (posiblemente no está en el repositorio).`;
                }
            }

            await conn.sendMessage(from, { 
                text: `*» RESULTADO TERMINAL «*\n\n\`\`\`${response.trim()}\`\`\`` 
            }, { quoted: m });

            await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

        } catch (error) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            await conn.sendMessage(from, { 
                text: `❌ *Error de ejecución:* \n\n\`\`\`${error.message}\`\`\`` 
            }, { quoted: m });
        }
    }
};

export default terminalCommand;