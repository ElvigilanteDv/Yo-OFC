import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const trades = new Map();

const tradeCommand = {
    name: 'trade',
    alias: ['intercambio', 'cambiar'],
    category: 'gacha',
    desc: 'Propón un intercambio de personajes con otro usuario del grupo.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, args) => {
        try {
            const group = m.chat;
            const user = m.sender.split('@')[0].split(':')[0];

            if (args[0] === 'accept') {
                if (!m.quoted) return m.reply(`*${config.visuals.emoji2}* Responde al mensaje de la propuesta para aceptar.`);
                
                const proposalKey = `${group}-${m.quoted.id}`;
                const proposal = trades.get(proposalKey);

                if (!proposal) return m.reply(`*${config.visuals.emoji2}* Esta propuesta ya no existe o ha caducado.`);
                if (m.sender !== proposal.toJid) return m.reply(`*${config.visuals.emoji2}* Solo la persona mencionada puede aceptar este intercambio.`);

                let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));

                const user1 = proposal.from;
                const user2 = user;
                const pj1 = proposal.myPjId;
                const pj2 = proposal.targetPjId;

                if (!gachaDB[group] || !gachaDB[group][pj1] || !gachaDB[group][pj2] || 
                    gachaDB[group][pj1].owner !== user1 || gachaDB[group][pj2].owner !== user2) {
                    trades.delete(proposalKey);
                    return m.reply(`*${config.visuals.emoji2}* El intercambio falló: uno de los personajes ya no está disponible en este grupo.`);
                }

                gachaDB[group][pj1].owner = user2;
                gachaDB[group][pj2].owner = user1;
                gachaDB[group][pj1].status = 'domado';
                gachaDB[group][pj2].status = 'domado';

                fs.writeFileSync(gachaPath, JSON.stringify(gachaDB, null, 2));
                trades.delete(proposalKey);

                return m.reply(`*${config.visuals.emoji3}* ¡Intercambio completado!\n\n@${user1} recibió a *${gachaDB[group][pj2].name}*\n@${user2} recibió a *${gachaDB[group][pj1].name}*`, {
                    mentions: [user1 + '@s.whatsapp.net', m.sender]
                });
            }

            const targetJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
            if (!targetJid) return m.reply(`*${config.visuals.emoji2}* Menciona a alguien para proponer un cambio.`);

            const target = targetJid.split('@')[0].split(':')[0];
            const [myId, hisId] = args;

            if (!myId || !hisId) return m.reply(`*${config.visuals.emoji2}* Uso: #trade (Tu_ID) (Su_ID) @mención`);

            if (!fs.existsSync(gachaPath)) return m.reply(`*${config.visuals.emoji2}* Error: DB Gacha no encontrada.`);
            let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));

            if (!gachaDB[group] || !gachaDB[group][myId] || !gachaDB[group][hisId]) {
                return m.reply(`*${config.visuals.emoji2}* Uno de los IDs no es válido en este grupo.`);
            }

            if (gachaDB[group][myId].owner !== user) return m.reply(`*${config.visuals.emoji2}* El personaje *${gachaDB[group][myId].name}* no es tuyo.`);
            if (gachaDB[group][hisId].owner !== target) return m.reply(`*${config.visuals.emoji2}* El personaje *${gachaDB[group][hisId].name}* no es de esa persona.`);

            const sent = await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3} \`PROPUESTA DE INTERCAMBIO\` ${config.visuals.emoji3}*\n\n@${user} quiere cambiar su *${gachaDB[group][myId].name}* por tu *${gachaDB[group][hisId].name}*.\n\n> Tienes *5 minutos* para responder con: *#trade accept*`,
                mentions: [m.sender, targetJid]
            }, { quoted: m });

            const proposalId = `${group}-${sent.key.id}`;
            trades.set(proposalId, { from: user, toJid: targetJid, myPjId: myId, targetPjId: hisId });

            setTimeout(async () => {
                if (trades.has(proposalId)) {
                    trades.delete(proposalId);
                    await conn.sendMessage(m.chat, { 
                        text: `*${config.visuals.emoji2}* El tiempo ha expirado. La propuesta de @${user} ha sido cancelada.`,
                        mentions: [user + '@s.whatsapp.net']
                    }, { quoted: sent });
                }
            }, 300000);

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en el intercambio.`);
        }
    }
};

export default tradeCommand;