const { ApplicationCommandOptionType } = require('discord.js');
const common = require('../common.js');

module.exports = {
  name: 'report',
  description: 'Admin report about registrations',
  guilds: [{ guild: "1122673195825246318", permittedRoles: [ "1122673255145279558" ] }],
  options:[],
  executeInteraction: async(interaction) => {
    await interaction.deferReply();

    var allListings = await interaction.client.meili.index('listing').getStats()
      .then(res => res.numberOfDocuments);

    var selfManagedListings = await interaction.client.meili.index('listing').search('', { filter: [['status = 2', 'status=99']], hitsPerPage: 0 })
      .then(res => res.totalHits);
    
    var completedRegistrations = await interaction.client.meili.index('listing').search('', { filter: ['summary IS NOT EMPTY', 'summary IS NOT NULL', ['status=2', 'status=99']], hitsPerPage: 0 })
      .then(res => res.totalHits);

    var missingPermissions = await interaction.client.meili.index('listing').search('', { filter: ['serverId IS NOT NULL', ['status=99', 'isStale = true']], attributesToRetrieve: ['serverId','id','name','owner','inviteLink'] })
      .then(res => res.hits.filter(p => !p.inviteLink));
      
    var embedMessage = `**Total Listings**: ${allListings}
**Registrations**: ${selfManagedListings}
**Completed**: ${completedRegistrations}`;

    if (missingPermissions) {
      embedMessage += "\n\n**Missing Invite Permissions**"
      for (const server of missingPermissions) {
        var ownerText = server.owner ? `-> <@${server.owner}>` : '';
        embedMessage += `\n[${server.name}](<https://xiv.directory/listing/${server.id}>) (${server.serverId}) ${ownerText}`
      }
    }
    
    var embed = common.styledEmbed('Registrations Status', embedMessage)
    var message =  { embeds: [embed] };
    interaction.editReply(message);
  }
}