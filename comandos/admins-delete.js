import { config } from '../config.js';

const deleteMessage = {
    name: 'delete',
    alias: ['del', 'borrar'],
    category: 'admins',
    desc: 'Elimina un mensaje del bot o de otros si se tiene el rango necesario.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            if (!m.quoted) {
                return m.reply(`*${config.visuals.emoji2}* Por favor, responde al mensaje que deseas eliminar.\n\n> ¡Debes señalar un objetivo para la eliminación!`);
            }

            const isGroup = m.chat.endsWith('@g.us');
            const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            const senderNumber = m.sender.split('@')[0].replace(/\D/g, '');
            const realOwnerNumber = (typeof config.owner[0] === 'string' ? config.owner[0] : config.owner[0][0]).replace(/\D/g, '');
            const isRealOwner = senderNumber === realOwnerNumber || m.key.fromMe;

            if (isGroup) {
                const groupMetadata = await conn.groupMetadata(m.chat);
                const participants = groupMetadata.participants;
                const isAdmin = participants.find(p => p.id === m.sender)?.admin;
                const isBotAdmin = participants.find(p => p.id === botNumber)?.admin;

                if (!m.quoted.key.fromMe) {
                    if (!isBotAdmin) {
                        return m.reply(`*${config.visuals.emoji2}* El bot requiere rango de Administrador para eliminar mensajes ajenos.\n\n> ¡Sin permisos no puedo limpiar este sector!`);
                    }
                    if (!isAdmin && !isRealOwner) {
                        return m.reply(`*${config.visuals.emoji2}* Solo los administradores pueden solicitar la eliminación de mensajes de otros.\n\n> ¡Acceso denegado!`);
                    }
                }
            } else {
                if (!m.quoted.key.fromMe && !isRealOwner) return;
            }

            await conn.sendMessage(m.chat, { 
                delete: {
                    remoteJid: m.chat,
                    fromMe: m.quoted.key.fromMe,
                    id: m.quoted.id,
                    participant: m.quoted.key.participant
                } 
            });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al intentar eliminar el mensaje.`);
        }
    }
};

export default deleteMessage;