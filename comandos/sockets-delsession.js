import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const sessionsPath = path.resolve('./sesiones_subbots');

const delSession = {
    name: 'delsession',
    alias: ['cerrarsesion', 'out'],
    category: 'sockets',
    desc: 'Cierra la sesión del socket actual y elimina permanentemente sus datos de conexión del sistema.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const isOwner = config.owner.includes(m.sender);

            if (conn.user.id.split(':')[0] !== user && !isOwner) {
                return m.reply(`*${config.visuals.emoji2}* Solo el dueño de este socket puede cerrar su propia sesión.`);
            }

            const userSessionPath = path.join(sessionsPath, user);

            await m.reply(`*${config.visuals.emoji3}* Cerrando sesión y eliminando datos...`);

            global.subBots.delete(m.sender.split(':')[0] + '@s.whatsapp.net');

            if (fs.existsSync(userSessionPath)) {
                fs.rmSync(userSessionPath, { recursive: true, force: true });
            }

            await conn.logout();
            await conn.end();

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al cerrar la sesión.`);
        }
    }
};

export default delSession;
