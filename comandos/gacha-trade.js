import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const baseGroup = "120363423871589037@g.us";
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
            const user = m.sender.replace(/:.*@/g, '@');

            if (args[0] === 'accept') {
                if (!m.quoted) return m.reply(`*${config.visuals.emoji2}* Responde al mensaje de la propuesta para aceptar.`);

                const proposalKey = `${group}-${m.quoted.id}`;
                const proposal = trades.get(proposalKey);

                if (!proposal) return m.reply(`*${config.visuals.emoji2}* Esta propuesta ya no existe o ha caducado.`);
                if (user !== proposal.toJid) return m.reply(`*${config.visuals.emoji2}* Solo la persona mencionada puede aceptar este intercambio.`);

                if (!global.db.data.chats[group].gacha) global.db.data.chats[group].gacha = {};
                const dbGrupoGacha = global.db.data.chats[group].gacha;

                const user1 = proposal.from;
                const user2 = user;
                const pj1 = proposal.myPjId;
                const pj2 = proposal.targetPjId;

                if (!dbGrupoGacha[pj1] || !dbGrupoGacha[pj2] || 
                    dbGrupoGacha[pj1].owner.replace(/:.*@/g, '@') !== user1 || 
                    dbGrupoGacha[pj2].owner.replace(/:.*@/g, '@') !== user2) {
                    trades.delete(proposalKey);
                    return m.reply(`*${config.visuals.emoji2}* El intercambio falló: uno de los personajes ya no está disponible o cambió de dueño.`);
                }

                if (!fs.existsSync(gachaPath)) return m.reply(`*${config.visuals.emoji2}* Error: DB Gacha no encontrada.`);
                const rawData = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
                const plantilla = rawData[baseGroup];

                dbGrupoGacha[pj1].owner = user2;
                dbGrupoGacha[pj2].owner = user1;
                dbGrupoGacha[pj1].status = 'domado';
                dbGrupoGacha[pj2].status = 'domado';

                const name1 = plantilla[pj1].name;
                const name2 = plantilla[pj2].name;

                trades.delete(proposalKey);

                const u1Id = user1.split('@')[0];
                const u2Id = user2.split('@')[0];

                return m.reply(`*${config.visuals.emoji3}* ¡Intercambio completado!\n\n@${u1Id} recibió a *${name2}*\n@${u2Id} recibió a *${name1}*`, {
                    mentions: [user1, user2]
                });
            }

            let rawTarget = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
            if (!rawTarget) return m.reply(`*${config.visuals.emoji2}* Menciona a alguien para proponer un cambio.`);
            
            const targetJid = rawTarget.replace(/:.*@/g, '@');

            const [myId, hisId] = args;
            if (!myId || !hisId) return m.reply(`*${config.visuals.emoji2}* Uso: #trade (Tu_ID) (Su_ID) @mención`);

            if (!fs.existsSync(gachaPath)) return m.reply(`*${config.visuals.emoji2}* Error: DB Gacha no encontrada.`);
            const rawData = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            const plantilla = rawData[baseGroup];

            if (!plantilla[myId] || !plantilla[hisId]) {
                return m.reply(`*${config.visuals.emoji2}* Uno de los IDs no existe.`);
            }

            if (!global.db.data.chats[group].gacha) global.db.data.chats[group].gacha = {};
            const dbGrupoGacha = global.db.data.chats[group].gacha;

            if (!dbGrupoGacha[myId] || dbGrupoGacha[myId].owner.replace(/:.*@/g, '@') !== user) return m.reply(`*${config.visuals.emoji2}* El personaje *${plantilla[myId].name}* no es tuyo.`);
            if (!dbGrupoGacha[hisId] || dbGrupoGacha[hisId].owner.replace(/:.*@/g, '@') !== targetJid) return m.reply(`*${config.visuals.emoji2}* El personaje *${plantilla[hisId].name}* no es de esa persona.`);

            const uId = user.split('@')[0];
            const sent = await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3} \`PROPUESTA DE INTERCAMBIO\` ${config.visuals.emoji3}*\n\n@${uId} quiere cambiar su *${plantilla[myId].name}* por tu *${plantilla[hisId].name}*.\n\n> Tienes *5 minutos* para responder con: *#trade accept*`,
                mentions: [user, targetJid]
            }, { quoted: m });

            const proposalId = `${group}-${sent.key.id}`;
            trades.set(proposalId, { from: user, toJid: targetJid, myPjId: myId, targetPjId: hisId });

            setTimeout(async () => {
                if (trades.has(proposalId)) {
                    trades.delete(proposalId);
                }
            }, 300000);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en el intercambio.`);
        }
    }
};

export default tradeCommand;