import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const baseGroup = "120363423871589037@g.us";

const sellCommand = {
    name: 'sell',
    alias: ['vender'],
    category: 'gacha',
    desc: 'Pon uno de tus personajes en el mercado del grupo para que otros puedan comprarlo.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, args) => {
        try {
            const group = m.chat;
            const user = m.sender.replace(/:.*@/g, '@');
            const pjId = args[0];
            const price = parseInt(args[1]);

            if (!pjId || isNaN(price)) {
                return m.reply(`*${config.visuals.emoji2}* \`Uso Incorrecto\`\n• Usa el comando de la siguiente manera:\n> #sell (ID) (Precio)`);
            }

            if (!fs.existsSync(gachaPath)) return m.reply(`*${config.visuals.emoji2}* Error: DB Gacha no encontrada.`);
            const rawData = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            const plantillaPersonajes = rawData[baseGroup];

            if (!plantillaPersonajes[pjId]) {
                return m.reply(`*${config.visuals.emoji2}* El personaje con ID \`${pjId}\` no existe.`);
            }

            if (!global.db.data.chats[group].gacha) global.db.data.chats[group].gacha = {};
            const dbGrupoGacha = global.db.data.chats[group].gacha;

            const pjInfo = dbGrupoGacha[pjId];

            if (!pjInfo || pjInfo.owner.replace(/:.*@/g, '@') !== user) {
                return m.reply(`*${config.visuals.emoji2}* ¡Este personaje no te pertenece!`);
            }

            const pjPlantilla = plantillaPersonajes[pjId];
            const minPrice = (pjPlantilla.value || 0) + 1000;

            if (price < minPrice) {
                return m.reply(`*${config.visuals.emoji2}* El precio mínimo de venta es *¥${minPrice.toLocaleString()}*.`);
            }

            if (!global.db.data.chats[group].shop) global.db.data.chats[group].shop = {};

            global.db.data.chats[group].shop[pjId] = {
                id: pjId,
                name: pjPlantilla.name,
                seller: user,
                originalValue: pjPlantilla.value,
                salePrice: price,
                date: Date.now()
            };

            dbGrupoGacha[pjId].status = 'en_venta';

            if (!global.db.data.users[user]) global.db.data.users[user] = {};
            global.db.data.users[user].lastSell = Date.now();

            m.reply(`*${config.visuals.emoji3}* Has puesto a *${pjPlantilla.name}* en el mercado por *¥${price.toLocaleString()}*.\n\n_ID: ${pjId}_`);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al poner en venta.`);
        }
    }
};

export default sellCommand;