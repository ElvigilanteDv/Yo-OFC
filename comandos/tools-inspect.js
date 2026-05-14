import { config } from '../config.js';
import { jidDecode } from 'todleys';

const inspectCommand = {
    name: 'inspect',
    alias: ['inspeccionar', 'revisar'],
    category: 'tools',
    desc: 'Extrae información detallada de enlaces de Grupos, Comunidades o Canales.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        const targetText = text || args[0];

        if (!targetText) {
            return m.reply(`*${config.visuals.emoji2}* Ingresa un enlace válido.\n\nEjemplo: ${usedPrefix}${commandName} https://whatsapp.com/channel/xxxx`);
        }

        const groupRegex = /chat\.whatsapp\.com\/(?:proxy\/)?([0-9A-Za-z]{20,24})/i;
        const channelRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,24})/i;

        try {
            if (channelRegex.test(targetText)) {
                const code = targetText.match(channelRegex)[1];
                
                const res = await conn.query({
                    tag: 'iq',
                    attrs: { 
                        type: 'get', 
                        xmlns: 'w:mex', 
                        to: '@s.whatsapp.net' 
                    },
                    content: [{
                        tag: 'query',
                        attrs: { op: 'WAMXNewsletterInviteInfo' },
                        content: [{
                            tag: 'newsletter_invite',
                            attrs: { code }
                        }]
                    }]
                }).catch(() => null);

                if (!res) throw new Error('Error Newsletter');

                const node = res.content[0].content[0];
                const meta = {
                    id: node.attrs.id,
                    name: node.attrs.name,
                    subscribers: node.attrs.subscribers_count,
                    desc: node.attrs.description,
                    verified: node.attrs.verification === 'verified'
                };

                let txt = `*${config.visuals.emoji3} \`INSPECCIÓN DE CANAL\` ${config.visuals.emoji3}*\n\n`;
                txt += `📝 *Nombre:* ${meta.name || 'No disponible'}\n`;
                txt += `🆔 *ID:* ${meta.id}\n`;
                txt += `👥 *Suscriptores:* ${parseInt(meta.subscribers).toLocaleString() || 'Oculto'}\n`;
                txt += `🛡️ *Verificado:* ${meta.verified ? 'Sí ✅' : 'No ❌'}\n\n`;
                txt += `📜 *Descripción:* ${meta.desc || 'Sin descripción.'}\n\n`;
                txt += `> © Developed by Félix.`;

                return m.reply(txt);
            }

            if (groupRegex.test(targetText)) {
                const code = targetText.match(groupRegex)[1];
                const meta = await conn.groupGetInviteInfo(code);

                let txt = `*${config.visuals.emoji3} \`INSPECCIÓN DE GRUPO\` ${config.visuals.emoji3}*\n\n`;
                txt += `📝 *Nombre:* ${meta.subject}\n`;
                txt += `🆔 *ID:* ${meta.id}\n`;
                txt += `👑 *Creador:* @${meta.owner?.split('@')[0]}\n`;
                txt += `👥 *Miembros:* ${meta.size}\n`;
                txt += `🔗 *Vínculo:* ${meta.linkedParent ? 'Parte de una Comunidad' : 'Grupo Independiente'}\n`;
                txt += `🛡️ *Aprobación:* ${meta.joinApprovalMode ? 'Requerida' : 'Abierta'}\n\n`;
                txt += `📜 *Descripción:* ${meta.desc || 'Sin descripción.'}\n\n`;
                txt += `> © Developed by Félix.`;

                return conn.sendMessage(m.chat, { text: txt, mentions: [meta.owner] }, { quoted: m });
            }

            m.reply(`*${config.visuals.emoji2}* El enlace no es un destino válido.`);

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al obtener datos. El enlace puede haber expirado o ser privado.`);
        }
    }
};

export default inspectCommand;