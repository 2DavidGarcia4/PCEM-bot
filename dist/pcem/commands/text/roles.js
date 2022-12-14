"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rolesCommand = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../../db");
const rolesCommand = (msg) => {
    var _a, _b;
    const rolesSelectorEb = new discord_js_1.EmbedBuilder()
        .setTitle(`🏅 Roles`)
        .setDescription(`*👀 En tu perfil dentro del servidor veras un apartado de roles en el encontraras todos los roles que tienes.*\n\n${db_1.botDB.emoji.information} En el menú de abajo encontraras barios tipos de roles ya sean roles de **colores** aquellos que solo te modifican el color de tu nombre dentro del servidor, roles de **acceso** aquellos que como su nombre lo indica te dan acceso a categorías y canales ocultos, roles de **notificaciones** aquellos que se utilizan para notificar a usuarios sobre algo como un nuevo anuncio o sorteo, roles **personales** aquellos que solo aportan mas información de ti en tu perfil como roles de genero o edad.\n\n*👉 Al seleccionar una opción del menú de abajo se desplegara un nuevo mensaje como este con mas información para cada tipo de rol y podrás elegir uno o varios roles.*`)
        .setColor(((_b = (_a = msg.guild) === null || _a === void 0 ? void 0 : _a.members.me) === null || _b === void 0 ? void 0 : _b.displayHexColor) || 'White');
    const rolesSelectorMenu = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.StringSelectMenuBuilder()
        .setCustomId('select-type-role')
        .setPlaceholder(`👉 Selecciona un tipo de rol.`)
        .setOptions([
        {
            emoji: '💂',
            label: 'Acceso',
            value: 'access'
        },
        {
            emoji: '🌈',
            label: 'Colores',
            value: 'colors'
        },
        {
            emoji: '🔔',
            label: 'Notificaciones',
            value: 'notifications'
        },
        {
            emoji: '👤',
            label: 'Genero',
            value: 'gender'
        },
        {
            emoji: '🔢',
            label: 'Edad',
            value: 'age'
        },
        {
            emoji: '🎮',
            label: 'Videojuegos',
            value: 'video-games'
        },
    ]));
    msg.channel.send({ embeds: [rolesSelectorEb], components: [rolesSelectorMenu] });
};
exports.rolesCommand = rolesCommand;
