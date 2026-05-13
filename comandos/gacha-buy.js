import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const baseGroup = "120363423871589037@g.us";

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
            const buyer = m.sender.replace(/:.*@/g, '@');
            const pjId = args[0];

            if (!pjId) return m.reply(`*${config.visuals.emoji2}* Indica el ID del personaje.`);

            if (!global.db.data.chats[group].shop || !global.db.data.chats[group].shop[pjId]) {
                return m.reply(`*${config.visuals.emoji2}* Ese personaje no está en venta en este grupo.`);
            }

            const item = global.db.data.chats[group].shop[pjId];
            const seller = item.seller.replace(/:.*@/g, '@');
            const price = item.salePrice;

            if (buyer === seller) return m.reply(`*${config.visuals.emoji2}* No puedes comprar tu propio personaje.`);

            if (!global.db.data.users[buyer]) global.db.data.users[buyer] = { wallet: 0 };
            if (!global.db.data.users[seller]) global.db.data.users[seller] = { wallet: 0 };

            const buyerDb = global.db.data.users[buyer];
            const sellerDb = global.db.data.users[seller];

            if ((buyerDb.wallet || 0) < price) {
                return m.reply(`*${config.visuals.emoji2}* No tienes suficiente dinero en tu cartera (¥${price.toLocaleString()}).`);
            }

            buyerDb.wallet -= price;
            sellerDb.wallet += price;

            if (!global.db.data.chats[group].gacha) global.db.data.chats[group].gacha = {};

            global.db.data.chats[group].gacha[pjId] = {
                status: 'domado',
                owner: buyer
            };

            delete global.db.data.chats[group].shop[pjId];

            await m.reply(`*${config.visuals.emoji3}* ¡Compra exitosa!\n\nHas adquirido a *${item.name}* por **¥${price.toLocaleString()}**.`);

            const sellerJid = seller.includes('@') ? seller : seller + '@s.whatsapp.net';

            conn.sendMessage(sellerJid, { 
                text: `*${config.visuals.emoji3}* ¡Tu personaje *${item.name}* ha sido vendido!\nRecibiste **¥${price.toLocaleString()}** en tu cartera.` 
            });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al procesar la compra.`);
        }
    }
};

export default buyCommand;