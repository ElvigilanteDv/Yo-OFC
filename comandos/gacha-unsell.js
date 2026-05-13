import { config } from '../config.js';

const unsellCommand = {
    name: 'unsell',
    alias: ['cancelarsell', 'cancelpj'],
    category: 'gacha',
    desc: 'Retira un personaje que hayas puesto en venta en el mercado del grupo.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, args) => {
        try {
            const group = m.chat;
            const user = m.sender.replace(/:.*@/g, '@');
            const pjId = args[0];

            if (!pjId) return m.reply(`*${config.visuals.emoji2}* Indica el ID del personaje.`);

            if (!global.db.data.chats[group].shop || !global.db.data.chats[group].shop[pjId]) {
                return m.reply(`*${config.visuals.emoji2}* El personaje no está en venta.`);
            }

            const item = global.db.data.chats[group].shop[pjId];
            const sellerJid = item.seller.replace(/:.*@/g, '@');

            if (sellerJid !== user) {
                return m.reply(`*${config.visuals.emoji2}* No puedes retirar un personaje que no es tuyo.`);
            }

            if (!global.db.data.chats[group].gacha) global.db.data.chats[group].gacha = {};

            if (global.db.data.chats[group].gacha[pjId]) {
                global.db.data.chats[group].gacha[pjId].status = 'domado';
            }

            delete global.db.data.chats[group].shop[pjId];

            m.reply(`*${config.visuals.emoji3}* Has retirado a *${item.name}* del mercado.\n\n> Vuelve a estar en tu inventario.`);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al retirar el personaje.`);
        }
    }
};

export default unsellCommand;