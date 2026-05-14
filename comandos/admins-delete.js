import { config } from '../config.js';

const deleteCommand = {
    name: 'delete',
    alias: ['del', 'borrar', 'eliminar'],
    category: 'admins',
    desc: 'Elimina el mensaje de otro usuario al que respondas.',
    isAdmin: true,
    isBotAdmin: true,
    isGroup: true,
    noPrefix: true,

    run: async (conn, m) => {
        try {
            if (!m.quoted) {
                return m.reply(`*${config.visuals.emoji2}* Responde al mensaje que deseas eliminar.`);
            }

            const key = {
                remoteJid: m.chat,
                fromMe: m.quoted.fromMe,
                id: m.quoted.id,
                participant: m.quoted.sender
            };

            await conn.sendMessage(m.chat, { delete: key });

        } catch (e) {
            console.error('Error en delete:', e);
            m.reply(`*${config.visuals.emoji2}* No pude eliminar el mensaje. Asegúrate de que soy administrador.`);
        }
    }
};

export default deleteCommand;