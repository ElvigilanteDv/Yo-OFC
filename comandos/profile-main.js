import { config } from '../config.js';

const profileCommand = {
    name: 'profile',
    alias: ['perfil'],
    category: 'profile',
    desc: 'Muestra tu ficha de perfil con info de economía, RPG, gacha y estado civil.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            let rawTarget = m.sender;
            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                rawTarget = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.quoted) {
                rawTarget = m.quoted.key.participant || m.quoted.key.remoteJid;
            }

            const targetJid = rawTarget.replace(/:.*@/g, '@');
            const userShortId = targetJid.split('@')[0];
            const group = m.chat;

            const userGlobal = global.db.data.users[targetJid] || {};
            const groupData = global.db.data.chats[group] || {};
            const userRpg = groupData.rpg?.[targetJid] || { minerals: {}, rank: 'Novato de las Cuevas' };
            const userGacha = groupData.gacha || {};

            const genero = userGlobal.genre || 'No definido';
            const age = userGlobal.birthday?.age || 'No definida';
            const cumple = userGlobal.birthday?.date || 'No definido';
            const parejaJid = userGlobal.marry ? userGlobal.marry.replace(/:.*@/g, '@') : null;
            const pareja = parejaJid ? `@${parejaJid.split('@')[0]}` : 'Soltero/a';

            const mentions = [targetJid];
            if (parejaJid) mentions.push(parejaJid);

            const wallet = Number(userGlobal.wallet) || 0;
            const bank = Number(userGlobal.bank) || 0;

            const userPjs = Object.values(userGacha).filter(pj => pj.owner && pj.owner.replace(/:.*@/g, '@') === targetJid);
            const totalPjs = userPjs.length;

            const rank = userRpg.rank || 'Novato de las Cuevas';
            const minerals = userRpg.minerals || {};

            let pp;
            try { 
                pp = await conn.profilePictureUrl(targetJid, 'image'); 
            } catch { 
                pp = 'https://i.ibb.co/mJR6NBs/avatar.png'; 
            }

            let txt = `*${config.visuals.emoji3} \`PERFIL DE USUARIO\` ${config.visuals.emoji3}*\n\n`;
            txt += `*✿︎ Usuario:* @${userShortId}\n\n`;
            txt += `*✿︎ Género:* ${genero}\n`;
            txt += `*✿︎ Edad:* ${age}\n`;
            txt += `*✿︎ Cumpleaños:* ${cumple}\n`;
            txt += `*✿︎ Pareja:* ${pareja}\n\n`;
            
            txt += `*✿︎ INFO ECONOMY* ✿︎\n`;
            txt += `> ⴵ Cartera: *¥${wallet.toLocaleString()}*\n`;
            txt += `> ⴵ Banco: *¥${bank.toLocaleString()}*\n`;
            txt += `> ⴵ Patrimonio: *¥${(wallet + bank).toLocaleString()}*\n\n`;

            txt += `*✿︎ INFO GACHA* ✿︎\n`;
            txt += `> ⴵ Colección: *${totalPjs} personajes*\n\n`;

            txt += `*✿︎ INFO RPG ✿︎*\n`;
            txt += `> ⴵ Rango: *${rank}*\n`;
            txt += `> ⴵ Diamantes: *${minerals.diamantes || 0}*\n`;
            txt += `> ⴵ Rubíes: *${minerals.rubies || 0}*\n`;
            txt += `> ⴵ Oro: *${minerals.oro || 0}*\n`;
            txt += `> ⴵ Gemas: *${(Number(minerals.esmeraldas || 0) + Number(minerals.zafiros || 0) + Number(minerals.amatistas || 0) + Number(minerals.perlas || 0))}*`;

            await conn.sendMessage(m.chat, { 
                image: { url: pp }, 
                caption: txt, 
                mentions: mentions
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al cargar el perfil.`);
        }
    }
};

export default profileCommand;