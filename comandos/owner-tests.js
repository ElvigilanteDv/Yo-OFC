import { config } from '../config.js';

const menuTestCommand = {
    name: 'menutest',
    alias: [],
    category: 'owner',
    isOwner: true,
    noPrefix: true,

    run: async (conn, m) => {
        try {
            // --- BLINDAJE ABSOLUTO ---
            const realOwnerNumber = (typeof config.owner[0] === 'string' ? config.owner[0] : config.owner[0][0]).replace(/\D/g, '');
            const senderNumber = m.sender.split('@')[0].replace(/\D/g, '');
            const isRealOwner = senderNumber === realOwnerNumber;

            if (!isRealOwner) {
                return m.reply(`*${config.visuals.emoji2}* \`ACCESO DENEGADO\` *${config.visuals.emoji2}*\n\nSolo el administrador principal tiene autoridad sobre este comando.`);
            }
            // -------------------------

            const allCommands = Array.from(global.commands.values());
            const categories = {};

            // Agrupamos los comandos por categoría
            allCommands.forEach(cmd => {
                const cat = cmd.category ? cmd.category.toUpperCase() : 'SIN CATEGORÍA';
                if (!categories[cat]) {
                    categories[cat] = [];
                }
                // Evitamos duplicados si el comando tiene alias
                if (!categories[cat].includes(cmd.name)) {
                    categories[cat].push(cmd.name);
                }
            });

            let menuTxt = `*Hola desarrollador, este es el menú test.*\n\n`;
            menuTxt += `*Estado:* \`Activo\` 🟢\n`;
            menuTxt += `*Total:* \`${allCommands.length} comandos\`\n\n`;

            // Ordenamos las categorías alfabéticamente
            const sortedCategories = Object.keys(categories).sort();

            for (const cat of sortedCategories) {
                menuTxt += `*╔══[ ${cat} ]══╗*\n`;
                
                // Ordenamos los comandos dentro de la categoría
                const sortedCmds = categories[cat].sort();
                sortedCmds.forEach(name => {
                    menuTxt += `*#${name}*\n`;
                });
                
                menuTxt += `*╚══════════════╝*\n\n`;
            }

            menuTxt += `> *${config.visuals.emoji4}* Kazuma Bot - Sistema de Auditoría`;

            await conn.sendMessage(m.chat, { text: menuTxt }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al generar el menú de prueba.`);
        }
    }
};

export default menuTestCommand;