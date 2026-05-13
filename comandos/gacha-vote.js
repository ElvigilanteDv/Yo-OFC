import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const baseGroup = "120363423871589037@g.us";

const voteCommand = {
    name: 'vote',
    alias: ['despedir', 'votar'],
    category: 'gacha',
    desc: 'Libera a un personaje de tu inventario para que vuelva a estar disponible en el grupo.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, args) => {
        try {
            const group = m.chat;
            const user = m.sender.replace(/:.*@/g, '@');
            const pjId = args[0];

            if (!pjId) return m.reply(`*${config.visuals.emoji2}* Indica el ID del personaje que deseas votar.`);

            if (!fs.existsSync(gachaPath)) return m.reply(`*${config.visuals.emoji2}* Error: DB Gacha no encontrada.`);
            const rawData = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            const plantillaPersonajes = rawData[baseGroup];

            if (!plantillaPersonajes[pjId]) {
                return m.reply(`*${config.visuals.emoji2}* El personaje no existe.`);
            }

            if (!global.db.data.chats[group].gacha) global.db.data.chats[group].gacha = {};
            const dbGrupoGacha = global.db.data.chats[group].gacha;

            const pjInfo = dbGrupoGacha[pjId];

            if (!pjInfo || pjInfo.owner.replace(/:.*@/g, '@') !== user) {
                return m.reply(`*${config.visuals.emoji2}* ¡No puedes votar a un personaje que no te pertenece!`);
            }

            const pjName = plantillaPersonajes[pjId].name;

            dbGrupoGacha[pjId] = {
                status: 'libre',
                owner: null
            };

            if (global.db.data.chats[group].shop && global.db.data.chats[group].shop[pjId]) {
                delete global.db.data.chats[group].shop[pjId];
            }

            if (!global.db.data.users[user]) global.db.data.users[user] = {};
            global.db.data.users[user].lastVote = Date.now();

            m.reply(`*${config.visuals.emoji3}* Has votado a *${pjName}*. Ahora es libre y ha sido retirado de cualquier mercado en este grupo.`);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al procesar el voto.`);
        }
    }
};

export default voteCommand;