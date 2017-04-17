/**
 * Created by ken.li on 4/7/17.
 */
const RingCentral = require('ringcentral');
const querystring = require('querystring');
const http = require('http');
const fs = require('fs');
const moment = require('moment');
const GlipClient = require('glip-client');

// class ReportSDK {
//   constructor () {
//     this.rcSDK = new RingCentral.SDK({
//       server: RingCentral.SDK.server.production,
//       appKey: process.env.HUBOT_GLIP_APP_KEY,
//       appSecret: process.env.HUBOT_GLIP_APP_SECRET
//     });
//
//     this.platform = rcSDK.platform();
//
//     this.platform.login({
//       username: process.env.HUBOT_GLIP_USERNAME,
//       extension: process.env.HUBOT_GLIP_EXTENSION_ID,
//       password: process.env.HUBOT_GLIP_PASSWORD
//     }).then(function(response) {
//
//     }).catch(function(error) {
//       console.error(error)
//     });
//   }
//
//   getAccountInfo() {
//
//   }
// }

class GlipAdaptor {
    constructor () {
        this.client = new GlipClient({
            server: process.env.HUBOT_GLIP_SERVER || 'https://platform.ringcentral.com',
            appKey: process.env.HUBOT_GLIP_APP_KEY,
            appSecret: process.env.HUBOT_GLIP_APP_SECRET,
            appName: 'Glip Chatbot',
            appVersion: '1.0.0'
        })
    }

    login () {
        this.client.authorize({
            username: process.env.HUBOT_GLIP_USERNAME,
            extension: '',
            password: process.env.HUBOT_GLIP_PASSWORD
        }).then((response) => {

        }).catch((error) => {

        })
    }

    getUser (id) {
        return this.client.persons.get(id);
    }
}



