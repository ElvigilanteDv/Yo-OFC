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

            if (m.quoted.key.fromMe) {
                return m.reply(`*${config.visuals.emoji2}* No puedo eliminar mis propios mensajes por limitaciones del protocolo.\n\n> ¡Este mensaje es permanente en mi registro!`);
            }

            const isGroup = m.chat.endsWith('@g.us');
            const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            const senderNumber = m.sender.split('@')[0].replace(/\D/g, '');
            const realOwnerNumber = (typeof config.owner[0] === 'string' ? config.owner[0] : config.owner[0][0]).replace(/\D/g, '');
            const isRealOwner = senderNumber === realOwnerNumber || m.key.fromMe;

            if (isGroup) {
                const groupMetadata = await conn.groupMetadata(m.chat);
                const isBotAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin;
                const isAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

                if (!isBotAdmin) {
                    return m.reply(`*${config.visuals.emoji2}* El bot requiere rango de Administrador para eliminar mensajes ajenos.\n\n> ¡Sin permisos no puedo limpiar este sector!`);
                }
                if (!isAdmin && !isRealOwner) {
                    return m.reply(`*${config.visuals.emoji2}* Solo los administradores pueden solicitar la eliminación de mensajes.\n\n> ¡Acceso denegado!`);
                }
            } else {
                if (!isRealOwner) return;
            }

            await conn.sendMessage(m.chat, { 
                delete: {
                    remoteJid: m.chat,
                    fromMe: false,
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