const RingCentral = require('ringcentral');
const querystring = require('querystring');
const http = require('http');
const fs = require('fs');
const moment = require('moment');
const GlipClient = require('glip-client');

module.exports = (robot) => {
  robot.respond(/send to group\s+(\d+)\s+([\s\S]+)\s+(\d+)\s+times$/, (res) => {
    const times = parseInt(res.match[3]);
    const envelope = {
      user: {
        reply_to: parseInt(res.match[1])
      }
    };
    for (let i = 0; i < times; i++) {
      robot.send(envelope, res.match[2].replace(/<n>/, i + 1))
    }
  });

  robot.respond(/group_id$/, (res) => {
    res.send(res.envelope.room)
  });

  robot.hear(/[Hh]{1}i [Rr]{1}ebot$/, (res) => {
    let gc = new GlipClient({
      server: process.env.HUBOT_GLIP_SERVER || 'https://platform.ringcentral.com',
      appKey: process.env.HUBOT_GLIP_APP_KEY,
      appSecret: process.env.HUBOT_GLIP_APP_SECRET,
      appName: 'Glip Chatbot',
      appVersion: '1.0.0'
    });

    gc.authorize({
      username: process.env.HUBOT_GLIP_USERNAME,
      extension: '',
      password: process.env.HUBOT_GLIP_PASSWORD
    }).then((response) => {
      gc.persons().get({
        'personId': res.envelope.user.id
      }).then((person) => {
        res.send('Hi ' + person.firstName + ', how can I help you?')
      });
    });
  });

  robot.respond(/[Hh]{1}ow many (calls|call|voicemail|voice mail|voicemails|voice mails) did (.*) (make|receive|answer|miss) (.*)$/, (res) => {
    callType = res.match[1];
    user = res.match[2];
    action = res.match[3];
    dateRange = res.match[4];
    console.log(callType);
    console.log(user);
    console.log(dateRange);
    console.log(action);

    if(dateRange.toLowerCase() == 'yesterday') {
      startDate = '-P1D';
      endDate = '-P0D';
    } else if(dateRange.toLowerCase() == 'last week'
        || dateRange.toLowerCase() == 'lastweek'
        || dateRange.toLowerCase() == 'past week'
    ) {
      startDate = '-P6D';
      endDate = '-P0D';
    } else if(dateRange.toLowerCase() == 'last month'
        || dateRange.toLowerCase() == 'lastmonth'
        || dateRange.toLowerCase() == 'past month'
    ) {
      startDate = '-P29D';
      endDate = '-P0D';
    }

    let gc = new GlipClient({
      server: process.env.HUBOT_GLIP_SERVER || 'https://platform.ringcentral.com',
      appKey: process.env.HUBOT_GLIP_APP_KEY,
      appSecret: process.env.HUBOT_GLIP_APP_SECRET,
      appName: 'Glip Chatbot',
      appVersion: '1.0.0'
    });

    gc.authorize({
      username: process.env.HUBOT_GLIP_USERNAME,
      extension: '',
      password: process.env.HUBOT_GLIP_PASSWORD
    }).then((response) => {
      gc.persons().get({
        'personId': res.envelope.user.id
      }).then((person) => {
        const accountId = process.env.COMPANY_ACCOUNT_ID;

        if(user.toLowerCase() == 'i') {
          userName = person.firstName + ' ' + person.lastName;
        } else {
          userName = user
        }

        let postData = querystring.stringify({
          'users[]': [userName]
        });

        const options = {
          hostname:'localhost',
          port: 80,
          path: '/d3_rebot/public/api/index.php?r=rebot/userCalls'+
          '&accountId=' + accountId +
          '&mailboxId=' + res.envelope.user.id +
          '&dateFrom=' + startDate + '&dateTo=' + endDate,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        var req = http.request(options, (response) => {
          response.setEncoding('utf8');
          let rawData = '';
          response.on('data', (chunk) => rawData += chunk);
          response.on('end', () => {
            try {
              let parsedData = JSON.parse(rawData);
              console.log(rawData);
              if(parsedData.total == 0) {
                res.send('Can\'t find any record.');
              } else {
                user = user.toLowerCase() == 'i' ? 'You' : parsedData.rows[0].mailbox;

                if(callType.toLowerCase().indexOf('call') != -1) {
                  if (action.toLowerCase() == 'make') {
                    res.send(user + ' made ' + parsedData.rows[0].outbound + ' calls ' + dateRange + '.');
                  } else if (action.toLowerCase() == 'receive') {
                    res.send(user + ' received ' + parsedData.rows[0].inbound + ' calls ' + dateRange
                        + ', answered: ' + parsedData.rows[0].answered
                        + ', missed: ' + parsedData.rows[0].missed
                        + ', voice mail: ' + parsedData.rows[0].voicemail + '.');
                  } else if (action.toLowerCase() == 'answer') {
                    res.send(user + ' answered ' + parsedData.rows[0].answered + ' calls');
                  } else if (action.toLowerCase() == 'miss') {
                    res.send(user + ' missed ' + parsedData.rows[0].missed + ' calls');
                  }
                } else if(callType.toLowerCase().indexOf('voicemail') != -1
                    || callType.toLowerCase().indexOf('voice mail')) {
                  if (action.toLowerCase() == 'make') {
                    res.send('Sorry, I don\'t have data of your voicemail calls.');
                  } else if (action.toLowerCase() == 'receive') {
                    res.send(user + ' received ' + parsedData.rows[0].voicemail + ' voicemails.');
                  }
                }
              }
            } catch (e) {
              console.log(e.message);
            }
          });
        });
        req.on('error', (e) => {
          console.log(`problem with request: ${e.message}`);
        });
        req.write(postData);
        req.end();
      });
    });
  });

  robot.respond(/(calls|call|voicemail|voice mail|voicemails|voice mails) (.*) (ma[kd]+e|receive[d]*|answer[ed]*|miss[ed]*) (.*)$/, (res) => {
    callType = res.match[1];
    user = res.match[2];
    action = res.match[3];
    dateRange = res.match[4];
    console.log(callType);
    console.log(user);
    console.log(dateRange);
    console.log(action);

    if(dateRange.toLowerCase() == 'yesterday') {
      startDate = '-P1D';
      endDate = '-P0D';
    } else if(dateRange.toLowerCase() == 'last week'
        || dateRange.toLowerCase() == 'lastweek'
        || dateRange.toLowerCase() == 'past week'
    ) {
      startDate = '-P6D';
      endDate = '-P0D';
    } else if(dateRange.toLowerCase() == 'last month'
        || dateRange.toLowerCase() == 'lastmonth'
        || dateRange.toLowerCase() == 'past month'
    ) {
      startDate = '-P29D';
      endDate = '-P0D';
    }

    let gc = new GlipClient({
      server: process.env.HUBOT_GLIP_SERVER || 'https://platform.ringcentral.com',
      appKey: process.env.HUBOT_GLIP_APP_KEY,
      appSecret: process.env.HUBOT_GLIP_APP_SECRET,
      appName: 'Glip Chatbot',
      appVersion: '1.0.0'
    });

    gc.authorize({
      username: process.env.HUBOT_GLIP_USERNAME,
      extension: '',
      password: process.env.HUBOT_GLIP_PASSWORD
    }).then((response) => {
      gc.persons().get({
        'personId': res.envelope.user.id
      }).then((person) => {
        const accountId = 37439510;

        if(user.toLowerCase() == 'i') {
          userName = person.firstName + ' ' + person.lastName;
        } else {
          userName = user
        }

        let postData = querystring.stringify({
          'users[]': [userName]
        });

        const options = {
          hostname:'localhost',
          port: 80,
          path: '/d3_rebot/public/api/index.php?r=rebot/userCalls'+
          '&accountId=' + accountId +
          '&mailboxId=' + res.envelope.user.id +
          '&dateFrom=' + startDate + '&dateTo=' + endDate,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        var req = http.request(options, (response) => {
          response.setEncoding('utf8');
          let rawData = '';
          response.on('data', (chunk) => rawData += chunk);
          response.on('end', () => {
            try {
              let parsedData = JSON.parse(rawData);
              console.log(rawData);
              if(parsedData.total == 0) {
                res.send('Can\'t find any record.');
              } else {
                user = user.toLowerCase() == 'i' ? 'You' : parsedData.rows[0].mailbox;

                if(callType.toLowerCase().indexOf('call') != -1) {
                  if (action.toLowerCase() == 'make' || action.toLowerCase() == 'made' ) {
                    res.send(user + ' made ' + parsedData.rows[0].outbound + ' calls ' + dateRange + '.');
                  } else if (action.toLowerCase() == 'receive' || action.toLowerCase() == 'received') {
                    res.send(user + ' received ' + parsedData.rows[0].inbound + ' calls ' + dateRange
                        + ', answered: ' + parsedData.rows[0].answered
                        + ', missed: ' + parsedData.rows[0].missed
                        + ', voice mail: ' + parsedData.rows[0].voicemail + '.');
                  } else if (action.toLowerCase() == 'answer' || action.toLowerCase() == 'answered') {
                    res.send(user + ' answered ' + parsedData.rows[0].answered + ' calls');
                  } else if (action.toLowerCase() == 'miss' || action.toLowerCase() == 'missed') {
                    res.send(user + ' missed ' + parsedData.rows[0].missed + ' calls');
                  }
                } else if(callType.toLowerCase().indexOf('voicemail') != -1
                    || callType.toLowerCase().indexOf('voice mail')) {
                  if (action.toLowerCase() == 'receive' || action.toLowerCase() == 'received') {
                    res.send(user + ' received ' + parsedData.rows[0].voicemail + ' voicemails.');
                  } else {
                    res.send('Sorry, query not supported.');
                  }
                }
              }
            } catch (e) {
              console.log(e.message);
            }
          });
        });
        req.on('error', (e) => {
          console.log(`problem with request: ${e.message}`);
        });
        req.write(postData);
        req.end();
      });
    });
  });
};