module.exports = (robot) => {


    robot.hear(/[Qq]{1}ueue calls did (.*) receive (.*)$/, (res) => {
        queueName = res.match[1];
        dateRange = res.match[2];
        console.log(queueName);
        console.log(dateRange);

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
                const accountId = 129508020;

                if(queueName.toLowerCase() == 'i') {
                    userName = person.firstName + ' ' + person.lastName;
                } else {
                    userName = queueName
                }

                let postData = querystring.stringify({
                    'queues[]': [userName]
                });

                const options = {
                    hostname:'localhost',
                    port: 80,
                    path: '/d3_rebot/public/api/index.php?r=rebotqueue/queueCalls'+
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
                            console.log(rawData)
                            let parsedData = JSON.parse(rawData);
                            console.log(rawData);
                            if(parsedData.total == 0) {
                                res.send('Can\'t find any record.');
                            } else {
                                if(queueName.toLowerCase() == 'i') {
                                    res.send('You made ' + parsedData.rows[0].totalCalls + ' calls ' + dateRange + '.');
                                } else {
                                    res.send(parsedData.rows[0].queueName + ' received ' + parsedData.rows[0].totalCalls + ' calls ' + dateRange + ', answered calls: ' + parsedData.rows[0].answeredCalls + ', missed calls: ' + parsedData.rows[0].missedCalls  );
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

//missed
    robot.hear(/[Qq]{1}ueue calls that (.*) missed (.*)$/, (res) => {
        queueName = res.match[1];
        dateRange = res.match[2];
        console.log(queueName);
        console.log(dateRange);

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

                if(queueName.toLowerCase() == 'i') {
                    userName = person.firstName + ' ' + person.lastName;
                } else {
                    userName = queueName
                }

                let postData = querystring.stringify({
                    'queues[]': [userName]
                });

                const options = {
                    hostname:'localhost',
                    port: 80,
                    path: '/d3_rebot/public/api/index.php?r=rebotqueue/queueCalls'+
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
                            console.log(rawData)
                            let parsedData = JSON.parse(rawData);
                            console.log(rawData);
                            if(parsedData.total == 0) {
                                res.send('Can\'t find any record.');
                            } else {
                                if(queueName.toLowerCase() == 'i') {
                                    res.send('You made ' + parsedData.rows[0].totalCalls + ' calls ' + dateRange + '.');
                                } else {
                                    res.send(parsedData.rows[0].queueName + ' missed ' + parsedData.rows[0].missedCalls + ' calls ' + dateRange );
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


    // answered
    robot.hear(/[Qq]{1}ueue calls that (.*) answered (.*)$/, (res) => {
        queueName = res.match[1];
        dateRange = res.match[2];
        console.log(queueName);
        console.log(dateRange);

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
                const accountId = 129508020;

                if(queueName.toLowerCase() == 'i') {
                    userName = person.firstName + ' ' + person.lastName;
                } else {
                    userName = queueName
                }

                let postData = querystring.stringify({
                    'queues[]': [userName]
                });

                const options = {
                    hostname:'localhost',
                    port: 80,
                    path: '/d3_rebot/public/api/index.php?r=rebotqueue/queueCalls'+
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
                            console.log(rawData)
                            let parsedData = JSON.parse(rawData);
                            console.log(rawData);
                            if(parsedData.total == 0) {
                                res.send('Can\'t find any record.');
                            } else {
                                if(queueName.toLowerCase() == 'i') {
                                    res.send('You made ' + parsedData.rows[0].totalCalls + ' calls ' + dateRange + '.');
                                } else {
                                    res.send(parsedData.rows[0].queueName + ' answered ' + parsedData.rows[0].answeredCalls + ' calls ' + dateRange );
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




    robot.hear(/[Ll]{1}ist queues (.*)$/, (res) => {

        dateRange = res.match[1] ?res.match[1] : "last week";

        console.log(dateRange);

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
                const accountId = 129508020;




                const options = {
                    hostname:'localhost',
                    port: 80,
                    path: '/d3_rebot/public/api/index.php?r=rebotqueue/list'+
                    '&accountId=' + accountId +
                    '&mailboxId=' + res.envelope.user.id +
                    '&dateFrom=' + startDate + '&dateTo=' + endDate,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                };

                var req = http.request(options, (response) => {
                    response.setEncoding('utf8');
                    let rawData = '';
                    response.on('data', (chunk) => rawData += chunk);
                    response.on('end', () => {
                        try {
                            console.log(rawData)
                            let parsedData = JSON.parse(rawData);
                            console.log(rawData);

                            res.send(' you have ' + parsedData);

                        } catch (e) {
                            console.log(e.message);
                        }
                    });
                });
                req.on('error', (e) => {
                    console.log(`problem with request: ${e.message}`);
                });

                req.end();
            });
        });
    });

    //overview

    robot.hear(/[Oo]{1}verview for (.*)$/, (res) => {

        dateRange = res.match[1] ?res.match[1] : "last week";

        console.log(dateRange);

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
                const accountId = 129508020;




                const options = {
                    hostname:'localhost',
                    port: 80,
                    path: '/d3_rebot/public/api/index.php?r=rebotqueue/queueCallsSummary'+
                    '&accountId=' + accountId +
                    '&mailboxId=' + res.envelope.user.id +
                    '&dateFrom=' + startDate + '&dateTo=' + endDate,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                };

                var req = http.request(options, (response) => {
                    response.setEncoding('utf8');
                    let rawData = '';
                    response.on('data', (chunk) => rawData += chunk);
                    response.on('end', () => {
                        try {
                            console.log(rawData)
                            let parsedData = JSON.parse(rawData);
                            console.log('parsedata is ' , parsedData);

                            res.send('During ' + dateRange + 'your account\'s queue summary is: ' + ' total calls: ' + parsedData.totalCalls + 'answered calls: ' + parsedData.answeredCalls + 'missed calls: ' +  parsedData.missedCalls + 'Average Time To Answer: ' + parsedData.avgTimeToAnswer + 'Average call duration: ' + parsedData.avgCallDuration);


                        } catch (e) {
                            console.log(e.message);
                        }
                    });
                });
                req.on('error', (e) => {
                    console.log(`problem with request: ${e.message}`);
                });

                req.end();
            });
        });
    });


    //call length
    robot.hear(/[Ll]{1}ength range for (.*)$/, (res) => {

        dateRange = res.match[1] ?res.match[1] : "last week";

        console.log(dateRange);

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
                const accountId = 129508020;




                const options = {
                    hostname:'localhost',
                    port: 80,
                    path: '/d3_rebot/public/api/index.php?r=rebotqueue/callLengthRange'+
                    '&accountId=' + accountId +
                    '&mailboxId=' + res.envelope.user.id +
                    '&dateFrom=' + startDate + '&dateTo=' + endDate,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                };

                var req = http.request(options, (response) => {
                    response.setEncoding('utf8');
                    let rawData = '';
                    response.on('data', (chunk) => rawData += chunk);
                    response.on('end', () => {
                        try {
                            let parsedData = JSON.parse(rawData);

                            console.log('parsed data is ', parsedData)

                            res.send('During ' + dateRange + 'your maximum length of your calls was: ' + parsedData.max + ' while the minimum length of your calls was ' + parsedData.min);


                        } catch (e) {
                            console.log(e.message);
                        }
                    });
                });
                req.on('error', (e) => {
                    console.log(`problem with request: ${e.message}`);
                });

                req.end();
            });
        });
    });

    //Ken call his wife

    robot.hear(/How many times did (.*) call (.*) at (.*)$/, (res) => {
        user = res.match[1];
        toName = res.match[2];
        dateRange = res.match[3];
        console.log(user);
        console.log(toName);
        console.log(dateRange);

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
                const accountId = 129508020;

                if(user.toLowerCase() == 'i') {
                    userName = person.firstName + ' ' + person.lastName;
                } else {
                    userName = user
                }

                let postData = querystring.stringify({
                    'users[]': [userName],
                    'tos':    [toName]
                });

                const options = {
                    hostname:'localhost',
                    port: 80,
                    path: '/d3_rebot/public/api/index.php?r=rebotqueue/rawCalls'+
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
                            console.log(rawData)
                            let parsedData = JSON.parse(rawData);
                            console.log(rawData);
                            if(parsedData.total == 0) {
                                res.send('Can\'t find any record.');
                            } else {
                                if(user.toLowerCase() == 'i') {
                                    res.send('You made ' + parsedData + ' calls to ' + toName + ' ' + dateRange + '.');
                                } else {
                                    res.send(user + ' made ' + parsedData + ' calls to ' + toName + ' ' + dateRange + '.'  );
                                    if (parsedData >= 10){
                                        res.send('Oh man, this must be ' + user + '\'s gf\'s number (evil laugh)')
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
