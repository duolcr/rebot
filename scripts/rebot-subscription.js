const RingCentral = require('ringcentral');
const querystring = require('querystring');
const http = require('http');
const fs = require('fs');
const moment = require('moment');
const GlipClient = require('glip-client');


module.exports = (robot) => {
    robot.respond(/subscribe$/, (res) => {
        const extensionId = res.envelope.user.id;
        const subscriber = robot.brain.get(extensionId);
        if(subscriber == null) {
            robot.brain.set(extensionId, {
                step: 'enter name',
                subscription: {}
            });
            res.send('Please enter the subscription name:');
        } else {
            subscriber.step = 'start new';
            robot.brain.set(extensionId, subscriber);
            res.send('You can only create one subscription at the same time. Would you like to start a new one? [Y]es/[N]o');
        }
    });

    robot.hear(/(.*)$/, (res) => {
        const extensionId = res.envelope.user.id;
        input = res.match[1];
        subscriber = robot.brain.get(extensionId);

        console.log('Index of Rebot: '+input.indexOf('Rebot '));
        console.log('Input: ' + input);
        console.log('Subscriber: ' + subscriber);

        if(subscriber != null && (input.indexOf('Rebot ') != 0)) {
            if(subscriber.step == 'enter name') {
                subscriber.subscription.name = input;
                subscriber.step = 'enter frequency';
                robot.brain.set(extensionId, subscriber);
                res.send('How ofen would you like to receive the report? [D]aily/[W]eekly/[M]onthly');
            } else if(subscriber.step == 'enter frequency') {
                subscriber.subscription.recurrence = {};
                if(input.match(/[Dd]{1}[aily]{0,1}/)) {
                    subscriber.subscription.recurrence.pattern = 'Daily';
                    subscriber.subscription.recurrence.value = 0;
                    subscriber.step = 'enter view';
                    robot.brain.set(extensionId, subscriber);
                    res.send('Which view would you like to subscribe?' +
                        '\n Available views:' +
                        '\nDefault' +
                        '\nSales' +
                        '\nMarketing' +
                        '\nComms');
                } else if(input.match(/[Ww]{1}[eekly]{0,1}/)) {
                    subscriber.subscription.recurrence.pattern = 'Weekly';
                    subscriber.step = 'enter week day';
                    robot.brain.set(extensionId, subscriber);
                    res.send('Please enter weekday you like to receive the report: [Sun]day/[Mon]day/[Tue]sday/[Wed]nesday/[Thu]rsday/[Fri]day/[Sat]urday');
                } else if(input.match(/[Mm]{1}[onthly]{0,1}/)) {
                    subscriber.subscription.recurrence.pattern = 'Monthly';
                    subscriber.step = 'enter month day';
                    robot.brain.set(extensionId, subscriber);
                    res.send('Please enter the day you like to receive the report: 1-28/last day');
                } else {
                    res.send('Invalid input. Please try again.');
                }
            } else if(subscriber.step == 'enter week day') {

            } else if(subscriber.step == 'enter month day') {

            } else if(subscriber.step == 'enter view') {
                const views = ['','Default','Sales','Marketing','Comms'];
                if(input.match(/[0-9]{1}$/)) {
                    subscriber.subscription.view = views[input];
                } else {
                    subscriber.subscription.view = input;
                }
                subscriber.subscription.view = input;
                subscriber.step = 'enter tab';
                robot.brain.set(extensionId, subscriber);
                res.send('Which Tab would you like to subscribe? [S]ummary/[Q]ueue Activity/[U]ser Activity');
            } else if(subscriber.step == 'enter tab') {
                if(input.match(/[Ss]{1}(ummary)*/)) {
                    subscriber.subscription.tab = 'Summary';
                } else if(input.match(/[Qq]{1}(ueue Activity)*/)) {
                    subscriber.subscription.tab = 'Queue Activity';
                } else if(input.match(/[Uu]{1}(ser Activity)*/)) {
                    subscriber.subscription.tab = 'User Activity';
                }

                subscriber.step = 'enter file type';
                robot.brain.set(extensionId, subscriber);
                res.send('Please select file type you like to receive: PDF/Excel');
            } else if(subscriber.step == 'enter file type') {
                if(input.toLowerCase() == 'pdf') {
                    subscriber.subscription.fileType = 'PDF';
                }

                subscriber.step = 'enter recipients';
                robot.brain.set(extensionId, subscriber);
                res.send('Please enter the email addresses could receive the report:');
            } else if(subscriber.step == 'enter recipients') {

                subscriber.subscription.recipients = input;

                subscriber.step = 'final confirm';
                robot.brain.set(extensionId, subscriber);
                res.send('Name: ' + subscriber.subscription.name
                    + '\nRecurrence: ' + subscriber.subscription.recurrence.pattern
                    + '\nReport: ' + subscriber.subscription.view + '-' + subscriber.subscription.tab
                    + '\nFile type: ' + subscriber.subscription.fileType
                    + '\nRecipients: ' + subscriber.subscription.recipients
                    + '\nPlease confirm your subscription.[Y]es/[N]o');
            } else if(subscriber.step == 'final confirm') {
                subscriber.step = 'saved';
                robot.brain.set(extensionId, null);
                res.send('Your subscription has been created.');
            } else if(subscriber.step == 'start new') {
                if(input.toLowerCase() == 'y' || input.toLowerCase() == 'yes') {
                    robot.brain.set(extensionId, {
                        step: 'enter subscription name',
                        subscription: {}
                    });
                    res.send('Please enter the subscription name:');
                } else if(input.toLowerCase() == 'n' || input.toLowerCase() == 'no') {
                    res.send(subscriber.say(subscriber.step));
                } else {
                    res.send('Invalid input. Please try again.');
                }
            }
        }
    });
};
