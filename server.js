import OpenAI from "openai";
import 'dotenv/config';
import express from 'express';
import ExpressWs from 'express-ws';
import printRecipt from './printer-function.js';

import twilio from 'twilio';
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
ExpressWs(app);

const PORT = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


app.ws('/connection', (ws) => {
    try {
        /////////// Function declaration zone ///////////
        async function printRecipe(data) {
            // console.log("something will now print")
            let a = data.split("Based on your answers I recommend");
            let b = a[1].split("please head")[0].trim()
            printRecipt(b)
        }
        ///////////////////////////////////////////////////////
        let thread1;

        ws.on('message', async data => { // Incoming message from CR
            const msg = JSON.parse(data);
            console.log("Incoming orcestration: ", msg);

            if (msg.type === "setup") {
                const thread = await openai.beta.threads.create();
                ws.threadId = thread.id;
                thread1 = thread.id;

                const run = openai.beta.threads.runs.stream(ws.threadId, {
                    assistant_id: process.env.ASSISTANT_ID
                })

                run.on('textDone', async (textDone, snapshot) => {
                    // Send response from OpenAI model to Conversation Relay to be read back to the caller
                    console.log("textdone: ", textDone)

                    ws.send(
                        JSON.stringify({
                            type: "text",
                            token: textDone.value
                        })
                    );
                });

            } else if (msg.type === "prompt") {
                // Add their question to the thread with the role "user"
                await openai.beta.threads.messages.create(ws.threadId, {
                    role: "user",
                    content: msg.voicePrompt
                });

                const run = openai.beta.threads.runs.stream(ws.threadId, {
                    assistant_id: process.env.ASSISTANT_ID
                })

                run.on('textDone', async (textDone, snapshot) => {
                    // Send response from OpenAI model to Conversation Relay to be read back to the caller

                    console.log(textDone)

                    await ws.send(
                        JSON.stringify({
                            type: "text",
                            token: textDone.value
                        })
                    )
                    if (textDone.value.includes("Based on your answers")) {
                        printRecipe(textDone.value);
                    }
                })

            }
        });

        ws.on("close", async () => {
            await openai.beta.threads.del(thread1);// deelte the thread
            console.log("WebSocket connection closed and OpenAI thread deleted");
        });

    } catch (err) {
        console.error("ERROR: ", err);
    }
});




app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});