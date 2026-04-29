import { config } from '../config.js';
import { pptPhrases } from './frases/rpg/ppt.js';
import fs from 'fs-extra';
import path from 'path';

const ecoPath = path.resolve('./config/database/economy/economy.json');
const invPath = path.resolve('./config/database/economy/inventory.json');

const pptCommand = {
    name: 'ppt',
    alias: ['juego', 'piedrapapelotijera'],
    category: 'rpg',
    desc: 'Duelo de Piedra, Papel o Tijera con apuestas. El amuleto dobla el límite de apuesta.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const choice = args[0]?.toLowerCase();
            const betInput = args[1];

            if (!fs.existsSync(invPath)) fs.outputJsonSync(invPath, {});
            let invDb = await fs.readJson(invPath);
            const tieneAmuleto = invDb[user]?.amuleto > 0;

            const minBet = 4000;
            const maxBet = tieneAmuleto ? 30000 : 15000;
            const cooldown = 5 * 60 * 1000; 

            if (!choice || !['piedra', 'papel', 'tijera'].includes(choice)) {
                return m.reply(`*${config.visuals.emoji2} \`FORMATO INCORRECTO\` ${config.visuals.emoji2}*\n\n> Uso: *${usedPrefix}ppt (piedra/papel/tijera) (cantidad)*`);
            }

            const bet = parseInt(betInput);
            if (!betInput || isNaN(bet) || bet <= 0) return m.reply(`*${config.visuals.emoji2}* Ingresa una apuesta válida.`);

            if (bet < minBet || bet > maxBet) {
                return m.reply(`*${config.visuals.emoji2}* Apuesta: *¥${minBet.toLocaleString()}* - *¥${maxBet.toLocaleString()}*.${tieneAmuleto ? '' : '\n\n💡 *Tip:* Usa un Amuleto del Apostador para subir el límite.'}`);
            }

            if (!fs.existsSync(ecoPath)) fs.outputJsonSync(ecoPath, {});
            let ecoDb = await fs.readJson(ecoPath);
            if (!ecoDb[user]) ecoDb[user] = { wallet: 0, bank: 0, lastPpt: 0 };

            const now = Date.now();
            if (now - (ecoDb[user].lastPpt || 0) < cooldown) {
                const timeLeft = cooldown - (now - ecoDb[user].lastPpt);
                return m.reply(`*${config.visuals.emoji2}* Espera *${Math.floor(timeLeft / 60000)}m ${Math.floor((timeLeft % 60000) / 1000)}s*.`);
            }

            const totalMoney = (ecoDb[user].wallet || 0) + (ecoDb[user].bank || 0);
            if (totalMoney < bet) return m.reply(`*${config.visuals.emoji2}* No tienes suficiente dinero.`);

            const isWin = Math.random() < 0.50; // Ajustado a 50/50 para balance
            let botChoice = isWin ? (choice === 'piedra' ? 'tijera' : choice === 'papel' ? 'piedra' : 'papel') : (choice === 'piedra' ? 'papel' : choice === 'papel' ? 'tijera' : 'piedra');
            const result = isWin ? 'win' : 'lose';
            const phrase = pptPhrases[result][Math.floor(Math.random() * pptPhrases[result].length)];

            if (tieneAmuleto) {
                invDb[user].amuleto -= 1;
                await fs.writeJson(invPath, invDb, { spaces: 2 });
            }

            if (result === 'lose') {
                if (ecoDb[user].wallet >= bet) ecoDb[user].wallet -= bet;
                else {
                    const rem = bet - (ecoDb[user].wallet || 0);
                    ecoDb[user].wallet = 0;
                    ecoDb[user].bank = (ecoDb[user].bank || 0) - rem;
                }
            } else {
                ecoDb[user].wallet = (ecoDb[user].wallet || 0) + bet;
            }

            ecoDb[user].lastPpt = now;
            await fs.writeJson(ecoPath, ecoDb, { spaces: 2 });

            const emojiMap = { piedra: '🗿', papel: '📄', tijera: '✂️' };
            await m.reply(`*${config.visuals.emoji3}* \`DUELO DE PPT\` *${config.visuals.emoji3}*\n${tieneAmuleto ? '🧧 *¡AMULETO USADO!*\n' : ''}\n👤 *Tú:* ${choice.toUpperCase()} ${emojiMap[choice]}\n🤖 *Bot:* ${botChoice.toUpperCase()} ${emojiMap[botChoice]}\n\n> ${phrase}\n\n${result === 'win' ? `💰 *Ganaste:* ¥${bet.toLocaleString()}` : `📉 *Perdiste:* ¥${bet.toLocaleString()}`}`);
        } catch (e) {
            m.reply('✘ Error en el sistema de PPT.');
        }
    }
};

export default pptCommand;
