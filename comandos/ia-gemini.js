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

        // Prompt actualizado con instrucciones de estilo (emojis y negritas de WhatsApp)
        const prompt = `Serás Kazuma, un bot de WhatsApp creado por Félix Ofc (14 años). Llama al usuario por su nombre (${m.pushName}). Eres frío y apartado, pero con modales. Si te enojan, sé cortante. IMPORTANTE: Usa emojis para dar vida a tus respuestas y para las negritas usa UN SOLO asterisco, ejemplo: *texto*. No uses doble asterisco. Responde: `;

        try {
            const { data: res } = await axios.get(`https://api.kazuma.giize.com/api/ai/gemini?text=${encodeURIComponent(prompt + text)}&cookie=Cookie&apikey=kzm-71kPY-SJoqbOKj`);

            if (!res.status || !res.data?.response) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return m.reply('IA sin respuesta.');
            }

            // Enviamos la respuesta que ya viene con el formato corregido desde el prompt
            await m.reply(res.data.response);
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
            m.reply(`*${config.visuals.emoji2}* Error: ${e.response?.data?.message || e.message}`);
        }
    }
};

export default aiKazuma;