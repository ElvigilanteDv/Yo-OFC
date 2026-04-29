import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const shopPath = path.resolve('./config/database/gacha/gacha_shop.json');

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
            const user = m.sender.split('@')[0].split(':')[0];
            const pjId = args[0];
            const price = parseInt(args[1]);

            if (!pjId || isNaN(price)) {
                return m.reply(`*${config.visuals.emoji2}* \`Uso Incorrecto\`\n• Usa el comando de la siguiente manera:\n> #sell (ID) (Precio)`);
            }

            if (!fs.existsSync(gachaPath)) return m.reply(`*${config.visuals.emoji2}* Error: DB Gacha no encontrada.`);
            let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));

            if (!gachaDB[group] || !gachaDB[group][pjId]) {
                return m.reply(`*${config.visuals.emoji2}* El personaje con ID \`${pjId}\` no existe en este grupo.`);
            }
            
            const pj = gachaDB[group][pjId];
            if (pj.owner !== user) return m.reply(`*${config.visuals.emoji2}* ¡Este personaje no te pertenece!`);

            const minPrice = (pj.value || 0) + 1000;
            if (price < minPrice) {
                return m.reply(`*${config.visuals.emoji2}* El precio mínimo de venta es *¥${minPrice.toLocaleString()}*.`);
            }

            if (!fs.existsSync(shopPath)) fs.writeFileSync(shopPath, JSON.stringify({}));
            let shopDB = JSON.parse(fs.readFileSync(shopPath, 'utf-8'));

            if (!shopDB[group]) shopDB[group] = {};

            shopDB[group][pjId] = {
                id: pjId,
                name: pj.name,
                seller: user,
                originalValue: pj.value,
                salePrice: price,
                date: Date.now()
            };

            gachaDB[group][pjId].status = 'en_venta';

            fs.writeFileSync(shopPath, JSON.stringify(shopDB, null, 2));
            fs.writeFileSync(gachaPath, JSON.stringify(gachaDB, null, 2));

            m.reply(`*${config.visuals.emoji3}* Has puesto a *${pj.name}* en el mercado por *¥${price.toLocaleString()}*.`);

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al poner en venta.`);
        }
    }
};

export default sellCommand;