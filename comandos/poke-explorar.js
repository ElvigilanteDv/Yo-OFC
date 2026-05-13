import { config } from '../config.js';

const searchPokemon = {
    name: 'explorar',
    alias: ['buscar', 'find'],
    category: 'pokemon',
    desc: 'Busca un pokémon salvaje (Verifica si tienes ¥6,000).',
    isGroup: true,
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const from = m.chat;
            const sender = m.sender;
            const cost = 6000;

            if (!global.db.data.chats[from]?.pokemon) {
                return m.reply(`*${config.visuals.emoji2}* \`SISTEMA DESACTIVADO\`\n\nEl juego de Pokémon está desactivado en este grupo.`);
            }

            const userEco = global.db.data.users[sender] || { wallet: 0, bank: 0 };
            const totalMoney = (userEco.wallet || 0) + (userEco.bank || 0);

            if (totalMoney < cost) {
                return m.reply(`*${config.visuals.emoji2}* \`Fondos Insuficientes\`\n\nNecesitas al menos ¥${cost.toLocaleString()} para poder explorar y capturar.`);
            }

            if (!global.db.data.users[sender].pokemon) {
                global.db.data.users[sender].pokemon = { pc: [], lastSearch: 0 };
            }

            const user = global.db.data.users[sender].pokemon;
            const ahora = Date.now();
            const cd = 120000;

            if (ahora - (user.lastSearch || 0) < cd) {
                const rest = cd - (ahora - user.lastSearch);
                const min = Math.floor(rest / 60000);
                const sec = Math.floor((rest % 60000) / 1000);
                return m.reply(`*${config.visuals.emoji2}* Espera *${min}m ${sec}s* para volver a explorar.`);
            }

            const pokeId = Math.floor(Math.random() * 900) + 1;
            const isShiny = Math.random() < 1/150;
            const lvl = Math.floor(Math.random() * 10) + 1;
            const img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${isShiny ? 'shiny/' : ''}${pokeId}.png`;

            global.db.data.chats[from].pokemonSession = { 
                id: pokeId, 
                lvl, 
                shiny: isShiny, 
                expire: ahora + 300000,
                solicitante: sender 
            };

            user.lastSearch = ahora;

            let txt = `*${config.visuals.emoji3}* \`RADAR POKÉMON\` *${config.visuals.emoji3}*\n\n`;
            txt += `¡Se ha detectado un pokémon salvaje!\n\n`;
            txt += `*Nivel:* ${lvl}\n`;
            txt += `*Variante:* ${isShiny ? '✨ Shiny' : 'Normal'}\n`;
            txt += `*Precio de captura:* ¥${cost.toLocaleString()}\n\n`;
            txt += `> Tienes 5 minutos para usar *#capturar*. El dinero se descontará al realizar la captura.`;

            await conn.sendMessage(from, { image: { url: img }, caption: txt }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en el radar.`);
        }
    }
};

export default searchPokemon;