import { config } from '../config.js';

const haremShop = {
    name: 'haremshop',
    alias: ['gachashop', 'tienda'],
    category: 'gacha',
    desc: 'Explora el mercado local del grupo para ver qué personajes han puesto en venta otros usuarios.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, args) => {
        try {
            const group = m.chat;

            if (!global.db.data.chats[group].shop || Object.keys(global.db.data.chats[group].shop).length === 0) {
                return m.reply(`*${config.visuals.emoji2}* El mercado de este grupo está vacío.`);
            }

            let shopData = global.db.data.chats[group].shop;
            let items = Object.keys(shopData).map(id => ({
                id,
                ...shopData[id]
            }));

            let page = args[0] ? parseInt(args[0]) : 1;
            if (isNaN(page) || page < 1) page = 1;

            const pageSize = 10;
            const totalPages = Math.ceil(items.length / pageSize);
            const start = (page - 1) * pageSize;
            const end = start + pageSize;
            const currentItems = items.slice(start, end);

            if (currentItems.length === 0) return m.reply(`*${config.visuals.emoji2}* Página no encontrada.`);

            let txt = `*${config.visuals.emoji3} \`MERCADO DE PERSONAJES\` ${config.visuals.emoji3}*\n`;
            txt += `*Página:* ${page} de ${totalPages}\n\n`;

            let mentions = [];
            currentItems.forEach((item, i) => {
                const sellerClean = item.seller.replace(/:.*@/g, '@');
                const sellerId = sellerClean.split('@')[0];
                txt += `*${start + i + 1}.* ${item.name} (\`${item.id}\`)\n`;
                txt += `  ᗒ *Vendedor:* @${sellerId}\n`;
                txt += `  ᗒ *Precio:* ¥${item.salePrice.toLocaleString()}\n\n`;
                if (!mentions.includes(sellerClean)) mentions.push(sellerClean);
            });

            txt += `\n> Usa el comando *#buy (ID)* para comprar un personaje.`;

            await conn.sendMessage(m.chat, { 
                text: txt, 
                mentions: mentions 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al cargar el mercado.`);
        }
    }
};

export default haremShop;