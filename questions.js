const { buildStatePrompt, buildStateOptions } = require('./states');

const questions = {
  language: {
    prompt: {
      hindi: 'Welcome! Choose your language / अपनी भाषा चुनें:\n\n1. English\n2. हिंदी (Hindi)',
      english: 'Welcome! Choose your language / अपनी भाषा चुनें:\n\n1. English\n2. हिंदी (Hindi)'
    },
    options: {
      'english': ['1', 'english'],
      'hindi': ['2', 'hindi', 'हिंदी']
    },
    invalidMessage: {
      hindi: '1 ya 2 daalein:',
      english: 'Please enter 1 or 2:'
    },
    nextStep: 'age'
  },

  age: {
    prompt: {
      hindi: 'आपकी उम्र क्या है? (जैसे: 25)',
      english: 'What is your age? (e.g. 25)'
    },
    validate: (input) => {
      const age = parseInt(input);
      return !isNaN(age) && age > 0 && age <= 120 ? age : null;
    },
    invalidMessage: {
      hindi: 'सही उम्र डालें (जैसे 25):',
      english: 'Please enter a valid age (e.g. 25):'
    },
    nextStep: 'gender'
  },

  gender: {
    prompt: {
      hindi: 'आपका लिंग क्या है?\n1. पुरुष (Male)\n2. महिला (Female)\n3. अन्य (Other)',
      english: 'What is your gender?\n1. Male\n2. Female\n3. Other'
    },
    options: {
      'male': ['1', 'male', 'पुरुष'],
      'female': ['2', 'female', 'महिला'],
      'other': ['3', 'other', 'अन्य']
    },
    invalidMessage: {
      hindi: '1, 2 या 3 डालें:',
      english: 'Please enter 1, 2, or 3:'
    },
    nextStep: 'category'
  },

  category: {
    prompt: {
      hindi: 'आपकी श्रेणी क्या है?\n1. सामान्य (General)\n2. ओबीसी (OBC)\n3. अनुसूचित जाति (SC)\n4. अनुसूचित जनजाति (ST)',
      english: 'What is your category?\n1. General\n2. OBC\n3. SC\n4. ST'
    },
    options: {
      'General': ['1', 'general', 'सामान्य'],
      'OBC': ['2', 'obc', 'ओबीसी'],
      'SC': ['3', 'sc', 'अनुसूचित जाति'],
      'ST': ['4', 'st', 'अनुसूचित जनजाति']
    },
    invalidMessage: {
      hindi: '1, 2, 3 या 4 डालें:',
      english: 'Please enter 1, 2, 3, or 4:'
    },
    nextStep: 'occupation'
  },

  occupation: {
    prompt: {
      hindi: 'आप क्या करते हैं?\n1. किसान (Farmer)\n2. छात्र/छात्रा (Student)\n3. निजी नौकरी (Private Job)\n4. सरकारी नौकरी (Government Job)\n5. व्यवसाय/स्वरोजगार (Business)\n6. बेरोजगार (Unemployed)\n7. गृहिणी (Homemaker)\n8. अन्य (Other)',
      english: 'What is your occupation?\n1. Farmer\n2. Student\n3. Private Job\n4. Government Job\n5. Business/Self-Employed\n6. Unemployed\n7. Homemaker\n8. Other'
    },
    options: {
      'farmer': ['1', 'farmer', 'किसान'],
      'student': ['2', 'student', 'छात्र', 'छात्रा'],
      'private_job': ['3', 'private job', 'निजी नौकरी'],
      'government_job': ['4', 'government job', 'सरकारी नौकरी'],
      'business': ['5', 'business', 'self-employed', 'व्यवसाय', 'स्वरोजगार'],
      'unemployed': ['6', 'unemployed', 'बेरोजगार'],
      'homemaker': ['7', 'homemaker', 'गृहिणी'],
      'other': ['8', 'other', 'अन्य']
    },
    invalidMessage: {
      hindi: '1 से 8 के बीच कोई नंबर डालें:',
      english: 'Please enter a number between 1 and 8:'
    },
    // Agar student hai toh education poochenge, warna seedha income
    nextStep: (answer) => answer === 'student' ? 'education' : 'income'
  },

  education: {
    prompt: {
      hindi: 'आपकी शिक्षा क्या है?\n1. कोई औपचारिक शिक्षा नहीं\n2. स्कूल में पढ़ रहे हैं (कक्षा 1-12)\n3. 12वीं पास, आगे नहीं पढ़ रहे\n4. स्नातक (Graduation) में पढ़ रहे हैं\n5. स्नातक, आगे नहीं पढ़ रहे\n6. स्नातकोत्तर (Post-Graduation) में पढ़ रहे हैं\n7. स्नातकोत्तर या उससे ऊपर',
      english: 'What is your education level?\n1. No formal education\n2. Studying in School (Class 1-12)\n3. 12th Pass, not studying further\n4. Studying in Graduation\n5. Graduate, not studying further\n6. Studying in Post-Graduation\n7. Post-Graduate or higher'
    },
    options: {
      'no_education': ['1'],
      'in_school': ['2'],
      '12th_pass': ['3'],
      'in_graduation': ['4'],
      'graduate': ['5'],
      'in_post_graduation': ['6'],
      'post_graduate': ['7']
    },
    invalidMessage: {
      hindi: '1 से 7 के बीच कोई नंबर डालें:',
      english: 'Please enter a number between 1 and 7:'
    },
    nextStep: 'income'
  },

  income: {
    prompt: {
      hindi: 'आपकी सालाना आय कितनी है? (सिर्फ नंबर लिखें, जैसे 150000)',
      english: 'What is your annual income? (numbers only, e.g. 150000)'
    },
    validate: (input) => {
      const income = parseInt(input);
      return !isNaN(income) && income >= 0 ? income : null;
    },
    invalidMessage: {
      hindi: 'सही नंबर डालें:',
      english: 'Please enter a valid number:'
    },
    nextStep: 'state'
  },

  state: {
    prompt: {
      hindi: buildStatePrompt('hindi'),
      english: buildStatePrompt('english')
    },
    options: buildStateOptions(),
    invalidMessage: {
      hindi: 'सूची में से 1 से 36 के बीच कोई नंबर भेजें:',
      english: 'Please send a number between 1 and 36 from the list:'
    },
    nextStep: 'disability'
  },

  disability: {
    prompt: {
      hindi: 'क्या आप दिव्यांग हैं?\n1. हाँ (Yes)\n2. नहीं (No)',
      english: 'Do you have any disability?\n1. Yes\n2. No'
    },
    options: {
      'yes': ['1', 'yes', 'haan', 'हाँ'],
      'no': ['2', 'no', 'nahi', 'नहीं']
    },
    invalidMessage: {
      hindi: '1 या 2 डालें:',
      english: 'Please enter 1 or 2:'
    },
    nextStep: 'marital_status'
  },

  marital_status: {
    prompt: {
      hindi: 'आपकी वैवाहिक स्थिति क्या है?\n1. अविवाहित (Single)\n2. विवाहित (Married)\n3. विधवा/विधुर (Widow/Widower)\n4. तलाकशुदा (Divorced/Separated)',
      english: 'What is your marital status?\n1. Single/Unmarried\n2. Married\n3. Widow/Widower\n4. Divorced/Separated'
    },
    options: {
      'single': ['1', 'single', 'अविवाहित'],
      'married': ['2', 'married', 'विवाहित'],
      'widow': ['3', 'widow', 'widower', 'विधवा', 'विधुर'],
      'divorced': ['4', 'divorced', 'separated', 'तलाकशुदा']
    },
    invalidMessage: {
      hindi: '1, 2, 3 या 4 डालें:',
      english: 'Please enter 1, 2, 3, or 4:'
    },
    // Agar married hai toh family size poochenge, warna seedha ration card
    nextStep: (answer) => answer === 'married' ? 'family_size' : 'ration_card'
  },

  family_size: {
    prompt: {
      hindi: 'आपके परिवार में कितने सदस्य हैं? (सिर्फ नंबर लिखें, जैसे 4)',
      english: 'How many members are there in your family? (numbers only, e.g. 4)'
    },
    validate: (input) => {
      const size = parseInt(input);
      return !isNaN(size) && size > 0 && size <= 30 ? size : null;
    },
    invalidMessage: {
      hindi: 'सही नंबर डालें:',
      english: 'Please enter a valid number:'
    },
    nextStep: 'ration_card'
  },

  ration_card: {
    prompt: {
      hindi: 'आपका राशन कार्ड किस प्रकार का है?\n1. बीपीएल (BPL)\n2. एपीएल (APL)\n3. अंत्योदय (Antyodaya)\n4. राशन कार्ड नहीं है\n5. पता नहीं',
      english: 'What type of ration card do you have?\n1. BPL (Below Poverty Line)\n2. APL (Above Poverty Line)\n3. Antyodaya (AAY)\n4. No ration card\n5. Not sure'
    },
    options: {
      'BPL': ['1', 'bpl', 'बीपीएल'],
      'APL': ['2', 'apl', 'एपीएल'],
      'Antyodaya': ['3', 'antyodaya', 'aay', 'अंत्योदय'],
      'none': ['4', 'no card', 'नहीं है'],
      'unknown': ['5', 'not sure', 'पता नहीं']
    },
    invalidMessage: {
      hindi: '1 से 5 के बीच कोई नंबर डालें:',
      english: 'Please enter a number between 1 and 5:'
    },
    nextStep: 'religion'
  },

  religion: {
    prompt: {
      hindi: 'आपका धर्म क्या है?\n1. हिन्दू (Hindu)\n2. मुस्लिम (Muslim)\n3. ईसाई (Christian)\n4. सिख (Sikh)\n5. बौद्ध (Buddhist)\n6. जैन (Jain)\n7. अन्य (Other)\n8. बताना नहीं चाहते',
      english: 'What is your religion?\n1. Hindu\n2. Muslim\n3. Christian\n4. Sikh\n5. Buddhist\n6. Jain\n7. Other\n8. Prefer not to say'
    },
    options: {
      'Hindu': ['1', 'hindu', 'हिन्दू'],
      'Muslim': ['2', 'muslim', 'मुस्लिम'],
      'Christian': ['3', 'christian', 'ईसाई'],
      'Sikh': ['4', 'sikh', 'सिख'],
      'Buddhist': ['5', 'buddhist', 'बौद्ध'],
      'Jain': ['6', 'jain', 'जैन'],
      'Other': ['7', 'other', 'अन्य'],
      'not_disclosed': ['8', 'prefer not to say', 'बताना नहीं चाहते']
    },
    invalidMessage: {
      hindi: '1 से 8 के बीच कोई नंबर डालें:',
      english: 'Please enter a number between 1 and 8:'
    },
    nextStep: 'done'
  }
};

module.exports = questions;