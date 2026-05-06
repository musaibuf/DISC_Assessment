const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// --- GOOGLE SHEETS SETUP ---
let auth;

if (process.env.GOOGLE_CREDENTIALS) {
    // 1. If on Render, parse the Environment Variable you just created
    auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
} else {
    // 2. If on your local laptop, use the physical file
    auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
}
const SPREADSHEET_ID = '1hQFMGiD7VCO1bEeJzZSPDSMnJqeYWhVAii2D-LS5stk'; // Replace with your Sheet ID

// --- EXACT SCORING KEY FROM YOUR IMAGE ---
// This maps { QuestionNumber: { UserAnswer: 'DISC_Trait' } }
const scoringKey = {
    1:  { B: 'D', D: 'I', A: 'S', C: 'C' },
    2:  { A: 'D', C: 'I', D: 'S', B: 'C' },
    3:  { C: 'D', B: 'I', A: 'S', D: 'C' },
    4:  { A: 'D', D: 'I', C: 'S', B: 'C' },
    5:  { D: 'D', B: 'I', C: 'S', A: 'C' },
    6:  { B: 'D', A: 'I', D: 'S', C: 'C' },
    7:  { C: 'D', D: 'I', B: 'S', A: 'C' },
    8:  { B: 'D', A: 'I', D: 'S', C: 'C' },
    9:  { D: 'D', A: 'I', C: 'S', B: 'C' },
    10: { C: 'D', B: 'I', D: 'S', A: 'C' },
    11: { A: 'D', D: 'I', C: 'S', B: 'C' },
    12: { D: 'D', C: 'I', A: 'S', B: 'C' },
    13: { B: 'D', A: 'I', D: 'S', C: 'C' },
    14: { C: 'D', D: 'I', B: 'S', A: 'C' },
    15: { D: 'D', A: 'I', C: 'S', B: 'C' },
    16: { A: 'D', B: 'I', C: 'S', D: 'C' },
    17: { B: 'D', C: 'I', D: 'S', A: 'C' },
    18: { C: 'D', A: 'I', B: 'S', D: 'C' },
    19: { D: 'D', B: 'I', C: 'S', A: 'C' },
    20: { A: 'D', D: 'I', C: 'S', B: 'C' },
    21: { A: 'D', B: 'I', C: 'S', D: 'C' },
    22: { D: 'D', C: 'I', B: 'S', A: 'C' },
    23: { D: 'D', B: 'I', A: 'S', C: 'C' },
    24: { D: 'D', C: 'I', A: 'S', B: 'C' }
};

// --- POST ENDPOINT ---
app.post('/api/submit', async (req, res) => {
    const { userInfo, answers } = req.body;

    try {
        console.log('Processing submission for:', userInfo.name);

        // 1. Initialize counts based on Traits, not raw letters
        let counts = { D: 0, I: 0, S: 0, C: 0 };
        const totalQuestions = 24;

        // 2. Loop through answers and apply the scoring key
        for (let i = 1; i <= totalQuestions; i++) {
            const userAnswer = answers[i]; // e.g., 'A', 'B', 'C', or 'D'
            
            if (userAnswer && scoringKey[i] && scoringKey[i][userAnswer]) {
                const trait = scoringKey[i][userAnswer]; // Finds if it's D, I, S, or C
                counts[trait]++;
            }
        }

        // 3. Convert counts to Percentages
        const rawD = parseFloat(((counts.D / totalQuestions) * 100).toFixed(1));
const rawI = parseFloat(((counts.I / totalQuestions) * 100).toFixed(1));
const rawS = parseFloat(((counts.S / totalQuestions) * 100).toFixed(1));
const rawC = parseFloat((100 - rawD - rawI - rawS).toFixed(1));

const percentD = rawD + '%';
const percentI = rawI + '%';
const percentS = rawS + '%';
const percentC = rawC + '%';

        // 4. Stringify all answers into a single JSON string for the sheet
        const answersJSON = JSON.stringify(answers);

        // 5. Prepare row data for Google Sheets
        const rowData = [
            new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }), // Timestamp
            userInfo.name,      // Full Name
            userInfo.cnic,      // CNIC
            percentD,           // Dominance %
            percentI,           // Influence %
            percentS,           // Steadiness %
            percentC,           // Compliance %
            answersJSON         // All answers in one cell {"1":"B","2":"A",...}
        ];

        // 6. Connect to Google Sheets & Append Row
        const sheets = google.sheets({ version: 'v4', auth });
        
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A:H', 
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [rowData],
            },
        });

        console.log('✅ Successfully calculated and saved to Google Sheets!');
        res.status(200).json({ message: 'Assessment submitted successfully!' });

    } catch (error) {
        console.error('❌ Error saving to Google Sheets:', error);
        res.status(500).json({ error: 'Failed to save assessment data.' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});