const pool = require('./db');

// Har criterion ka bilingual label — reply mein dikhane ke liye
const LABELS = {
  age: { hindi: 'उम्र', english: 'Age' },
  income: { hindi: 'आय', english: 'Income' },
  category: { hindi: 'श्रेणी', english: 'Category' },
  gender: { hindi: 'लिंग', english: 'Gender' },
  occupation: { hindi: 'व्यवसाय', english: 'Occupation' },
  state: { hindi: 'राज्य', english: 'State' },
  disability: { hindi: 'दिव्यांगता', english: 'Disability' },
  marital_status: { hindi: 'वैवाहिक स्थिति', english: 'Marital status' },
  family_size: { hindi: 'परिवार का आकार', english: 'Family size' },
  ration_card: { hindi: 'राशन कार्ड', english: 'Ration card' },
  religion: { hindi: 'धर्म', english: 'Religion' }
};

const ALL_CATEGORIES = ['General', 'OBC', 'SC', 'ST'];

// Scoring: scheme ne is criterion pe specifically user ko target kiya = 2 points,
// scheme sabke liye khuli hai ('any') = 1 point, user fit nahi hota = 0 points.
const POINTS = { match: 2, open: 1, miss: 0 };

function isOpenList(list) {
  return !Array.isArray(list) || list.length === 0 || list.includes('any');
}

// Har criterion ko 'match' | 'open' | 'miss' mein classify karo
function evaluateCriteria(scheme, rule, user) {
  const results = [];
  const add = (key, status) => results.push({ key, status });
  const r = rule || {};

  // Age
  const minAge = r.min_age == null ? 0 : Number(r.min_age);
  const maxAge = r.max_age == null ? 150 : Number(r.max_age);
  if (minAge <= 0 && maxAge >= 120) {
    add('age', 'open');
  } else {
    add('age', user.age >= minAge && user.age <= maxAge ? 'match' : 'miss');
  }

  // Annual income
  if (r.max_income == null) {
    add('income', 'open');
  } else {
    add('income', Number(user.income) <= Number(r.max_income) ? 'match' : 'miss');
  }

  // Category — agar chaaron categories allowed hain to wo sabke liye khuli hai
  const cats = r.allowed_categories;
  if (isOpenList(cats) || ALL_CATEGORIES.every((c) => cats.includes(c))) {
    add('category', 'open');
  } else {
    add('category', cats.includes(user.category) ? 'match' : 'miss');
  }

  // Gender
  if (!r.allowed_gender || r.allowed_gender === 'any') {
    add('gender', 'open');
  } else {
    add('gender', r.allowed_gender === user.gender ? 'match' : 'miss');
  }

  // Occupation
  if (!r.required_occupation || r.required_occupation === 'any') {
    add('occupation', 'open');
  } else {
    add('occupation', r.required_occupation === user.occupation ? 'match' : 'miss');
  }

  // State — scheme.applicable_state null matlab central scheme, sabke liye
  if (!scheme.applicable_state) {
    add('state', 'open');
  } else {
    const schemeState = String(scheme.applicable_state).trim().toLowerCase();
    const userState = String(user.state || '').trim().toLowerCase();
    add('state', schemeState === userState ? 'match' : 'miss');
  }

  // Disability
  if (!r.allowed_disability_status || r.allowed_disability_status === 'any') {
    add('disability', 'open');
  } else {
    add('disability', r.allowed_disability_status === user.disability ? 'match' : 'miss');
  }

  // Marital status
  if (isOpenList(r.allowed_marital_status)) {
    add('marital_status', 'open');
  } else {
    add('marital_status', r.allowed_marital_status.includes(user.marital_status) ? 'match' : 'miss');
  }

  // Family size — unmarried users se poocha hi nahi jaata, to null ho sakta hai
  const minFam = r.min_family_size == null ? null : Number(r.min_family_size);
  const maxFam = r.max_family_size == null ? null : Number(r.max_family_size);
  const famOpen = (minFam == null || minFam <= 1) && (maxFam == null || maxFam >= 30);
  if (famOpen || user.family_size == null) {
    add('family_size', 'open');
  } else {
    const size = Number(user.family_size);
    const okMin = minFam == null || size >= minFam;
    const okMax = maxFam == null || size <= maxFam;
    add('family_size', okMin && okMax ? 'match' : 'miss');
  }

  // Ration card
  if (isOpenList(r.allowed_ration_card_types)) {
    add('ration_card', 'open');
  } else {
    add('ration_card', r.allowed_ration_card_types.includes(user.ration_card) ? 'match' : 'miss');
  }

  // Religion
  if (isOpenList(r.allowed_religion)) {
    add('religion', 'open');
  } else {
    add('religion', r.allowed_religion.includes(user.religion) ? 'match' : 'miss');
  }

  return results;
}

async function findMatchingSchemes(userDetails) {
  // LEFT JOIN — jis scheme ke rules abhi nahi bane, wo bhi list mein aani chahiye
  const query = `
    SELECT s.*,
           e.min_age, e.max_age, e.max_income, e.allowed_categories,
           e.allowed_gender, e.required_occupation, e.allowed_disability_status,
           e.allowed_marital_status, e.allowed_ration_card_types, e.allowed_religion,
           e.min_family_size, e.max_family_size
    FROM schemes s
    LEFT JOIN eligibility_rules e ON s.id = e.scheme_id
    WHERE s.is_active = true
  `;

  let rows;
  try {
    const result = await pool.query(query);
    rows = result.rows;
  } catch (err) {
    console.error('Matching query failed:', err.message);
    return [];
  }

  const scored = rows.map((row) => {
    const criteria = evaluateCriteria(row, row, userDetails);

    const matched = criteria.filter((c) => c.status === 'match').map((c) => c.key);
    const missed = criteria.filter((c) => c.status === 'miss').map((c) => c.key);
    const score = criteria.reduce((sum, c) => sum + POINTS[c.status], 0);

    return {
      scheme: row,
      score,
      matched,
      missed,
      totalCriteria: criteria.length,
      passedCriteria: criteria.length - missed.length,
      fullyEligible: missed.length === 0
    };
  });

  // Ek bhi cheez match/pass hui to dikhao. Sabse zyada match wali sabse upar.
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.missed.length !== b.missed.length) return a.missed.length - b.missed.length;
      return a.scheme.id - b.scheme.id;
    });
}

module.exports = findMatchingSchemes;
module.exports.LABELS = LABELS;
