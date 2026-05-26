import {
  RESTORED_GAMBLING_EVENT_TYPES,
  createRestoredGamblingEffects
} from "./gambling-replacement-contract.js";

export const RESTORED_LOAN_OFFICE_CONTRACT_VERSION = "restored-loan-office-001";

export const RESTORED_LOAN_OFFICE_STATUS = Object.freeze({
  OFFERED: "offered",
  ACTIVE: "active",
  REPAID: "repaid",
  DELINQUENT: "delinquent",
  DEFAULTED: "defaulted"
});

export const RESTORED_LOAN_OFFICE_EFFECT_TYPES = Object.freeze({
  DEBT_REGISTER: "loan_office_debt_register",
  CASH_DELTA: "loan_office_cash_delta",
  DEBT_PAYMENT: "loan_office_debt_payment",
  DEBT_DELINQUENT: "loan_office_debt_delinquent",
  DEBT_DEFAULTED: "loan_office_debt_defaulted"
});

function numeric(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function positiveInteger(value, fallback = 1) {
  const number = Math.round(numeric(value));
  return number >= 1 ? number : fallback;
}

function positiveMoney(value) {
  return Math.max(1, Math.round(numeric(value)));
}

function rate(value, fallback) {
  const number = numeric(value);
  if (number > 0 && number <= 2) return number;
  return fallback;
}

function stringOrDefault(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function freezeEffect(effect) {
  return Object.freeze({ ...effect, payload: Object.freeze(effect.payload || {}) });
}

export function createRestoredLoanOfficeQuote(input = {}) {
  const actorId = stringOrDefault(input.actorId, "player:local");
  const principalCash = positiveMoney(input.principalCash ?? input.requestedCash);
  const interestRate = rate(input.interestRate, 0.3);
  const serviceFeeRate = rate(input.serviceFeeRate, 0.05);
  const interestCash = Math.ceil(principalCash * interestRate);
  const serviceFeeCash = Math.ceil(principalCash * serviceFeeRate);
  const disbursedCash = Math.max(1, principalCash - serviceFeeCash);
  const dueCash = principalCash + interestCash;
  const termDays = positiveInteger(input.termDays, 7);
  const loanId = stringOrDefault(input.loanId, `loan:${actorId}:${principalCash}:${termDays}`);
  return Object.freeze({
    contractVersion: RESTORED_LOAN_OFFICE_CONTRACT_VERSION,
    loanId,
    actorId,
    principalCash,
    interestRate,
    serviceFeeRate,
    interestCash,
    serviceFeeCash,
    disbursedCash,
    dueCash,
    remainingCash: dueCash,
    termDays,
    riskLevel: riskLevelForRate(interestRate),
    status: RESTORED_LOAN_OFFICE_STATUS.OFFERED
  });
}

export function createRestoredLoanOfficeBorrowEnvelope(input = {}) {
  const quote = createRestoredLoanOfficeQuote(input);
  const envelope = createRestoredGamblingEffects({
    type: RESTORED_GAMBLING_EVENT_TYPES.DEBT_CREATED,
    actorId: quote.actorId,
    venueId: stringOrDefault(input.venueId, "dice-loan-office-01"),
    gameId: "loan-office",
    roundId: input.roundId,
    tableId: input.tableId,
    amountCash: quote.disbursedCash,
    debtAmount: quote.dueCash,
    authority: input.authority,
    emotionTags: ["loan_office_debt", ...(input.emotionTags || [])],
    relationshipHooks: input.relationshipHooks || ["partner_reacts_to_loan_office"],
    payload: { ...quote, status: RESTORED_LOAN_OFFICE_STATUS.ACTIVE }
  });
  return Object.freeze({
    loan: Object.freeze({ ...quote, status: RESTORED_LOAN_OFFICE_STATUS.ACTIVE }),
    event: envelope.event,
    effects: Object.freeze([
      ...envelope.effects,
      debtEffect(RESTORED_LOAN_OFFICE_EFFECT_TYPES.DEBT_REGISTER, quote, quote.dueCash),
      cashDeltaEffect(quote, quote.disbursedCash)
    ])
  });
}

export function createRestoredLoanOfficePaymentEnvelope(input = {}) {
  const loan = normalizeLoan(input.loan || input);
  const paymentCash = Math.min(loan.remainingCash, positiveMoney(input.paymentCash));
  const remainingCash = Math.max(0, loan.remainingCash - paymentCash);
  const status = remainingCash === 0 ? RESTORED_LOAN_OFFICE_STATUS.REPAID : RESTORED_LOAN_OFFICE_STATUS.ACTIVE;
  return localLoanEnvelope({
    loan: { ...loan, remainingCash, status },
    effects: [
      cashDeltaEffect(loan, -paymentCash),
      debtEffect(RESTORED_LOAN_OFFICE_EFFECT_TYPES.DEBT_PAYMENT, loan, remainingCash, { paymentCash })
    ]
  });
}

export function createRestoredLoanOfficeDelinquencyEnvelope(input = {}) {
  const loan = normalizeLoan(input.loan || input);
  const penaltyRate = rate(input.penaltyRate, 0.1);
  const penaltyCash = Math.ceil(loan.remainingCash * penaltyRate);
  const remainingCash = loan.remainingCash + penaltyCash;
  return localLoanEnvelope({
    loan: { ...loan, remainingCash, status: RESTORED_LOAN_OFFICE_STATUS.DELINQUENT },
    effects: [debtEffect(RESTORED_LOAN_OFFICE_EFFECT_TYPES.DEBT_DELINQUENT, loan, remainingCash, { penaltyCash })]
  });
}

export function createRestoredLoanOfficeDefaultEnvelope(input = {}) {
  const loan = normalizeLoan(input.loan || input);
  return localLoanEnvelope({
    loan: { ...loan, status: RESTORED_LOAN_OFFICE_STATUS.DEFAULTED },
    effects: [debtEffect(RESTORED_LOAN_OFFICE_EFFECT_TYPES.DEBT_DEFAULTED, loan, loan.remainingCash)]
  });
}

export function validateRestoredLoanOfficeContract() {
  const errors = [];
  const quote = createRestoredLoanOfficeQuote({ principalCash: 100000 });
  if (quote.disbursedCash !== 95000 || quote.dueCash !== 130000) errors.push("default loan should disburse after 5% fee and owe 30% interest");

  const borrow = createRestoredLoanOfficeBorrowEnvelope({ principalCash: 100000 });
  if (borrow.event.type !== RESTORED_GAMBLING_EVENT_TYPES.DEBT_CREATED) errors.push("borrow should emit debt_created");
  if (!hasEffect(borrow, RESTORED_LOAN_OFFICE_EFFECT_TYPES.DEBT_REGISTER)) errors.push("borrow should register debt");
  if (cashDelta(borrow) !== 95000) errors.push("borrow should create positive local cash delta");

  const payment = createRestoredLoanOfficePaymentEnvelope({ loan: borrow.loan, paymentCash: 30000 });
  if (payment.loan.remainingCash !== 100000) errors.push("payment should reduce remaining debt");
  if (cashDelta(payment) !== -30000) errors.push("payment should create negative local cash delta");

  const delinquent = createRestoredLoanOfficeDelinquencyEnvelope({ loan: payment.loan, penaltyRate: 0.1 });
  if (delinquent.loan.remainingCash !== 110000 || delinquent.loan.status !== RESTORED_LOAN_OFFICE_STATUS.DELINQUENT) {
    errors.push("delinquency should add penalty and mark delinquent");
  }

  const repaid = createRestoredLoanOfficePaymentEnvelope({ loan: delinquent.loan, paymentCash: 110000 });
  if (repaid.loan.status !== RESTORED_LOAN_OFFICE_STATUS.REPAID || repaid.loan.remainingCash !== 0) {
    errors.push("full payment should mark loan repaid");
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function normalizeLoan(input = {}) {
  const quote = createRestoredLoanOfficeQuote(input);
  return Object.freeze({
    ...quote,
    remainingCash: positiveMoney(input.remainingCash ?? quote.remainingCash),
    status: Object.values(RESTORED_LOAN_OFFICE_STATUS).includes(input.status) ? input.status : quote.status
  });
}

function localLoanEnvelope({ loan, effects }) {
  return Object.freeze({
    loan: Object.freeze(loan),
    effects: Object.freeze(effects)
  });
}

function debtEffect(type, loan, remainingCash, extra = {}) {
  return freezeEffect({
    type,
    targetId: loan.loanId,
    payload: {
      loanId: loan.loanId,
      actorId: loan.actorId,
      principalCash: loan.principalCash,
      dueCash: loan.dueCash,
      remainingCash,
      ...extra
    }
  });
}

function cashDeltaEffect(loan, cash) {
  return freezeEffect({
    type: RESTORED_LOAN_OFFICE_EFFECT_TYPES.CASH_DELTA,
    targetId: loan.actorId,
    payload: { cash }
  });
}

function riskLevelForRate(interestRate) {
  if (interestRate >= 0.6) return "extreme";
  if (interestRate >= 0.3) return "high";
  return "medium";
}

function hasEffect(envelope, type) {
  return envelope.effects.some((effect) => effect.type === type);
}

function cashDelta(envelope) {
  return envelope.effects.find((effect) => effect.type === RESTORED_LOAN_OFFICE_EFFECT_TYPES.CASH_DELTA)?.payload?.cash ?? 0;
}
