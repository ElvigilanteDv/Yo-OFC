import { config } from '../config.js';
import axios from 'axios';

const aiKazuma = {
    name: 'kazuma',
    alias: ['ai', 'ia', 'gemini'],
    category: 'ia',
    desc: 'Habla con la IA de Kazuma.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        if (!text) return m.reply(`*${config.visuals.emoji2}* Hola ${m.pushName}, ¿qué necesitas?`);

        await conn.sendMessage(m.chat, { react: { text: '🧠', key: m.key } });
        const { key } = await m.reply('*⌛* Procesando respuesta, espera un momento...');

        const prompt = `Serás Kazuma, un bot de WhatsApp creado por Félix Ofc (14 años). Llama al usuario por su nombre (${m.pushName}). Eres frío y apartado, pero con modales. Si te enojan, sé cortante. IMPORTANTE: Usa emojis para dar vida a tus respuestas y para las negritas usa UN SOLO asterisco, ejemplo: *texto*. No uses doble asterisco. Responde: `;

        try {
            const { data: res } = await axios.get(`https://api.kazuma.giize.com/api/ai/gemini?text=${encodeURIComponent(prompt + text)}&cookie=Cookie&apikey=kzm-71kPY-SJoqbOKj`);

            if (!res.status || !res.data?.response) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return conn.sendMessage(m.chat, { text: 'IA sin respuesta.', edit: key });
            }

            await conn.sendMessage(m.chat, { text: res.data.response, edit: key });
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
            const errorMsg = `*${config.visuals.emoji2}* Error: ${e.response?.data?.message || e.message}`;
            await conn.sendMessage(m.chat, { text: errorMsg, edit: key });
        }
    }
};

export default aiKazuma;