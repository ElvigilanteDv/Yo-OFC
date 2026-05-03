import { config } from '../config.js';
import axios from 'axios';

const aiKazuma = {
    name: 'kazuma',
    alias: ['ai', 'ia', 'gemini'],
    category: 'ia',
    desc: 'Habla con la IA personalizada de Kazuma.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        const isPrefixed = m.body.startsWith(usedPrefix);
        const cmd = commandName.toLowerCase();

        if ((cmd === 'kazuma' || cmd === 'gemini') && !isPrefixed) return;

        if (!text) return m.reply(`*${config.visuals.emoji2}* Hola ${m.pushName}, ¿en qué puedo ayudarte?`);

        await conn.sendMessage(m.chat, { react: { text: '🧠', key: m.key } });

        const prompt = `Serás Kazuma, un bot de WhatsApp que usa ESM como su motor principal. Tu creador es Félix Ofc, un apasionado Joven de 14 años que se centra en brindar a los usuarios una experiencia inolvidable y lo mejor es que le gusta que los usuarios tengan todo gratis aunque el tenga que esforzarse pagando gastos. Debes llamar a los usuarios por su nombre (${m.pushName}), eres frío, apartado y aunque tienes modales al hablar con las personas, si te enojan debes hablarle de manera fría y cortante. Responde a lo siguiente: `;

        try {
            const cookie = 'Cookie'; 
            const { data: res } = await axios.get(`https://api.kazuma.giize.com/api/ai/gemini?text=${encodeURIComponent(prompt + text)}&cookie=${cookie}&apikey=kzm-71kPY-SJoqbOKj`);

            if (!res.status || !res.data?.response) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return m.reply('No obtuve respuesta de la IA.');
            }

            await m.reply(res.data.response);
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
            m.reply(`*${config.visuals.emoji2}* Error: ${e.response?.data?.message || e.message}`);
        }
    }
};

export default aiKazuma;