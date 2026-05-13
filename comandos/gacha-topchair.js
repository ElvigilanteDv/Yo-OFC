import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const baseGroup = "120363423871589037@g.us";

const topPjsCommand = {
    name: 'topchair',
    alias: ['pjetop', 'topwaifu', 'topersonaje'],
    category: 'gacha',
    desc: 'Muestra el ranking de los personajes más valiosos dentro de este grupo.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, args) => {
        try {
            const group = m.chat;
            
            if (!fs.existsSync(gachaPath)) return m.reply(`*${config.visuals.emoji2}* Error: Base de datos no encontrada.`);
            const rawData = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            const plantillaPersonajes = rawData[baseGroup];

            const dbGrupoGacha = global.db.data.chats[group]?.gacha || {};

            let page = 1;
            if (args[0] && !isNaN(args[0])) {
                page = parseInt(args[0]);
            }

            let allPjs = Object.keys(plantillaPersonajes).map(id => {
                const infoGrupo = dbGrupoGacha[id] || { status: 'libre', owner: null };
                return {
                    id,
                    name: plantillaPersonajes[id].name,
                    value: plantillaPersonajes[id].value,
                    status: infoGrupo.status,
                    owner: infoGrupo.owner
                };
            });

            allPjs.sort((a, b) => b.value - a.value);

            const itemsPerPage = 10;
            const totalPages = Math.ceil(allPjs.length / itemsPerPage);

            if (page > totalPages || page <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`PÁGINA NO ENCONTRADA\`\n\nSolo existen **${totalPages}** páginas de ranking.`);
            }

            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const currentTop = allPjs.slice(start, end);

            let txt = `*${config.visuals.emoji3} \`RANKING DE PERSONAJES\` ${config.visuals.emoji3}*\n`;
            txt += `*Página:* ${page} de ${totalPages}\n\n`;

            let mentions = [];
            currentTop.forEach((pj, index) => {
                const ranking = start + index + 1;
                let statusText = 'Libre';
                
                if (pj.status !== 'libre' && pj.owner) {
                    const ownerId = pj.owner.split('@')[0];
                    statusText = `Domado por @${ownerId}`;
                    if (!mentions.includes(pj.owner)) mentions.push(pj.owner);
                }

                txt += `*${ranking}.* ${pj.name}\n`;
                txt += `  > *Valor:* ¥${pj.value.toLocaleString()}\n`;
                txt += `  > *Estado:* ${statusText}\n\n`;
            });

            txt += `> ¡Usa #rw para intentar conseguir a los mejores!`;

            await conn.sendMessage(m.chat, { 
                text: txt, 
                mentions: mentions 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al generar el top de personajes.`);
        }
    }
};

export default topPjsCommand;