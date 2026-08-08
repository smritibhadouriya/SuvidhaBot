const questions = require('./questions');

function processUserInput(session, incomingMessage) {
  const currentStep = session.step;
  const stepConfig = questions[currentStep];

  // Session kharab step pe atak gaya (jaise 'done' ya undefined) — shuru se start karo
  if (!stepConfig) {
    session.step = 'language';
    delete session.language;
    return {
      success: false,
      message: questions.language.prompt.hindi
    };
  }

  let answerValue = null;
  const userInput = incomingMessage.trim().toLowerCase();

  if (stepConfig.options) {
    // Naya flexible matching — number, English word, ya Hindi word — teeno check karo
    for (const [key, acceptedValues] of Object.entries(stepConfig.options)) {
      const matchFound = acceptedValues.some(
        (value) => value.toLowerCase() === userInput
      );
      if (matchFound) {
        answerValue = key;
        break;
      }
    }
  } else if (stepConfig.validate) {
    answerValue = stepConfig.validate(incomingMessage.trim());
  }

  // Agar invalid input hai
  if (answerValue === undefined || answerValue === null) {
    const lang = session.language || 'hindi';
    return {
      success: false,
      message: stepConfig.invalidMessage[lang]
    };
  }

  // Answer save karo
  session[currentStep] = answerValue;

  // nextStep ya toh direct string hai, ya function jo answer pe depend karta hai
  session.step = typeof stepConfig.nextStep === 'function'
    ? stepConfig.nextStep(answerValue)
    : stepConfig.nextStep;

  // Agar saare questions complete ho gaye
  if (session.step === 'done') {
    return { success: true, completed: true };
  }

  // Agla question bhejo
  const lang = session.language || 'hindi';
  const nextStepConfig = questions[session.step];
  return {
    success: true,
    completed: false,
    message: nextStepConfig.prompt[lang]
  };
}

module.exports = processUserInput;