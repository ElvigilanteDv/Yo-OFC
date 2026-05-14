import { config } from '../config.js';

const deleteCommand = {
    name: 'delete',
    alias: ['del', 'borrar', 'eliminar'],
    category: 'admins',
    desc: 'Elimina cualquier mensaje (texto, multimedia, sticker) al que respondas.',
    isAdmin: true,
    isBotAdmin: true,
    isGroup: true,
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const quoted = m.quoted ? m.quoted : m.msg?.contextInfo?.quotedMessage ? {
                key: {
                    remoteJid: m.chat,
                    fromMe: m.msg.contextInfo.participant === conn.user.id,
                    id: m.msg.contextInfo.stanzaId,
                    participant: m.msg.contextInfo.participant
                }
            } : null;

            if (!quoted) {
                return m.reply(`*${config.visuals.emoji2}* Responde al mensaje que deseas eliminar.`);
            }

            const key = {
                remoteJid: m.chat,
                fromMe: quoted.fromMe,
                id: quoted.id,
                participant: quoted.sender || quoted.key.participant
            };

            await conn.sendMessage(m.chat, { delete: key });

        } catch (e) {
            console.error('Error en delete:', e);
            m.reply(`*${config.visuals.emoji2}* No pude eliminar el mensaje. Verifica que sea administrador.`);
        }
    }
};

export default deleteCommand;