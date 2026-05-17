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

    run: async (conn, m, args) => {
        try {
            const group = m.chat;
            const userJid = m.sender.replace(/:.*@/g, '@');
            const ahora = new Date();
            const tiempoEspera = 9 * 60 * 1000;

            let userDb = await database.getUser(userJid);
            if (!userDb) userDb = { jid: userJid, wallet: 0, last_claim: new Date(0) };

            const lastClaim = new Date(userDb.last_claim).getTime();
            const tiempoPasado = ahora.getTime() - lastClaim;

            if (tiempoPasado < tiempoEspera) {
                const faltante = tiempoEspera - tiempoPasado;
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

            const infoGrupo = await database.getCharacterOwner(group, pjId);
            if (infoGrupo && infoGrupo.status !== 'libre') {
                return m.reply(`*${config.visuals.emoji2}* ¡Este personaje ya tiene dueño!`);
            }

            const pjPlantilla = plantillaPersonajes[pjId];
            const saldo = parseInt(userDb.wallet || 0);

            if (saldo < pjPlantilla.value) {
                return m.reply(`*${config.visuals.emoji2}* No tienes suficiente dinero (¥${pjPlantilla.value.toLocaleString()}) en tu cartera.`);
            }

            userDb.wallet = saldo - pjPlantilla.value;
            userDb.last_claim = ahora;

            await database.claimCharacter(group, userJid, pjId);
            await database.saveUser(userJid, userDb);

            if (m.quoted && global.db.data.chats[group]?.rolls) {
                delete global.db.data.chats[group].rolls[m.quoted.id];
            }

            m.reply(`*${config.visuals.emoji3}* ¡Felicidades! Has domado a *${pjPlantilla.name}* por ¥${pjPlantilla.value.toLocaleString()}.`);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al procesar el reclamo.`);
        }
    }
};

export default claimCommand;