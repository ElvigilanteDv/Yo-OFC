import { config } from '../config.js';
import { database } from '../database.js';

const buyCommand = {
    name: 'buy',
    alias: ['obtener'],
    category: 'gacha',
    desc: 'Compra personajes puestos en venta por otros usuarios del grupo.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, { args }) => {
        try {
            const group = m.chat;
            const buyerJid = m.sender;
            const pjId = args[0];

            if (!pjId) return m.reply(`*${config.visuals.emoji2}* Indica el ID del personaje.`);

            const item = await database.getShopItem(group, pjId);
            if (!item) {
                return m.reply(`*${config.visuals.emoji2}* Ese personaje no está en venta en este grupo.`);
            }

            const sellerJid = item.seller;
            const price = Number(item.salePrice);

            if (buyerJid === sellerJid) return m.reply(`*${config.visuals.emoji2}* No puedes comprar tu propio personaje.`);

            let buyerDb = await database.getUser(buyerJid);
            let sellerDb = await database.getUser(sellerJid);

            if (!buyerDb || Number(buyerDb.wallet || 0) < price) {
                return m.reply(`*${config.visuals.emoji2}* No tienes suficiente dinero en tu cartera.`);
            }

            if (!sellerDb) sellerDb = { wallet: 0, bank: 0 };

            buyerDb.wallet = Number(buyerDb.wallet) - price;
            sellerDb.wallet = Number(sellerDb.wallet || 0) + price;

            await database.updateCharacterOwner(group, pjId, buyerJid);
            await database.removeFromShop(group, pjId);
            await database.saveUser(buyerJid, buyerDb);
            await database.saveUser(sellerJid, sellerDb);

            await m.reply(`*${config.visuals.emoji3}* ¡Compra exitosa!\n\nHas adquirido a *${item.name}* por **¥${price.toLocaleString()}**.`);

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