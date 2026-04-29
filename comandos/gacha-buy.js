import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const ecoPath = path.resolve('./config/database/economy/economy.json');
const shopPath = path.resolve('./config/database/gacha/gacha_shop.json');

const buyCommand = {
    name: 'buy',
    alias: ['obtener'],
    category: 'gacha',
    desc: 'Compra personajes puestos en venta por otros usuarios del grupo.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, args) => {
        try {
            const group = m.chat;
            const buyer = m.sender.split('@')[0].split(':')[0];
            const pjId = args[0];

            if (!pjId) return m.reply(`*${config.visuals.emoji2}* Indica el ID del personaje.`);
            if (!fs.existsSync(shopPath)) return m.reply(`*${config.visuals.emoji2}* El mercado está vacío.`);

            let shopDB = JSON.parse(fs.readFileSync(shopPath, 'utf-8'));
            let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            let ecoDB = JSON.parse(fs.readFileSync(ecoPath, 'utf-8'));

            if (!shopDB[group] || !shopDB[group][pjId]) {
                return m.reply(`*${config.visuals.emoji2}* Ese personaje no está en venta en este grupo.`);
            }

            const item = shopDB[group][pjId];
            const seller = item.seller;
            const price = item.salePrice;

            if (buyer === seller) return m.reply(`*${config.visuals.emoji2}* No puedes comprar tu propio personaje.`);

            if (!ecoDB[group] || !ecoDB[group][buyer] || (ecoDB[group][buyer].wallet || 0) < price) {
                return m.reply(`*${config.visuals.emoji2}* No tienes suficiente dinero en tu cartera (¥${price.toLocaleString()}).`);
            }

            if (!ecoDB[group][seller]) {
                ecoDB[group][seller] = { wallet: 0, bank: 0 };
            }

            ecoDB[group][buyer].wallet -= price;
            ecoDB[group][seller].wallet += price;

            if (gachaDB[group] && gachaDB[group][pjId]) {
                gachaDB[group][pjId].owner = buyer;
                gachaDB[group][pjId].status = 'domado';
            }

            delete shopDB[group][pjId];

            fs.writeFileSync(shopPath, JSON.stringify(shopDB, null, 2));
            fs.writeFileSync(gachaPath, JSON.stringify(gachaDB, null, 2));
            fs.writeFileSync(ecoPath, JSON.stringify(ecoDB, null, 2));

            await m.reply(`*${config.visuals.emoji3}* ¡Compra exitosa!\n\nHas adquirido a *${item.name}* por **¥${price.toLocaleString()}**.`);
            
            conn.sendMessage(seller + '@s.whatsapp.net', { 
                text: `*${config.visuals.emoji3}* ¡Tu personaje *${item.name}* ha sido vendido!\nRecibiste **¥${price.toLocaleString()}** en tu cartera.` 
            });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al procesar la compra.`);
        }
    }
};

export default buyCommand;
