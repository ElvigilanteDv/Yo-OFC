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
                return m.reply(`*${config.visuals.emoji2}* Responde a una imagen o video para crear el sticker.`);
            }

            // Validación de tiempo para videos (1.2s a 60s)
            if (/video/.test(mime)) {
                let duration = q.msg?.seconds || q.seconds || 0;
                if (duration < 1.2) return m.reply(`*${config.visuals.emoji2}* El video es muy corto. Mínimo 1.2 segundos.`);
                if (duration > 60.0) return m.reply(`*${config.visuals.emoji2}* El video es muy largo. Máximo 1 minuto.`);
            }

            // Usamos m.download() que definiste en el index.js
            let img = await q.download();
            if (!img) return m.reply(`*${config.visuals.emoji2}* Error al descargar el archivo.`);

            const dynamic = await getDynamicConfig(conn);
            let userName = m.pushName || 'User';
            let pack = dynamic.stickers.packname;
            let author = dynamic.stickers.packauthor.replace('@(userName)', userName);

            // Ajuste agresivo de calidad para videos largos
            const isVideo = /video/.test(mime);
            
            const sticker = new Sticker(img, {
                pack: pack,
                author: author,
                type: StickerTypes.FULL,
                categories: ['🤩'],
                id: m.id,
                quality: isVideo ? 15 : 50, // Calidad muy baja para videos para no superar 1MB
            });

            const buffer = await sticker.toBuffer();
            await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m });

        } catch (e) {
            console.error('Error en Sticker:', e);
            m.reply(`*${config.visuals.emoji2}* Error: El archivo es demasiado pesado o el VPS no tiene instalado ffmpeg.`);
        }
    }
};

export default stickerCommand;