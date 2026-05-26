"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function findEffect(envelope, type) {
  return envelope.effects.find((effect) => effect.type === type);
}

(async () => {
  const gambling = await load("src/restored/games/gambling-replacement-contract.js");
  const loanOffice = await load("src/restored/games/loan-office-contract.js");
  const validation = loanOffice.validateRestoredLoanOfficeContract();
  assert.equal(validation.ok, true, validation.errors.join("\n"));

  const quote = loanOffice.createRestoredLoanOfficeQuote({
    actorId: "player:test",
    principalCash: 50000,
    interestRate: 0.4,
    serviceFeeRate: 0.1,
    termDays: 5
  });
  assert.equal(quote.contractVersion, "restored-loan-office-001");
  assert.equal(quote.disbursedCash, 45000);
  assert.equal(quote.dueCash, 70000);
  assert.equal(quote.riskLevel, "high");

  const borrow = loanOffice.createRestoredLoanOfficeBorrowEnvelope({ actorId: "player:test", principalCash: 50000 });
  assert.equal(borrow.event.type, gambling.RESTORED_GAMBLING_EVENT_TYPES.DEBT_CREATED);
  assert.equal(borrow.event.gameId, "loan-office");
  assert.ok(findEffect(borrow, loanOffice.RESTORED_LOAN_OFFICE_EFFECT_TYPES.DEBT_REGISTER), "borrow should register debt");
  assert.equal(findEffect(borrow, loanOffice.RESTORED_LOAN_OFFICE_EFFECT_TYPES.CASH_DELTA).payload.cash, 47500);
  assert.equal(findEffect(borrow, gambling.RESTORED_GAMBLING_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY), undefined);

  const payment = loanOffice.createRestoredLoanOfficePaymentEnvelope({ loan: borrow.loan, paymentCash: 10000 });
  assert.equal(payment.loan.remainingCash, 55000);
  assert.equal(findEffect(payment, loanOffice.RESTORED_LOAN_OFFICE_EFFECT_TYPES.CASH_DELTA).payload.cash, -10000);

  const late = loanOffice.createRestoredLoanOfficeDelinquencyEnvelope({ loan: payment.loan, penaltyRate: 0.2 });
  assert.equal(late.loan.status, loanOffice.RESTORED_LOAN_OFFICE_STATUS.DELINQUENT);
  assert.equal(late.loan.remainingCash, 66000);
  assert.ok(findEffect(late, loanOffice.RESTORED_LOAN_OFFICE_EFFECT_TYPES.DEBT_DELINQUENT), "late loan should emit delinquent effect");

  const defaulted = loanOffice.createRestoredLoanOfficeDefaultEnvelope({ loan: late.loan });
  assert.equal(defaulted.loan.status, loanOffice.RESTORED_LOAN_OFFICE_STATUS.DEFAULTED);
  assert.ok(findEffect(defaulted, loanOffice.RESTORED_LOAN_OFFICE_EFFECT_TYPES.DEBT_DEFAULTED), "default should emit defaulted effect");

  const docs = [
    read("docs/baegeum-city-v2-gambling-venues.md"),
    read("docs/baegeum-city-v2-restored-recomposition-plan.md"),
    read("docs/ai-working-state.md")
  ].join("\n");
  assert.ok(docs.includes("src/restored/games/loan-office-contract.js"));
  assert.ok(docs.includes("restored-loan-office-001"));
  assert.ok(docs.includes("debt_created"));

  console.log("Restored loan office contract check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
