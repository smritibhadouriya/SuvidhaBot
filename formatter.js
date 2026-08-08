const { LABELS } = require('./matching');

// Twilio ki ek WhatsApp message ki limit 1600 characters hai
const MAX_MESSAGE_LENGTH = 1550;

const T = {
  hindi: {
    header: (n) => `आपके जवाबों के आधार पर ${n} योजनाएं मिलीं।\nसबसे ज़्यादा मैच वाली सबसे ऊपर है 👇`,
    none: 'माफ़ कीजिए, अभी कोई योजना नहीं मिली। बाद में फिर से कोशिश करें।',
    fully: 'पूरी तरह पात्र',
    partial: (passed, total) => `आंशिक मैच (${passed}/${total} शर्तें पूरी)`,
    matchedOn: 'आपसे मैच हुआ',
    notMet: 'ये शर्तें पूरी नहीं',
    about: 'योजना के बारे में',
    benefit: 'लाभ',
    ministry: 'मंत्रालय',
    level: 'स्तर',
    central: 'केंद्रीय योजना (पूरे भारत में)',
    stateLevel: (s) => `राज्य योजना (${s})`,
    deadline: 'अंतिम तिथि',
    ongoing: 'आवेदन चालू है (कोई अंतिम तिथि नहीं)',
    howToApply: 'आवेदन कैसे करें',
    helpline: 'हेल्पलाइन',
    link: 'आधिकारिक लिंक',
    footer: 'दोबारा शुरू करने के लिए "restart" भेजें।',
    truncated: 'और भी योजनाएं हैं — पूरी सूची के लिए वेबसाइट देखें।'
  },
  english: {
    header: (n) => `Based on your answers, we found ${n} schemes.\nBest matches are listed first 👇`,
    none: 'Sorry, no schemes found right now. Please try again later.',
    fully: 'Fully eligible',
    partial: (passed, total) => `Partial match (${passed}/${total} conditions met)`,
    matchedOn: 'Matched on',
    notMet: 'Conditions not met',
    about: 'About this scheme',
    benefit: 'Benefit',
    ministry: 'Ministry',
    level: 'Level',
    central: 'Central scheme (all India)',
    stateLevel: (s) => `State scheme (${s})`,
    deadline: 'Deadline',
    ongoing: 'Applications open (no deadline)',
    howToApply: 'How to apply',
    helpline: 'Helpline',
    link: 'Official link',
    footer: 'Send "restart" to start over.',
    truncated: 'More schemes are available — check the website for the full list.'
  }
};

function labelList(keys, lang) {
  return keys.map((k) => (LABELS[k] ? LABELS[k][lang] : k)).join(', ');
}

function formatDate(value, lang) {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(lang === 'hindi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

// Ek scheme ka poora data — ek alag WhatsApp message ke roop mein
function formatScheme(match, index, lang) {
  const t = T[lang] || T.hindi;
  const s = match.scheme;
  const isHindi = lang === 'hindi';

  const name = (isHindi ? s.name_hindi : s.name) || s.name;
  const description = (isHindi ? s.description_hindi : s.description) || s.description;
  const process = (isHindi ? s.application_process_hindi : s.application_process) || s.application_process;

  const lines = [];

  lines.push(`*${index + 1}. ${name}*`);
  lines.push(match.fullyEligible
    ? `✅ ${t.fully}`
    : `⚠️ ${t.partial(match.passedCriteria, match.totalCriteria)}`);
  lines.push('');

  if (description) {
    lines.push(`📝 *${t.about}:*`);
    lines.push(description);
    lines.push('');
  }

  if (s.benefit_amount) {
    const type = s.benefit_type ? ` (${s.benefit_type})` : '';
    lines.push(`💰 *${t.benefit}:* ${s.benefit_amount}${type}`);
  }
  if (s.ministry) {
    lines.push(`🏛️ *${t.ministry}:* ${s.ministry}`);
  }

  lines.push(`📍 *${t.level}:* ${s.applicable_state ? t.stateLevel(s.applicable_state) : t.central}`);

  if (s.application_deadline) {
    lines.push(`🗓️ *${t.deadline}:* ${formatDate(s.application_deadline, lang)}`);
  } else if (s.is_ongoing) {
    lines.push(`🗓️ ${t.ongoing}`);
  }

  lines.push('');

  if (match.matched.length > 0) {
    lines.push(`✅ *${t.matchedOn}:* ${labelList(match.matched, lang)}`);
  }
  if (match.missed.length > 0) {
    lines.push(`❌ *${t.notMet}:* ${labelList(match.missed, lang)}`);
  }

  if (process) {
    lines.push('');
    lines.push(`📄 *${t.howToApply}:*`);
    lines.push(process);
  }

  if (s.helpline_number) {
    lines.push('');
    lines.push(`☎️ *${t.helpline}:* ${s.helpline_number}`);
  }
  if (s.official_link) {
    lines.push(`🔗 ${s.official_link}`);
  }

  let text = lines.join('\n');
  if (text.length > MAX_MESSAGE_LENGTH) {
    text = text.slice(0, MAX_MESSAGE_LENGTH - 3) + '...';
  }
  return text;
}

module.exports = { formatScheme, MAX_MESSAGE_LENGTH, T };
