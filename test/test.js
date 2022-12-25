var login = require('../index.js');
var fs = require('fs-extra');
var assert = require('assert');

var conf = JSON.parse(process.env.testconfig || fs.readFileSync('test/test-config.json', 'utf8'));
var credentials = {
  email: conf.user.email,
  password: conf.user.password,
};

var userIDs = conf.userIDs;

var options = { selfListen: true, listenEvents: true, logLevel: "silent"};
var pageOptions = {logLevel: 'silent', pageID: conf.pageID};
var getType = require('../utils').getType;
var formatDeltaMessage = require('../utils').formatDeltaMessage;
var shareAttachmentFixture = require('./data/shareAttach');

var userID = conf.user.id;

var groupChatID;
var groupChatName;

function checkErr(done){
  return function(err) {
    if (err) done(err);
  };
}

describe('Login:', function() {
  var api = null;
  process.on('SIGINT', () => api && !api.logout() && console.log("Logged out :)"));
  var tests = [];
  var stopListening;
  this.timeout(20000);

  function listen(done, matcher) {
    tests.push({matcher:matcher, done:done});
  }

  before(function(done) {
    login(credentials, options, function (err, localAPI) {
      if(err) return done(err);

      assert(localAPI);
      api = localAPI;
      stopListening = api.listen(function (err, msg) {
        if (err) throw err;
        if (msg.type === "message") {
          assert(msg.senderID && !isNaN(msg.senderID));
          assert(msg.threadID && !isNaN(msg.threadID));
          assert(msg.timestamp && !isNaN(msg.timestamp));
          assert(msg.messageID != null && msg.messageID.length > 0);
          assert(msg.body != null || msg.attachments.length > 0);
        }
        // Inaalis ang pagtutugma ng function at ang mga tawag ay tapos na
        tests = tests.filter(function(test) {
          return !(test.matcher(msg) && (test.done() || true));
        });
      });

      done();
    });
  });

  it('dapat mag-login nang walang error', function (){
    assert(api);
  });

  it('dapat makuha ang kasalukuyang user ID', function (){
    assert(userID === api.getCurrentUserID());
  });

  it('dapat magpadala ng text message object (user)', function (done){
    var body = "text-msg-obj-" + Date.now();
    listen(done, msg =>
      msg.type === 'message' &&
      msg.body === body &&
      msg.isGroup === false
    );
    api.sendMessage({body: body}, userID, checkErr(done));
  });

  it('dapat magpadala ng sticker message object (user)', function (done){
    var stickerID = '767334526626290';
    listen(done, msg =>
      msg.type === 'message' &&
      msg.attachments.length > 0 &&
      msg.attachments[0].type === 'sticker' &&
      msg.attachments[0].stickerID === stickerID &&
      msg.isGroup === false
    );
    api.sendMessage({sticker: stickerID}, userID, checkErr(done));
  });

  it('dapat magpadala ng pangunahing string (user)', function (done){
    var body = "basic-str-" + Date.now();
    listen(done, msg =>
      msg.type === 'message' &&
      msg.body === body &&
      msg.isGroup === false
    );
    api.sendMessage(body, userID, checkErr(done));
  });

  it('dapat makakuha ng impormasyon sa thread (user)', function (done){
      api.getThreadInfo(userID, (err, info) => {
        if (err) done(err);

        assert(info.participantIDs != null && info.participantIDs.length > 0);
        assert(!info.participantIDs.some(isNaN));
        assert(!info.participantIDs.some(v => v.length == 0));
        assert(info.name != null);
        assert(info.messageCount != null && !isNaN(info.messageCount));
        assert(info.hasOwnProperty('emoji'));
        assert(info.hasOwnProperty('nicknames'));
        assert(info.hasOwnProperty('color'));
        done();
      });
  });


  it('dapat makuha ang kasaysayan ng chat (user)', function (done) {
    api.getThreadHistory(userID, 5, null, function(err, data) {
      checkErr(done)(err);
      assert(getType(data) === "Array");
      assert(data.every(function(v) {return getType(v) == "Object";}));
      done();
    });
  });
  
  it('dapat makuha ang kasaysayan ng chat (user) (graphql)', function (done) {
    api.getThreadHistoryGraphQL(userID, 5, null, function(err, data) {
      checkErr(done)(err);
      assert(getType(data) === "Array");
      assert(data.every(function(v) {return getType(v) == "Object";}));
      done();
    });
  });

  it('dapat gumawa ng chat', function (done){
    var body = "new-chat-" + Date.now();
    var inc = 0;

    function doneHack(){
      if (inc === 1) return done();
      inc++;
    }

    listen(doneHack, msg =>
      msg.type === 'message' && msg.body === body
    );
    api.sendMessage(body, userIDs, function(err, info){
      checkErr(done)(err);
      groupChatID = info.threadID;
      doneHack();
    });
  });

  it('dapat magpadala ng text message object (grupo)', function (done){
    var body = "text-msg-obj-" + Date.now();
    listen(done, msg =>
      msg.type === 'message' &&
      msg.body === body &&
      msg.isGroup === true
    );
    api.sendMessage({body: body}, groupChatID, function(err, info){
      checkErr(done)(err);
      assert(groupChatID === info.threadID);
    });
  });

  it('dapat magpadala ng pangunahing string (grupo)', function (done){
    var body = "basic-str-" + Date.now();
    listen(done, msg =>
      msg.type === 'message' &&
      msg.body === body &&
      msg.isGroup === true
    );
    api.sendMessage(body, groupChatID, function(err, info) {
      checkErr(done)(err);
      assert(groupChatID === info.threadID);
    });
  });

  it('dapat magpadala ng sticker message object (grupo)', function (done){
    var stickerID = '767334526626290';
    listen(done, function (msg) {
      return msg.type === 'message' &&
        msg.attachments.length > 0 &&
        msg.attachments[0].type === 'sticker' &&
        msg.attachments[0].stickerID === stickerID;
    });
    api.sendMessage({sticker: stickerID}, groupChatID, function (err, info) {
      assert(groupChatID === info.threadID);
      checkErr(done)(err);
    });
  });

  it('dapat magpadala ng kalakip na may katawan (grupo)', function (done){
    var body = "attach-" + Date.now();
    var attach = [];
    attach.push(fs.createReadStream("test/data/test.txt"));
    attach.push(fs.createReadStream("test/data/test.png"));
    listen(done, function (msg) {
      return msg.type === 'message' && msg.body === body;
    });
    api.sendMessage({attachment: attach, body: body}, groupChatID, function(err, info){
      checkErr(done)(err);
      assert(groupChatID === info.threadID);
    });
  });

  it('dapat makuha ang kasaysayan ng chat (grupo)', function (done) {
    api.getThreadHistory(groupChatID, 5, null, function(err, data) {
      checkErr(done)(err);
      assert(getType(data) === "Array");
      assert(data.every(function(v) {return getType(v) == "Object";}));
      done();
    });
  });
  
  it('dapat makuha ang kasaysayan ng chat (grupo) (graphql)', function (done) {
    api.getThreadHistoryGraphQL(groupChatID, 5, null, function(err, data) {
      checkErr(done)(err);
      assert(getType(data) === "Array");
      assert(data.every(function(v) {return getType(v) == "Object";}));
      done();
    });
  });


  it('dapat baguhin ang pamagat ng chat', function (done){
    var title = 'test-chat-title-' + Date.now();
    listen(done, function (msg) {
      return msg.type === 'event' &&
        msg.logMessageType === 'log:thread-name' &&
        msg.logMessageData.name === title;
    });
    groupChatName = title;
    api.setTitle(title, groupChatID, checkErr(done));
  });

  it('dapat kick user', function (done) {
    var id = userIDs[0];
    listen(done, function (msg) {
      return msg.type === 'event' &&
        msg.logMessageType === 'log:unsubscribe' &&
        msg.logMessageData.leftParticipantFbId === id;
    });
    api.removeUserFromGroup(id, groupChatID, checkErr(done));
  });

  it('dapat add user', function (done) {
    var id = userIDs[0];
    listen(done, function (msg) {
      return (msg.type === 'event' &&
        msg.logMessageType === 'log:subscribe' &&
        msg.logMessageData.addedParticipants.length > 0 &&
        msg.logMessageData.addedParticipants[0].userFbId === id);
    });
    // TODO: hindi namin tinitingnan ang mga error sa loob nito dahil nagbago ang FB at
    // nagbabalik ng isang error, kahit na natatanggap namin ang kaganapan na ang user ay
    // idinagdag
    api.addUserToGroup(id, groupChatID, function() {});
  });

  xit('dapat makakuha ng impormasyon sa thread (grupo)', function (done){
      api.getThreadInfo(groupChatID, (err, info) => {
        if (err) done(err);

        assert(info.participantIDs != null && info.participantIDs.length > 0);
        assert(!info.participantIDs.some(isNaN));
        assert(!info.participantIDs.some(v => v.length == 0));
        assert(info.name != null);
        assert(info.messageCount != null && !isNaN(info.messageCount));
        assert(info.hasOwnProperty('emoji'));
        assert(info.hasOwnProperty('nicknames'));
        assert(info.hasOwnProperty('color'));
        done();
      });
  });

  it('dapat kunin ang isang listahan ng mga thread', function (done) {
    api.getThreadList(0, 20, function(err, res) {
      checkErr(done)(err);

      // This checks to see if the group chat we just made
      // is in the list... it should be.
      assert(res.some(function (v) {
        return (
          v.threadID === groupChatID &&
          userIDs.every(function (val) {
            return v.participants.indexOf(val) > -1;
          }) &&
          v.name === groupChatName
        );
      }));
      done();
    });
  });

  it('dapat markahan bilang nabasa', function (done){
    api.markAsRead(groupChatID, done);
  });

  it('dapat magpadala ng tagapagpahiwatig ng pagta-type', function (done) {
    var stopType = api.sendTypingIndicator(groupChatID, function(err) {
      checkErr(done)(err);
      stopType();
      done();
    });
  });


  it('dapat makuha ang tamang impormasyon ng user', function (done) {
    api.getUserInfo(userID, function(err, data) {
      checkErr(done)(err);
      var user = data[userID];
      assert(user.name);
      assert(user.firstName);
      assert(user.vanity !== null);
      assert(user.profileUrl);
      assert(user.gender);
      assert(user.type);
      assert(!user.isFriend);
      done();
    });
  });

  it('dapat makuha ang user ID', function(done) {
    api.getUserInfo(userIDs[0], function(err, data) {
      checkErr(done)(err);
      var user = data[userIDs[0]];
      api.getUserID(user.name, function(err, data) {
        checkErr(done)(err);
        assert(getType(data) === "Array");
        assert(data.some(function(val) {
          return val.userID === userIDs[0];
        }));
        done();
      });
    });
  });

  it('dapat makuha ang listahan ng mga kaibigan', function (done) {
    api.getFriendsList(function(err, data) {
      try {
      checkErr(done)(err);
      assert(getType(data) === "Array");
      data.map(v => {
        assert(getType(v.firstName) === "String");
        assert(getType(v.gender) === "String");
        assert(getType(v.userID) === "String");
        assert(getType(v.isFriend) === "Boolean");
        assert(getType(v.fullName) === "String");
        assert(getType(v.profilePicture) === "String");
        assert(getType(v.type) === "String");
        assert(v.hasOwnProperty("profileUrl"));  // This can be null if the account is disabled
        assert(getType(v.isBirthday) === "Boolean");
      })
      done();
    } catch(e){
      done(e);
    }
    });
  });

  it('dapat i-parse nang tama ang share attachment', function () {
    var formatted = formatDeltaMessage(shareAttachmentFixture);
    assert(formatted.attachments[0].type === "share");
    assert(formatted.attachments[0].title === "search engines");
    assert(formatted.attachments[0].target.items[0].name === "search engines");
    assert(formatted.attachments[0].target.items[0].call_to_actions.length === 3);
    assert(formatted.attachments[0].target.items[0].call_to_actions[0].title === "Google");
  });

  it('dapat mag log out', function (done) {
    api.logout(done);
  });

  after(function (){
    if (stopListening) stopListening();
  });
});
