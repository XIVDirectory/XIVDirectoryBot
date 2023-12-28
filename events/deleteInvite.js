const { Events } = require('discord.js');
const common = require('../common.js');

// For when the bot invite is deleted from a guild
module.exports = {
  name: Events.InviteDelete,
  execute: async (client, args) => {
    let invite = args[0];
    
    // The event may or may not be for our invite, so create one regardless. If we already have an invite for the guild, we just get it back again
    await common.createInvite(invite.guild);
    
    // Mark the server as stale so we can refresh it later
    try {
      await client.api.guild.post({}, `Refresh/${invite.guild.id}`)
        .then(res => {
          if (res.status == 200) {
            console.log(`Guild ${invite.guild.id} queued for a data refresh`)
          } else {
            console.error(`Failed to refresh guild ${invite.guild.id}: ${res.statusText}`);
          }
        })
    } catch(err) {
      console.error(`Failed to refresh guild ${invite.guild.id}: ${err}`);
    }
  }
}