module.exports = {
  name: 'status',
  description: 'Check that all our dependency services are running',
  guilds: [{ guild: "1122673195825246318", permittedRoles: [ "1122673255145279558" ] }],
  options:[],
  executeInteraction: async(interaction) => {
    await interaction.deferReply();
    
    var apiStatus = await interaction.client.api.status.get()
      .catch(() => { return { status: 0 } });
    var apiAvailable = apiStatus.status == 200;
    
    var mongoStatus =  await interaction.client.mongo.admin().serverStatus()
      .catch(() => { return { uptime: 0 }});
    var mongoAvailable = mongoStatus.uptime > 0
    
    var meiliStatus = await interaction.client.meili.health()
      .catch(() => { return { status: '' } });
    var meiliAvailable = meiliStatus.status == 'available';
    
    var message = `**Status Check**

${ apiAvailable ? '✅' : '❌' } API Gateway
${ mongoAvailable ? '✅' : '❌' } Database
${ meiliAvailable ? '✅' : '❌' } Search
`;
    
    interaction.editReply(message);
  }
}