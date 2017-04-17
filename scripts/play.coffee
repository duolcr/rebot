module.exports = (robot) ->
  robot.respond /why don't you introduce yourself/i, (msg) ->
    msg.send "Hi, my name is Wall-E"
  robot.respond /What are you capable of?/i,  (msg) ->
    msg.send "I can do a lot of things..."
    msg.send "I can check your D3 Call report, including Phone number, total calls, missed calls etc."
    msg.send "I check your Jira ticket, and send you information and i can help you search ticket, and i can remember your search"
  robot.respond /Show me how to use/i,  (msg) ->
    msg.send "Check CFA Users calls: "
    msg.send "How many calls did XX made XX-time"
    msg.send "Check CFA Queue calls: "
    msg.send "How many queue calls did XX made XX-time"
  robot.respond /Jira command/i,  (msg) ->
    msg.send "show watchers for Issue Key"
    msg.send "search for JQL"



#   hubot show watchers for <Issue Key> - Shows watchers for the given JIRA issue
#   hubot search for <JQL> - Search JIRA with JQL
#   hubot save filter <JQL> as <name> - Save JIRA JQL query as filter in the brain
#   hubot use filter <name> - Use a JIRA filter from the brain
#   hubot show filter(s) - Show all JIRA filters
#   hubot show filter <name> - Show a specific JIRA filter