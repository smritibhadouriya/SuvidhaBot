require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const pool = require('./db');
const findMatchingSchemes = require('./matching');
const processUserInput = require('./sessionManager');
const questions = require('./questions');
const { formatScheme, T } = require('./formatter');

const app = express();
app.use(express.urlencoded({ extended: false }));

const userSessions = {};

// Twilio ek TwiML response mein max 10 <Message> bhejta hai — 1 header + 9 schemes
const MAX_SCHEMES_PER_REPLY = 9;

app.post('/webhook', async (req, res) => {
  try {
    const incomingMessage = req.body.Body.trim();
    const senderNumber = req.body.From;

    console.log('Incoming:', incomingMessage, 'From:', senderNumber);

    const twiml = new twilio.twiml.MessagingResponse();

    // Restart command
    if (incomingMessage.toLowerCase() === 'restart') {
      userSessions[senderNumber] = { step: 'language' };
      twiml.message(questions.language.prompt.hindi);
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      return res.end(twiml.toString());
    }

    // Get or create session
    if (!userSessions[senderNumber]) {
      userSessions[senderNumber] = { step: 'language' };
    }

    const session = userSessions[senderNumber];

    // First message ever - show language options
    if (session.step === 'language' && !session.language) {
      const result = processUserInput(session, incomingMessage);
      if (!result.success) {
        // Pehli baar hai, invalid nahi - seedha language prompt dikhao
        twiml.message(questions.language.prompt.hindi);
      } else if (result.completed) {
        // Language ke baad turant done nahi hoga, so yeh case nahi aayega
      } else {
        twiml.message(result.message);
      }
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      return res.end(twiml.toString());
    }

    // Process input using session manager
    const result = processUserInput(session, incomingMessage);

    if (!result.success) {
      twiml.message(result.message);
    } else if (result.completed) {
      // Saare questions complete - database mein save karo
      await pool.query(
        `INSERT INTO users (
          whatsapp_number, language, age, gender, category, 
          occupation, education_level, annual_income, state, 
          disability_status, marital_status, family_size, 
          ration_card_type, religion
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (whatsapp_number) 
        DO UPDATE SET 
          language = $2, age = $3, gender = $4, category = $5,
          occupation = $6, education_level = $7, annual_income = $8, state = $9,
          disability_status = $10, marital_status = $11, family_size = $12,
          ration_card_type = $13, religion = $14`,
        [
          senderNumber, session.language, session.age, session.gender, session.category,
          session.occupation, session.education || null, session.income, session.state,
          session.disability, session.marital_status, session.family_size || null,
          session.ration_card, session.religion
        ]
      );

      // Matching schemes dhundo — sabse zyada match wali sabse upar
      const matches = await findMatchingSchemes(session);
      const lang = session.language === 'english' ? 'english' : 'hindi';
      const t = T[lang];

      if (matches.length === 0) {
        twiml.message(t.none);
      } else {
        // Har scheme alag message mein — ek message ki 1600 char limit hai
        const shown = matches.slice(0, MAX_SCHEMES_PER_REPLY);

        let header = t.header(matches.length);
        if (matches.length > shown.length) {
          header += `\n\n${t.truncated}`;
        }
        twiml.message(header);

        shown.forEach((match, index) => {
          let text = formatScheme(match, index, lang);
          if (index === shown.length - 1) {
            text += `\n\n─────\n${t.footer}`;
          }
          twiml.message(text);
        });
      }

      delete userSessions[senderNumber];
    } else {
      twiml.message(result.message);
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());

  } catch (error) {
    console.error('Webhook error:', error);
    // Session clear karo, warna user hamesha isi error pe atka rahega
    if (req.body && req.body.From) {
      delete userSessions[req.body.From];
    }
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message('Something went wrong. Please send "Hi" to try again.');
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});