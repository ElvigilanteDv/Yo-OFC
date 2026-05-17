import { config } from '../config.js';
import { database } from '../database.js';
import fs from 'fs';
import path from 'path';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const baseGroup = "120363423871589037@g.us";

const claimCommand = {
    name: 'claim',
    alias: ['reclamar', 'c'],
    category: 'gacha',
    desc: 'Reclama un personaje disponible en el grupo utilizando tus coins.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, { args }) => {
        try {
            const group = m.chat;
            const userJid = m.sender;
            const ahora = Date.now();
            const tiempoEspera = 9 * 60 * 1000;

            let userDb = await database.getUser(userJid);
            if (!userDb) userDb = { wallet: 0, bank: 0, last_claim: 0 };

            let lastClaimTime = 0;
            try {
                const dailyData = JSON.parse(userDb.last_claim);
                lastClaimTime = dailyData.timeClaim || 0;
            } catch {
                lastClaimTime = new Date(userDb.last_claim).getTime() || 0;
            }

            const tiempoPasado = ahora - lastClaimTime;

            if (tiempoPasado < tiempoEspera) {
                const faltante = tiempoEspera - tiempoPasado;
                const minutos = Math.floor(faltante / 60000);
                const segundos = Math.floor((faltante % 60000) / 1000);
                return m.reply(`*${config.visuals.emoji2}* ¡Espera! Debes esperar **${minutos}m ${segundos}s**.`);
            }

            if (!fs.existsSync(gachaPath)) return m.reply('Error: Base de datos gacha no encontrada.');
            const rawData = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            const plantillaPersonajes = rawData[baseGroup];

            let pjId = null;
            if (args && args[0] && !isNaN(args[0])) {
                pjId = args[0];
            } else if (m.quoted) {
                const chatRolls = global.lastRolls?.get(group);
                if (chatRolls && chatRolls[m.quoted.id]) {
                    pjId = chatRolls[m.quoted.id].id;
                }
            }

            if (!pjId || !plantillaPersonajes[pjId]) {
                return m.reply(`*${config.visuals.emoji2}* Cita el mensaje del personaje que deseas reclamar.`);
            }

            const infoPj = await database.getCharacterOwner(group, pjId);
            if (infoPj && infoPj.status !== 'libre') {
                return m.reply(`*${config.visuals.emoji2}* ¡Este personaje ya tiene dueño!`);
            }

            const pjPlantilla = plantillaPersonajes[pjId];
            const wallet = Number(userDb.wallet || 0);

            if (wallet < pjPlantilla.value) {
                return m.reply(`*${config.visuals.emoji2}* No tienes suficiente dinero (¥${pjPlantilla.value.toLocaleString()}).`);
            }

            userDb.wallet = wallet - pjPlantilla.value;
            
            let dailyData = {};
            try { dailyData = JSON.parse(userDb.last_claim); } catch { dailyData = { time: 0, streak: 0 }; }
            dailyData.timeClaim = ahora;
            userDb.last_claim = JSON.stringify(dailyData);

            await database.claimCharacter(group, userJid, pjId);
            await database.saveUser(userJid, userDb);

            m.reply(`*${config.visuals.emoji3}* ¡Felicidades! Has domado a *${pjPlantilla.name}* por ¥${pjPlantilla.value.toLocaleString()}.`);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al procesar el reclamo.`);
        }
    }
};

export default claimCommand;