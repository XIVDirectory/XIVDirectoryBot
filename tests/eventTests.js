const { expect, assert } = require('chai');
const sinon = require('sinon');

// Mute the console outputs for the duration of the test
sinon.stub(console, "log");
sinon.stub(console, "error");

describe("Events", () => {
  var fakeGuildEndpoint = {}
  const dummyClient = { api: { guild: {} }, user: { id: '12345' } };
  var dummyGuild;
  
  beforeEach(() => {
    fakeGuildEndpoint = { get: sinon.fake(), post: sinon.fake(), patch: sinon.fake(), delete: sinon.fake() };
    dummyClient.api.guild = fakeGuildEndpoint;
    dummyGuild = {
      guildId: 'fakeguildid',
      channels: { cache: { find: sinon.stub().returns({ })}},
      invites: {
        fetch: sinon.stub().returns([{ inviterId: '12345' }]),
        create: sinon.stub().returns([{ inviterId: '12345' }])
      }
    };
  });
  
  describe("Inviting bot", () => {
    const inviteEvent = require('../events/inviteBot.js')
  
    it("should register the server", async () => {
      await inviteEvent.execute(dummyClient, [dummyGuild]);
      sinon.assert.calledOnce(fakeGuildEndpoint.post);
    });

    it("should create a new invite if none exists", async () => {
      dummyGuild.invites.fetch = sinon.stub().returns([]);
      await inviteEvent.execute(dummyClient, [dummyGuild]);
      sinon.assert.calledOnce(dummyGuild.invites.create);
    });
       
    it("should not reuse invites created by others", async () => {
      dummyGuild.invites.fetch = sinon.stub().returns([{ inviterId: '56789' }]);
      await inviteEvent.execute(dummyClient, [dummyGuild]);
      sinon.assert.calledOnce(dummyGuild.invites.create);
    });
    
    it("during an outage should not register the server", async () => {
      await inviteEvent.execute(dummyClient, [{ guildId: 'fakeguildid', available: false }]);
      sinon.assert.notCalled(fakeGuildEndpoint.post);
    });
    
    it("with API unrerachable should not crash", async () => {
      fakeGuildEndpoint.post = sinon.stub().throws(new Error("Some fake error"));
      
      try {
        await inviteEvent.execute(dummyClient, [dummyGuild]);
      } catch {
        assert.fail();
      }
    });
  });
  
  describe("Kicking bot", () => {
    const kickEvent = require('../events/removeBot.js')
    
    it("should unlist the server", async () => {
      await kickEvent.execute(dummyClient, [{ guildId: 'fakeguildid' }]);
      sinon.assert.calledOnce(fakeGuildEndpoint.delete);
    });
    
    it("during an outage should not unlist the server", async () => {
      await kickEvent.execute(dummyClient, [{ guildId: 'fakeguildid', available: false }]);
      sinon.assert.notCalled(fakeGuildEndpoint.delete);
    });
    
    it("with API unrerachable should not crash", async () => {
      fakeGuildEndpoint.delete = sinon.stub().throws(new Error("Some fake error"));
      
      try {
        await kickEvent.execute(dummyClient, [{ guildId: 'fakeguildid' }])
      } catch {
        assert.fail();
      }
    });
  });
  
  describe("Delete invite", () => {
    const removeEvent = require('../events/deleteInvite.js')
    
    it("should refresh the server", async () => {
      dummyGuild.invites.fetch = sinon.stub().returns([]);
      await removeEvent.execute(dummyClient, [{ guild: dummyGuild }]);
      sinon.assert.calledOnce(fakeGuildEndpoint.post);
    });

    it("with API unrerachable should not crash", async () => {
      fakeGuildEndpoint.delete = sinon.stub().throws(new Error("Some fake error"));
      dummyGuild.invites.fetch = sinon.stub().returns([]);
     
      try {
        await removeEvent.execute(dummyClient, [{ guild: dummyGuild }]);
      } catch {
        assert.fail();
      }
    });
  });
  
  describe("Update server", () => {
    const updateEvent = require('../events/updateServer.js')
    
    it("with new name should update the details", async () => {
      await updateEvent.execute(dummyClient, [
        { name: 'abc', icon: '123', nsfwLevel: 1 },
        { name: 'def', icon: '123', nsfwLevel: 1 },
      ]);
      
      sinon.assert.calledOnce(fakeGuildEndpoint.patch);
    });
    
    it("with new name should refresh the server", async () => {
      fakeGuildEndpoint.patch = sinon.stub().returns({})

      await updateEvent.execute(dummyClient, [
        { name: 'abc', icon: '123', nsfwLevel: 1 },
        { name: 'def', icon: '123', nsfwLevel: 1 },
      ]);
      
      sinon.assert.calledOnce(fakeGuildEndpoint.post);
    });

    it("with new icon should update the details", async () => {
      await updateEvent.execute(dummyClient, [
        { name: 'abc', icon: '123', nsfwLevel: 1 },
        { name: 'abc', icon: '456', nsfwLevel: 1 },
      ]);
     
      sinon.assert.calledOnce(fakeGuildEndpoint.patch);
    });

    it("with new icon should refresh the server", async () => {
      fakeGuildEndpoint.patch = sinon.stub().returns({})

      await updateEvent.execute(dummyClient, [
        { name: 'abc', icon: '123', nsfwLevel: 1 },
        { name: 'abc', icon: '456', nsfwLevel: 1 },
      ]);
     
      sinon.assert.calledOnce(fakeGuildEndpoint.post);
    });

    it("with new NSFW level should refresh the server", async () => {
      fakeGuildEndpoint.patch = sinon.stub().returns({})

      await updateEvent.execute(dummyClient, [
        { name: 'abc', icon: '123', nsfwLevel: 1 },
        { name: 'abc', icon: '123', nsfwLevel: 3 },
      ]);
      
      sinon.assert.calledOnce(fakeGuildEndpoint.post);
    });

    it("with new NSFW level should refresh the server", async () => {
      await updateEvent.execute(dummyClient, [
        { name: 'abc', icon: '123', nsfwLevel: 1 },
        { name: 'abc', icon: '123', nsfwLevel: 3 },
      ]);
      
      sinon.assert.calledOnce(fakeGuildEndpoint.patch);
    });

    it("for an unwatched field should not refresh the server", async () => {
      await updateEvent.execute(dummyClient, [
        { name: 'abc', icon: '123', nsfwLevel: 1, description: 'foo' },
        { name: 'abc', icon: '123', nsfwLevel: 1, description: 'bar' },
      ]);
      sinon.assert.notCalled(fakeGuildEndpoint.post);
    });
    
    it("with API unrerachable should not crash", async () => {
      fakeGuildEndpoint.delete = sinon.stub().throws(new Error("Some fake error"));
     
      try {
        await updateEvent.execute(dummyClient, [
          { name: 'abc', icon: '123', nsfwLevel: 1 },
          { name: 'def', icon: '123', nsfwLevel: 1 },
        ]);
      } catch {
        assert.fail();
      }
    });
  });
});