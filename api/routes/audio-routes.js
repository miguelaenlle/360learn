const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const { textToSpeech } = require('./azure-cognitiveservices-speech');
/**
 * Converts text to speech using Azure Cognitive Services and returns audio data as a Buffer.
 * @param {string} text - The text to convert to speech.
 * @param {string} subscriptionKey - Your Azure Speech API subscription key.
 * @param {string} region - The Azure region (e.g., "eastus").
 * @param {string} [voiceName="en-US-Jessa24kRUS"] - The voice name for speech synthesis.
 * @returns {Promise<Buffer>} - A promise that resolves with audio data.
 */
// function textToSpeechAzure(text, voiceName = "en-US-Jessa24kRUS") {
//     return new Promise((resolve, reject) => {
//       const options = {
//         hostname: `https://eastus.tts.speech.microsoft.com/cognitiveservices/v1`,
//         // path: '/cognitiveservices/v1',
//         method: 'POST',
//         headers: {
//           'Ocp-Apim-Subscription-Key': process.env.AZURE_COGNITIVE_SPEECH_SUBSCRIPTION_KEY,
//           'Content-Type': 'application/ssml+xml',
//           'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3', // adjust format if needed
//           'User-Agent': 'NodeJS'
//         }
//       };
  
//       const req = https.request(options, (res) => {
//         if (res.statusCode !== 200) {
//           reject(new Error(`HTTP error: ${res.statusCode}`));
//           return;
//         }
//         const data = [];
//         res.on('data', chunk => data.push(chunk));
//         res.on('end', () => resolve(Buffer.concat(data)));
//       });
  
//       req.on('error', (error) => reject(error));
  
//       // Construct SSML payload
//       const ssml = `<speak version='1.0' xml:lang='en-US'>
//                       <voice xml:lang='en-US' xml:gender='Female' name='${voiceName}'>
//                         ${text}
//                       </voice>
//                     </speak>`;
  
//       req.write(ssml);
//       req.end();
//     });
// }


  
const router = express.Router();

router.post('/text-to-speech', async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: "Missing 'text' in request body." });
    }

    try {
        const randomFileName = `${Math.random().toString(36).substring(7)}.mp3`;
        const audioStream = await textToSpeech(text, randomFileName);
        res.set({
            'Content-Type': 'audio/mpeg',
            'Transfer-Encoding': 'chunked'
        });
        audioStream.pipe(res);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: e.message });
    }
});

module.exports = router;