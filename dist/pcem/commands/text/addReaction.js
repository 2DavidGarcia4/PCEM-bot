"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReactionCommand = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../../db");
const functions_1 = require("../../../utils/functions");
const addReactionCommand = (msg, client, args) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const { prefix } = db_1.botDB;
    if (!((_a = msg.member) === null || _a === void 0 ? void 0 : _a.permissions.has('Administrator')))
        return (0, functions_1.setError)(msg, `No eres administrador en el servidor por lo tanto no puedes ejecutar el comando.`);
    let emojis = (_b = msg.guild) === null || _b === void 0 ? void 0 : _b.emojis.cache.map(e => e);
    if (!emojis)
        return;
    const embInfo = new discord_js_1.EmbedBuilder()
        .setTitle("Comando addreaction")
        .addFields({ name: `**Uso:**`, value: `\`\`${prefix}addr <ID del mensaje> <nombre del emoji o ID del emoji>\`\`\n\`\`${prefix}addr <Mencion del canal o ID> <ID del menseje> <nombre del emoji o ID>\`\`` }, { name: `**Ejemplos:**`, value: `${prefix}addr ${msg.id} ${emojis[Math.floor(Math.random() * emojis.length)].name}\n${prefix}addr ${msg.id} ${emojis[Math.floor(Math.random() * emojis.length)].id}\n${prefix}addr ${msg.channel} ${msg.id} ${emojis[Math.floor(Math.random() * emojis.length)].name}\n${prefix}addr ${msg.channel} ${msg.id} ${emojis[Math.floor(Math.random() * emojis.length)].id}\n${prefix}addr ${msg.channel.id} ${msg.id} ${emojis[Math.floor(Math.random() * emojis.length)].name}\n${prefix}addr ${msg.channel.id} ${msg.id} ${emojis[Math.floor(Math.random() * emojis.length)].id}\n` })
        .setColor("#060606")
        .setFooter({ text: "Agrega una reaccion con el emoji que quieras a un mensaje por medio del bot.", iconURL: (_c = client.user) === null || _c === void 0 ? void 0 : _c.displayAvatarURL() })
        .setTimestamp();
    if (!args[0])
        return setTimeout(() => {
            msg.reply({ allowedMentions: { repliedUser: false }, embeds: [embInfo] });
        }, 500);
    const canal = msg.mentions.channels.first() || ((_d = msg.guild) === null || _d === void 0 ? void 0 : _d.channels.cache.get(args[0]));
    const embAddReact = new discord_js_1.EmbedBuilder()
        .setAuthor({ name: ((_e = msg.member) === null || _e === void 0 ? void 0 : _e.nickname) ? msg.member.nickname : msg.author.tag, iconURL: msg.author.displayAvatarURL() })
        .setTitle(`${db_1.botDB.emoji.afirmative} Reacci??n agregada al mensaje`)
        .setColor(((_g = (_f = msg.guild) === null || _f === void 0 ? void 0 : _f.members.me) === null || _g === void 0 ? void 0 : _g.displayHexColor) || 'White')
        .setTimestamp();
    if (canal && canal.type == discord_js_1.ChannelType.GuildText) {
        if (isNaN(Number(args[1])))
            return (0, functions_1.setError)(msg, `El argumento proporcionado no puede ser una ID de un mensaje avalida por que no es num??rico.`);
        yield canal.messages.fetch(args[1]).then(mensage => {
            var _a;
            let emoji = (_a = msg.guild) === null || _a === void 0 ? void 0 : _a.emojis.cache.find(f => f.name === args[2] || f.id === args[2]);
            if (!emoji)
                return (0, functions_1.setError)(msg, `No pude encontrar al emoji, aseg??rate de proporcionar el nombre o su ID correctamente.`);
            embAddReact
                .setDescription(`He agregado la reaccion con el emoji ${emoji} al [mensaje](${mensage.url}) con la ID ${args[1]} que esta en el canal ${canal}`);
            mensage.react(emoji).then(() => (0, functions_1.sendMessageText)(msg, { embeds: [embAddReact] }));
        }).catch(c => {
            (0, functions_1.setError)(msg, `No encontr?? el mensaje, aseg??rate de proporcionar bien la ID del mensaje.`);
        });
    }
    else
        (yield msg.channel.messages.fetch(args[0]).then(onliMSG => {
            var _a;
            let emoji = (_a = msg.guild) === null || _a === void 0 ? void 0 : _a.emojis.cache.find(f => f.name == args[1] || f.id == args[1]);
            if (!emoji)
                return (0, functions_1.setError)(msg, `No pude encontrar al emoji, aseg??rate de proporcionar el nombre o su ID correctamente.`);
            embAddReact
                .setDescription(`He agregado la reaccion con el emoji ${emoji} al [mensaje](${onliMSG.url}) con la ID ${args[0]} en este canal`);
            onliMSG.react(emoji).then(() => (0, functions_1.sendMessageText)(msg, { embeds: [embAddReact] }));
        }).catch(() => {
            (0, functions_1.setError)(msg, `No encontr?? el mensaje, aseg??rate de proporcionar bien la ID del mensaje.`);
        }));
});
exports.addReactionCommand = addReactionCommand;
