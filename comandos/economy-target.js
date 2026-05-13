import fs from 'fs-extra';
import path from 'path';
import { config } from '../config.js';

const targetsFolder = path.resolve('./jsons/targets');

const claimCard = {
    name: 'target',
    alias: ['usartarjeta', 'tarjeta'],
    category: 'economy',
    desc: 'Reclama el saldo de una tarjeta de regalo mediante su código único.',
    isGroup: true,
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender;
            const inputCode = args[0];

            if (!inputCode) {
                return m.reply(`*${config.visuals.emoji2}* \`Falta Código\`\n\nPor favor, ingresa el código de tu tarjeta.\n\n> Ejemplo: #target KZM-XXXX`);
            }

            await fs.ensureDir(targetsFolder);

            const cardPath = path.join(targetsFolder, `${inputCode}.json`);

            if (!await fs.pathExists(cardPath)) {
                return m.reply(`*${config.visuals.emoji2}* \`Código Inválido\`\n\nEsa tarjeta no existe o ya fue reclamada.`);
            }

            const cardData = await fs.readJson(cardPath);
            const monto = Number(cardData.monto);

            if (!global.db.data.users[user]) global.db.data.users[user] = { bank: 0 };
            const userDb = global.db.data.users[user];

            userDb.bank = (userDb.bank || 0) + monto;

            await fs.remove(cardPath);

            let texto = `*${config.visuals.emoji3}* \`TARJETA RECLAMADA\` *${config.visuals.emoji3}*\n\n`;
            texto += `*❁* Código: \`${inputCode}\`\n`;
            texto += `*❁* Monto: \`¥${monto.toLocaleString()}\`\n\n`;
            texto += `> El dinero ha sido depositado en tu **Banco**.`;

            await conn.sendMessage(m.chat, { text: texto }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al procesar la tarjeta.`);
        }
    }
};

export default claimCard;