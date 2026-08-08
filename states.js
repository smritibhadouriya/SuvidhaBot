// India ke saare 28 राज्य + 8 केंद्र शासित प्रदेश.
// `value` wahi string hai jo database ke schemes.applicable_state se match hoti hai.
const STATES = [
  { value: 'Andhra Pradesh', hindi: 'आंध्र प्रदेश' },
  { value: 'Arunachal Pradesh', hindi: 'अरुणाचल प्रदेश' },
  { value: 'Assam', hindi: 'असम' },
  { value: 'Bihar', hindi: 'बिहार' },
  { value: 'Chhattisgarh', hindi: 'छत्तीसगढ़' },
  { value: 'Goa', hindi: 'गोवा' },
  { value: 'Gujarat', hindi: 'गुजरात' },
  { value: 'Haryana', hindi: 'हरियाणा' },
  { value: 'Himachal Pradesh', hindi: 'हिमाचल प्रदेश' },
  { value: 'Jharkhand', hindi: 'झारखंड' },
  { value: 'Karnataka', hindi: 'कर्नाटक' },
  { value: 'Kerala', hindi: 'केरल' },
  { value: 'Madhya Pradesh', hindi: 'मध्य प्रदेश' },
  { value: 'Maharashtra', hindi: 'महाराष्ट्र' },
  { value: 'Manipur', hindi: 'मणिपुर' },
  { value: 'Meghalaya', hindi: 'मेघालय' },
  { value: 'Mizoram', hindi: 'मिजोरम' },
  { value: 'Nagaland', hindi: 'नागालैंड' },
  { value: 'Odisha', hindi: 'ओडिशा' },
  { value: 'Punjab', hindi: 'पंजाब' },
  { value: 'Rajasthan', hindi: 'राजस्थान' },
  { value: 'Sikkim', hindi: 'सिक्किम' },
  { value: 'Tamil Nadu', hindi: 'तमिलनाडु' },
  { value: 'Telangana', hindi: 'तेलंगाना' },
  { value: 'Tripura', hindi: 'त्रिपुरा' },
  { value: 'Uttar Pradesh', hindi: 'उत्तर प्रदेश' },
  { value: 'Uttarakhand', hindi: 'उत्तराखंड' },
  { value: 'West Bengal', hindi: 'पश्चिम बंगाल' },
  { value: 'Andaman and Nicobar Islands', hindi: 'अंडमान और निकोबार' },
  { value: 'Chandigarh', hindi: 'चंडीगढ़' },
  { value: 'Dadra and Nagar Haveli and Daman and Diu', hindi: 'दादरा नगर हवेली और दमन दीव' },
  { value: 'Delhi', hindi: 'दिल्ली' },
  { value: 'Jammu and Kashmir', hindi: 'जम्मू और कश्मीर' },
  { value: 'Ladakh', hindi: 'लद्दाख' },
  { value: 'Lakshadweep', hindi: 'लक्षद्वीप' },
  { value: 'Puducherry', hindi: 'पुडुचेरी' }
];

// Dropdown jaisa numbered menu — WhatsApp par yahi sabse aasaan hai.
function buildStatePrompt(lang) {
  const header = lang === 'hindi'
    ? 'आप कौनसे राज्य में रहते हैं? नीचे की सूची में से नंबर भेजें:\n'
    : 'Which state/UT do you live in? Send the number from the list below:\n';

  const lines = STATES.map((s, i) => {
    const n = i + 1;
    return lang === 'hindi' ? `${n}. ${s.hindi}` : `${n}. ${s.value}`;
  });

  return header + lines.join('\n');
}

// questions.js ke `options` format mein: key = DB value, values = accepted inputs
function buildStateOptions() {
  const options = {};
  STATES.forEach((s, i) => {
    options[s.value] = [
      String(i + 1),
      s.value.toLowerCase(),
      s.hindi
    ];
  });
  return options;
}

module.exports = { STATES, buildStatePrompt, buildStateOptions };
