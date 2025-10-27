const common = require('./common.js');

async function approve(interaction, applicationId) {
  await interaction.deferUpdate();
  var application = await interaction.client.meili.index('listing').getDocument(applicationId, { fields: ['name'] });
  await interaction.client.api.register.put({}, `Approve/${applicationId}`)
    .then(async res => {
      if (res.ok) {
        await interaction.editReply({ embeds: [common.styledEmbed(application.name, `Application for ${application.name} (${applicationId}) was approved by ${interaction.user.tag}`)], components:[]});
      }
    })
    .catch(console.error);
}

async function reject(interaction, applicationId) {
  await interaction.deferUpdate();
  var application = await interaction.client.meili.index('listing').getDocument(applicationId, { fields: ['name'] });
  await interaction.client.api.register.put({}, `Reject/${applicationId}`)
    .then(async res => {
      if (res.ok) {
        await interaction.editReply({ embeds: [common.styledEmbed(application.name, `Application for ${application.name} (${applicationId}) was rejected by ${interaction.user.tag}`)], components:[]});
      }
    })
    .catch(console.error);
}

module.exports = {
  approve: approve,
  reject: reject
};