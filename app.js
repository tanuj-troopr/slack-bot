require('dotenv').config({path: __dirname + '/.env'})
const express = require("express")
const axios = require("axios");
const eventsApi = require('@slack/events-api')
const { WebClient, LogLevel } = require("@slack/web-api");
const bodyParser = require('body-parser')
const createIssue = require('./create-issue.js');
// task_create
///shortcut

const app = express()


const PORT = process.env.PORT || 3000
const token = process.env.BOT_TOKEN
const slackEvents = eventsApi.createEventAdapter(process.env.SIGNING_SECRET)
app.use(bodyParser.urlencoded({ extended: false }))

const client = new WebClient(token, {
    logLevel: LogLevel.DEBUG
});

async function publishMessage(id, text) {
    try {
      const result = await client.chat.postMessage({
        token: token,
        channel: id,
        text: text
      });
      console.log(result);
    }
    catch (error) {
      console.error(error);
    }
  }

function openModel(trigger_id){

const view = JSON.stringify(
    {
        "title": {
            "type": "plain_text",
            "text": "Troopr Slack Bot"
        },
        "submit": {
            "type": "plain_text",
            "text": "Create Issue"
        },
        "blocks": [
            {
                "type": "input",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "title",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Write something"
                    }
                },
                "label": {
                    "type": "plain_text",
                    "text": "Issue Summary"
                }
            }
        ],
        "type": "modal"
    }
    );      
client.views.open({
    token: token, 
    view: view, 
    trigger_id: trigger_id, 
});
}

app.post('/test', async function (req, res) {
    if(req.body.text){
        const issueType = 'Task';
        const summary = req.body.text;
        const issueKey = await createIssue('TSP', issueType, summary, '');
        // publishMessage("C059JCKBLPP", "Hello :tada:");
        let data = {
            response_type: 'in_channel',
            text: 'New Issue generated ' + issueKey
        };
        res.send(data);    
    }
});

app.use(bodyParser.json());
app.post('/shortcut', async function (req, res) {
    
    console.log(req);
    const data = JSON.parse(req.body.payload);
    const type = data.type;
    const trigger_id = data.trigger_id;
    if(type == "shortcut" || type == "message_action"){
        openModel(trigger_id);
    } else if(type == "view_submission" ){
        const issueType = 'Task';
        const summary = "new issue from TVD";
        const issueKey = await createIssue('TSP', issueType, summary, '');
        const resMsg = "New Issue Created " + issueKey + ":tada:"
        publishMessage("C059JCKBLPP", resMsg);
        res.send({ "response_action": "clear" });
    }
    // const userData = {
    //     "text": "Oh hey, this is a fun message in a channel!",
    //     "response_type": "in_channel"   
    //   };

    // axios.post(JSON.parse(req.body.payload).response_url, userData).then((response) => {
    //     console.log(response.status, response.data.token);
    //   });

    // res.send('success');
});

// app.use('/', slackEvents.expressMiddleware())


app.post('/create_issue', async function (req, res) {
    // console.log("123?",req.body.issue.key, req.body.issue.fields.summary);
    const message = "New Issue created " + req.body.issue.key + " summary : " + req.body.issue.fields.summary;
    publishMessage("C059JCKBLPP", message);
});




// slackEvents.on("message", async(event) => {
//     if(!event.subtype && !event.bot_id){
//         const issueType = 'Task';
//         const summary = event.text;
//         const description = ''
    
//         // const issueKey = await createIssue('TSP', issueType, summary, description);
//         client.chat.postMessage({
//             token, 
//             channel: event.channel, 
//             thread_ts: event.ts, 
//             text: "HII"
//         })      
//     }
    
// })

app.listen(PORT, () => {
    console.log(`App listening at http://localhost:${PORT}`)
})