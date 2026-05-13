import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const baseGroup = "120363423871589037@g.us";

const haremCommand = {
    name: 'harem',
    alias: ['mis-pjs'],
    category: 'gacha',
    desc: 'Visualiza la colección de personajes que has reclamado en este grupo.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, args) => {
        try {
            const group = m.chat;
            let targetJid = m.sender;
            let page = 1;

            if (args.length > 0) {
                const lastArg = args[args.length - 1];
                if (!isNaN(lastArg)) page = parseInt(lastArg);
            }

            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.quoted) {
                targetJid = m.quoted.key.participant || m.quoted.key.remoteJid;
            }

            const targetId = targetJid.replace(/:.*@/g, '@');
            const isMe = targetId === m.sender.replace(/:.*@/g, '@');

            if (!fs.existsSync(gachaPath)) return m.reply(`*${config.visuals.emoji2}* Error: Base de datos no encontrada.`);
            const rawData = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            const plantillaPersonajes = rawData[baseGroup];

            if (!global.db.data.chats[group]?.gacha) {
                return m.reply(`*${config.visuals.emoji2}* No hay registros de personajes en este grupo.`);
            }

            const dbGrupoGacha = global.db.data.chats[group].gacha;
            let misPjs = [];

            for (let id in dbGrupoGacha) {
                const ownerId = dbGrupoGacha[id].owner.replace(/:.*@/g, '@');
                if (ownerId === targetId && plantillaPersonajes[id]) {
                    misPjs.push({
                        ...plantillaPersonajes[id],
                        id_db: id
                    });
                }
            }

            if (misPjs.length === 0) {
                const mentionId = targetId.split('@')[0];
                if (isMe) {
                    return m.reply(`*${config.visuals.emoji2}* Aún no tienes personajes reclamados.\n\n> ¡Usa #rw y luego #c!`);
                } else {
                    return conn.sendMessage(m.chat, { 
                        text: `*${config.visuals.emoji2}* El usuario @${mentionId} no tiene personajes reclamados.`,
                        mentions: [targetId]
                    }, { quoted: m });
                }
            }

            misPjs.sort((a, b) => b.value - a.value);

            const itemsPerPage = 5;
            const totalPages = Math.ceil(misPjs.length / itemsPerPage);

            if (page > totalPages || page <= 0) page = 1;

            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const currentPjs = misPjs.slice(start, end);

            const mentionId = targetId.split('@')[0];
            let txt = `*${config.visuals.emoji3} \`HAREM DEL USUARIO\` ${config.visuals.emoji3}*\n`;
            txt += `» @${mentionId} (${misPjs.length} personajes)\n`;
            txt += `*Página:* ${page} de ${totalPages}\n\n`;

            currentPjs.forEach((pj) => {
                txt += `› ${pj.name} \`[${pj.id_db}]\`\n`;
            });

            await conn.sendMessage(m.chat, { 
                text: txt, 
                mentions: [targetId] 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al mostrar el harem.`);
        }
    }
};

export default haremCommand;