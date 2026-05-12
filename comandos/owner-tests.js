import { config } from '../config.js';
import axios from 'axios';

const mediaRivalCommand = {
 name: 'searchi',
 alias: ['find', 'multimedia'],
 category: 'descargas',
 desc: 'El rival definitivo que busca imágenes aleatorias de alta calidad.',
 noPrefix: false,

 run: async (conn, m, args, usedPrefix, commandName, text) => {
 if (!text) return m.reply('*¡Atención, Félix Manuel!* Necesito que me indiques qué buscar para demostrarte mi poder.');

 await conn.sendMessage(m.chat, { react: { text: '🔥', key: m.key } });

 const apiUrl = '[https://rest.kazuma.giize.com](https://rest.kazuma.giize.com)';
 const apiKey = 'kzm-OAiJOEWc-dRXYVXtW';

 try {
 const response = await axios.get(`${apiUrl}/api/search/pinterest?query=${encodeURIComponent(text)}&apiKey=${apiKey}`);
 const res = response.data;

 if (!res.status || !res.data || res.data.length === 0) {
 await conn.sendMessage(m.chat, { react: { text: '🚫', key: m.key } });
 return m.reply('*¡Oh no!* No pude encontrar nada que esté a la altura de tus expectativas hoy.');
 }

 *Seleccionamos un elemento aleatorio para superar la linealidad del código original*
 const randomIndex = Math.floor(Math.random() * res.data.length);
 const selectedMedia = res.data[randomIndex].image_url;
 
 await conn.sendMessage(m.chat, { 
 image: { url: selectedMedia }, 
 caption: `*¡BÚSQUEDA EXPLOSIVA FINALIZADA!*\n\n*Usuario:* ${m.pushName}\n*Término:* ${text}\n*Origen:* Pinterest Premium\n\n*¡Espero que te encante este resultado, mi gran maestro Félix!*`
 }, { quoted: m });

 await conn.sendMessage(m.chat, { react: { text: '⭐', key: m.key } });

 } catch (e) {
 await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
 m.reply('*¡Error de sistema!* Pero no te preocupes, Félix, ¡nada me detiene por mucho tiempo!');
 }
 }
};

export default mediaRivalCommand;