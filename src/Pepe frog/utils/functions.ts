import { Client } from "discord.js"
import { frogDb } from "../db"

export const setGuildStatus = (client: Client) => {
  const snackServer = client.guilds.cache.get(frogDb.serverId)
  const online = snackServer?.members.cache.filter(f=> f.presence?.status == 'dnd' || f.presence?.status == 'idle' || f.presence?.status == 'online' || f.presence?.status == 'invisible').size
  const allMembers = snackServer?.memberCount, nsfwChannels = snackServer?.channels.cache.filter(f=> f.parentId == '1053401638494289931').size
  const onlineChanel = snackServer?.channels.cache.get('1053426402361352269')
  const membersChanel = snackServer?.channels.cache.get('1053426454538493993')
  const nsfwChanel = snackServer?.channels.cache.get('1053426479607849112')
  const onlineName = `🟢│en linea: ${online?.toLocaleString()}`, membersName = `👥│todos: ${allMembers?.toLocaleString()}`, nsfwName = `🔞│canales nsfw: ${nsfwChannels}`

  if(onlineChanel?.name != onlineName) onlineChanel?.edit({name: onlineName})
  if(onlineChanel?.name != membersName) membersChanel?.edit({name: membersName})
  if(onlineChanel?.name != nsfwName) nsfwChanel?.edit({name: nsfwName})
}