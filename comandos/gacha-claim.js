import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const baseGroup = "120363423871589037@g.us";

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
            const user = m.sender;
            const userId = m.sender.split('@')[0].split(':')[0];
            const ahora = Date.now();
            const tiempoEspera = 9 * 60 * 1000;

            if (!global.db.data.users[user]) global.db.data.users[user] = {};
            const userDb = global.db.data.users[user];

            if (userDb.lastClaimRoll && ahora - userDb.lastClaimRoll < tiempoEspera) {
                const faltante = tiempoEspera - (ahora - userDb.lastClaimRoll);
                const minutos = Math.floor(faltante / 60000);
                const segundos = Math.floor((faltante % 60000) / 1000);
                return m.reply(`*${config.visuals.emoji2}* ¡Espera! Debes esperar **${minutos}m ${segundos}s** para reclamar otro personaje.`);
            }

            if (!fs.existsSync(gachaPath)) return m.reply('Error: Base de datos gacha no encontrada.');
            const rawData = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            const plantillaPersonajes = rawData[baseGroup];

            let pjId = null;
            if (args[0] && !isNaN(args[0])) {
                pjId = args[0];
            } else if (m.quoted) {
                const chatRolls = global.db.data.chats[group]?.rolls;
                if (chatRolls && chatRolls[m.quoted.id]) {
                    pjId = chatRolls[m.quoted.id].id;
                }
            }

            if (!pjId || !plantillaPersonajes[pjId]) {
                return m.reply(`*${config.visuals.emoji2}* Cita el mensaje del personaje que deseas reclamar.`);
            }

            if (!global.db.data.chats[group].gacha) global.db.data.chats[group].gacha = {};
            const dbGrupoGacha = global.db.data.chats[group].gacha;

            const pjInfoGrupo = dbGrupoGacha[pjId] || { status: 'libre', owner: null };

            if (pjInfoGrupo.status !== 'libre') {
                return m.reply(`*${config.visuals.emoji2}* ¡Este personaje ya tiene dueño!`);
            }

            const pjPlantilla = plantillaPersonajes[pjId];

            if (typeof userDb.wallet === 'undefined') userDb.wallet = 0;
            const saldo = userDb.wallet;

            if (saldo < pjPlantilla.value) {
                return m.reply(`*${config.visuals.emoji2}* No tienes suficiente dinero (¥${pjPlantilla.value.toLocaleString()}) en tu cartera.`);
            }

            userDb.wallet -= pjPlantilla.value;
            dbGrupoGacha[pjId] = {
                status: 'domado',
                owner: user
            };

            if (m.quoted && global.db.data.chats[group]?.rolls) {
                delete global.db.data.chats[group].rolls[m.quoted.id];
            }

            userDb.lastClaimRoll = ahora;
            
            m.reply(`*${config.visuals.emoji3}* ¡Felicidades! Has domado a *${pjPlantilla.name}* por ¥${pjPlantilla.value.toLocaleString()}.`);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al procesar el reclamo.`);
        }
    }
};

export default claimCommand;