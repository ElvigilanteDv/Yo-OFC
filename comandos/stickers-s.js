import { config } from '../config.js';
import { getDynamicConfig } from '../config/config.js';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

const stickerCommand = {
    name: 'sticker',
    alias: ['s', 'stiker', 'wm'],
    category: 'stickers',
    desc: 'Convierte imágenes, videos o GIFs en stickers personalizados (1.2s - 60s).',
    isGroup: false,
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            let q = m.quoted ? m.quoted : m;
            let mime = (q.msg || q).mimetype || q.mimetype || '';

            if (!/image|video|webp/.test(mime)) {
                return m.reply(`*${config.visuals.emoji2}* Responde a una imagen o video para crear el sticker.`);
            }

            // Validar duración: Mínimo 1.2s y Máximo 60s (1 minuto)
            if (/video/.test(mime)) {
                let duration = q.msg?.seconds || q.seconds || 0;
                if (duration < 1.2) return m.reply(`*${config.visuals.emoji2}* El video es muy corto. Mínimo 1.2 segundos.`);
                if (duration > 60.0) return m.reply(`*${config.visuals.emoji2}* El video es muy largo. Máximo 1 minuto.`);
            }

            let img = await q.download();
            if (!img) return m.reply(`*${config.visuals.emoji2}* Error al descargar.`);

            const dynamic = await getDynamicConfig(conn);
            let userName = m.pushName || 'User';
            let pack = dynamic.stickers.packname;
            let author = dynamic.stickers.packauthor.replace('@(userName)', userName);

            let sticker = new Sticker(img, {
                pack: pack,
                author: author,
                type: StickerTypes.FULL,
                categories: ['🤩'],
                id: m.id,
                quality: 30, // Bajamos más la calidad para permitir videos más largos sin exceder 1MB
            });

            const buffer = await sticker.toBuffer();
            await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error interno al procesar el sticker.`);
        }
    }
};

export default stickerCommand;