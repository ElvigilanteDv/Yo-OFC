import { config } from '../config.js';
import { getDynamicConfig } from '../config/config.js';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

const stickerCommand = {
    name: 'sticker',
    alias: ['s', 'stiker', 'wm'],
    category: 'stickers',
    desc: 'Convierte imágenes o videos (1.2s - 60s) en stickers.',
    isGroup: false,
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            let q = m.quoted ? m.quoted : m;
            let mime = (q.msg || q).mimetype || q.mimetype || '';

            if (!/image|video|webp/.test(mime)) {
                return m.reply(`*${config.visuals.emoji2}* Responde a una imagen o video.`);
            }

            // Validación de tiempo para videos
            if (/video/.test(mime)) {
                let duration = q.msg?.seconds || q.seconds || 0;
                if (duration < 1.2) return m.reply(`*${config.visuals.emoji2}* Muy corto (mín 1.2s).`);
                if (duration > 60.0) return m.reply(`*${config.visuals.emoji2}* Muy largo (máx 1min).`);
            }

            // Usamos el método download que definiste en el index
            let img = await q.download();
            if (!img) return m.reply(`*${config.visuals.emoji2}* No pude descargar el archivo.`);

            const dynamic = await getDynamicConfig(conn);
            let userName = m.pushName || 'User';
            let pack = dynamic.stickers.packname;
            let author = dynamic.stickers.packauthor.replace('@(userName)', userName);

            const sticker = new Sticker(img, {
                pack: pack,
                author: author,
                type: StickerTypes.FULL,
                categories: ['🤩'],
                id: m.id,
                quality: /video/.test(mime) ? 20 : 50, // Calidad muy baja para videos largos
            });

            const buffer = await sticker.toBuffer();
            await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m });

        } catch (e) {
            console.error('Error Sticker:', e);
            m.reply(`*${config.visuals.emoji2}* Error: El video es muy pesado o el formato no es compatible.`);
        }
    }
};

export default stickerCommand;
