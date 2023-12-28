const { Events } = require('discord.js');

// For when the bot is removed from a guild
module.exports = {
  name: Events.GuildDelete,
  execute: async (client, args) => {
    let guild = args[0];
    
    if (guild.available === false) {
      // Guild experienced an outage, ignore this message
      return;
    }
    
    try {
      await client.api.guild.delete(guild.id)
        .then(res => {
          if (res.status == 200) {
            console.log(`Left guild ${guild.id}`)
          } else {
            console.error(`Failed to unlist guild ${guild.id}: ${res.statusText}`);
          }
        })
    } catch(err) {
      console.error(`Failed to unlist guild ${guild.id}: ${err}`);
    }
  }
}