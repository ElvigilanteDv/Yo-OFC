import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const ecoPath = path.resolve('./config/database/economy/economy.json');
const claimCooldowns = new Map();

const claimCommand = {
    name: 'claim',
    alias: ['reclamar', 'c'],
    category: 'gacha',
    desc: 'Reclama un personaje disponible en el grupo utilizando tus coins.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, args) => {
        try {
            const group = m.chat;
            const user = m.sender.split('@')[0].split(':')[0];
            const ahora = Date.now();
            const tiempoEspera = 9 * 60 * 1000;
            const cooldownKey = `${group}-${user}`;

            if (claimCooldowns.has(cooldownKey)) {
                const transcurrido = ahora - claimCooldowns.get(cooldownKey);
                if (transcurrido < tiempoEspera) {
                    const faltante = tiempoEspera - transcurrido;
                    const minutos = Math.floor(faltante / 60000);
                    const segundos = Math.floor((faltante % 60000) / 1000);
                    return m.reply(`*${config.visuals.emoji2}* ¡Espera! Debes esperar **${minutos}m ${segundos}s** para reclamar otro personaje.`);
                }
            }

            let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            let ecoDB = JSON.parse(fs.readFileSync(ecoPath, 'utf-8'));
            let pjId = null;

            if (args[0] && !isNaN(args[0])) {
                pjId = args[0];
            } else if (m.quoted) {
                const chatRolls = global.db.data.chats[group]?.rolls;
                if (chatRolls && chatRolls[m.quoted.id]) {
                    pjId = chatRolls[m.quoted.id].id;
                }
            }

            if (!pjId || !gachaDB[group] || !gachaDB[group][pjId]) {
                return m.reply(`*${config.visuals.emoji2}* Cita el mensaje del personaje que deseas reclamar.`);
            }

            const pj = gachaDB[group][pjId];
            if (pj.status !== 'libre') return m.reply(`*${config.visuals.emoji2}* ¡Este personaje ya tiene dueño!`);

            if (!ecoDB[group]) ecoDB[group] = {};
            if (!ecoDB[group][user]) ecoDB[group][user] = { wallet: 0, bank: 0 };
            
            const saldo = ecoDB[group][user].wallet || 0;

            if (saldo < pj.value) {
                return m.reply(`*${config.visuals.emoji2}* No tienes suficiente dinero (¥${pj.value.toLocaleString()}) en tu cartera.`);
            }

            ecoDB[group][user].wallet -= pj.value;
            gachaDB[group][pjId].status = 'domado';
            gachaDB[group][pjId].owner = user;

            fs.writeFileSync(gachaPath, JSON.stringify(gachaDB, null, 2));
            fs.writeFileSync(ecoPath, JSON.stringify(ecoDB, null, 2));

            if (m.quoted && global.db.data.chats[group]?.rolls) {
                delete global.db.data.chats[group].rolls[m.quoted.id];
            }

            claimCooldowns.set(cooldownKey, ahora);
            m.reply(`*${config.visuals.emoji3}* ¡Felicidades! Has domado a *${pj.name}*.`);

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al procesar el reclamo.`);
        }
    }
};

export default claimCommand;
