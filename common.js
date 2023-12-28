const { WebhookClient } = require('discord.js');

function styledEmbed(title, description, colour) {
  return {
      title: title,
      description: description,
      color: colour || 0xde153a,
      footer: {
        text: 'XIVDirectory',
        iconURL: 'https://xiv.directory/favicon.ico'
      }
    }
}

async function createInvite(guild) {
  // NB: If the invite already exists under the same conditions (channel, user, maxAge), then discord just gives us back the same invite unless we specified the "unique" param
  // https://discord.com/developers/docs/resources/channel#create-channel-invite
  try {
    var availableChannel = guild.rulesChannel ?? guild.channels.cache.find(x => x.isTextBased() && x.viewable)
    if (availableChannel) {
      myInvite = await guild.invites.create(availableChannel, { maxAge: 0, reason: 'XIVDirectory invite' })
      return { url: myInvite.url, guild: myInvite.guild };
    }
  }
  catch (err) {
    console.error(`Failed to create invite for guild ${guild.id}: ${err}`);
  }
  
  return { url: '' };
}

function guildIconUrl(guild) {
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${(guild.icon.startsWith("a_") ? "gif" : "png")}`
}

module.exports = {
  styledEmbed: styledEmbed,
  createInvite: createInvite,
  guildIconUrl: guildIconUrl
};