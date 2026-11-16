// Copy to tests/showableReview.test.ts; run: tsx --test tests/showableReview.test.ts (or node --test on Node >= 23).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isQuotableLiveReview, isShowableLiveReview, normalizeReviewField } from '../lib/showableReview'

const ok = (text: string, author = 'Jane D.') => isShowableLiveReview({ text, author })

test('ordinary reviews show', () => {
  for (const t of [
    'Kevin built our 16x20 deck in 3 weeks, great crew.',
    'Best deck builder. 5 stars, 10 out of 10 would hire again!',
    'Took 12 days start to finish and they went above expectations all the way.',
    'Gordon Crane Co. did a great job on our 2 story addition.',
    'Fixed our panel in 2024, 100% recommend.',
  ]) assert.equal(ok(t), true, t)
})

test('phones are hidden: 10-digit, 7-digit, +1, international', () => {
  for (const t of ['Call me at 919-555-1212', 'call (919) 555 1212', 'text 555-1212', 'reach him on +1 919 555 1212', 'my cell +44 20 7946 0958'])
    assert.equal(ok(t), false, t)
})

test('emails are hidden, including obfuscated ones', () => {
  for (const t of ['email bob@example.com', 'write to bob at gmail dot com', 'bob [at] gmail [dot] net', 'bob(at)yahoo(dot)org'])
    assert.equal(ok(t), false, t)
})

test('links and bare domains are hidden', () => {
  for (const t of ['see https://x.example', 'go to www.example.org', 'check out mybiz.com', 'visit deals.io', 'cheapdecks.biz is worse'])
    assert.equal(ok(t), false, t)
})

test('street addresses are hidden: 1+ digit house numbers, abbreviated and full suffixes', () => {
  for (const t of [
    'We live at 123 Oak Ridge Dr in Apex', '45 Main St.', '9 Sunset Way', '210 Elm Ter', '3 Rock Creek Pkwy',
    '1200 US Hwy', '77 Birch Pl', '8 Fox Cir', '500 Grand Blvd', 'at 12 maple ave',
    '4 Old Mill Road', '6 cherry lane', '7 Sea Breeze Drive', '2 Kings Court', '5 Long Place', '1 Hill Terrace',
    '3 Lake Circle', '11 Coastal Highway', '14 Blue Ridge Parkway', '2 Pine Trail', '9 Ocean Boulevard',
  ]) assert.equal(ok(t), false, t)
})

test('author is checked too, after NFKC + whitespace normalisation', () => {
  assert.equal(isShowableLiveReview({ text: 'Great work.', author: 'Bob 919-555-1212' }), false)
  assert.equal(isShowableLiveReview({ text: 'Great work.', author: 'John Smith' }, [/john\s+smith/i]), false)
  assert.equal(ok('call ９１９-５５５-１２１２'), false) // full-width digits
  assert.equal(isShowableLiveReview({ text: 'Great work.', author: ' John  Smith ' }, [/^John Smith$/]), false)
})

test('site NEVER_SHOW applies to text', () => {
  assert.equal(isShowableLiveReview({ text: 'Worked at Google for years', author: 'A B.' }, [/google/i]), false)
})

test('quote beside the call button fails closed on 3+ consecutive digits', () => {
  assert.equal(isQuotableLiveReview({ text: 'Great crew, 10/10.', author: 'Jane D.' }), true)
  assert.equal(isQuotableLiveReview({ text: 'Fixed our panel in 2024, great work.', author: 'Jane D.' }), false)
  assert.equal(isQuotableLiveReview({ text: 'Great work.', author: 'Jane123' }), false)
  assert.equal(isQuotableLiveReview({ text: 'call ９１９ now' , author: 'A B.' }), false) // NFKC first
  assert.equal(isQuotableLiveReview({ text: 'Lovely, 12 days.', author: 'A B.' }), true)
})

test('format chars are stripped before testing (zero-width split numbers/addresses)', () => {
  assert.equal(ok('call 919​-555​-1212'), false)
  assert.equal(ok('bob@‍example.com'), false)
  assert.equal(normalizeReviewField(' Great​  work ! '), 'Great work !')
})

test('quote: other-script digits and 7+ digits in total (separators removed) fail closed', () => {
  assert.equal(isQuotableLiveReview({ text: 'call ٩١٩ now', author: 'A B.' }), false) // Arabic-Indic 919
  assert.equal(isQuotableLiveReview({ text: 'ring 91 95 55 12 12', author: 'A B.' }), false) // 10 digits split in pairs
  assert.equal(isQuotableLiveReview({ text: 'call 9.1.9.5.5.5.1', author: 'A B.' }), false) // 7 digits, dotted
  assert.equal(isQuotableLiveReview({ text: '5 stars, 10/10, 2 weeks.', author: 'A B.' }), true) // 5 digits total
})
