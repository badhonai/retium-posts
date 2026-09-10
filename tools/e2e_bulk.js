// End-to-end test of the bulk week-marking feature.
//
//   npm i jsdom          # one-time, from anywhere
//   node tools/e2e_bulk.js
//
// Expects a fresh build: run `python3 tools/build_dashboard.py` first.
// Loads the ACTUAL built site/index.html in jsdom, drives the real React UI
// (unlock -> Posts -> bulk panel -> tick weeks -> mark), then asserts the
// persisted localStorage state. Nothing here re-implements app logic.

const fs = require('fs')
const { JSDOM } = require('jsdom')

const path = require('path')
const ROOT = path.dirname(__dirname)
const HTML = fs.readFileSync(path.join(ROOT, 'site', 'index.html'), 'utf8')
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

let failures = 0
function check(name, cond, extra = '') {
  console.log(`${cond ? '  ✓' : '  ✗'} ${name}${extra ? ' — ' + extra : ''}`)
  if (!cond) failures++
}

async function run() {
  const dom = new JSDOM(HTML, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: 'https://example.test/',
  })
  const { window } = dom
  const { document } = window

  // ---- unlock -------------------------------------------------------------
  for (let i = 0; i < 100 && !document.querySelector('#lock input'); i++) await sleep(25)
  const pw = document.querySelector('#lock input')
  check('lock screen rendered', !!pw)
  pw.value = 'king'
  document.querySelector('#lock .go').click()
  for (let i = 0; i < 100 && !document.querySelector('#app'); i++) await sleep(25)
  check('unlocked into #app', !!document.querySelector('#app'))

  // ---- go to Posts tab ----------------------------------------------------
  const tabs = [...document.querySelectorAll('.tabbar button')]
  tabs.find(b => b.textContent.includes('Posts')).click()
  await sleep(80)
  check('Posts view active', !!document.querySelector('#v-posts'))

  // ---- bulk panel ---------------------------------------------------------
  const bulk = document.querySelector('.bulk')
  check('bulk panel present', !!bulk)
  bulk.querySelector('.bulk-top').click()          // expand
  await sleep(80)

  const chips = [...document.querySelectorAll('.bulk-chips .chip')]
  check('one chip per real week', chips.length === 4, `found ${chips.length}`)
  check('chip labels', chips.map(c => c.textContent.trim()).join(' | '))

  const btns = () => [...document.querySelectorAll('.bulk-acts .btn')]
  const markBtn = () => btns().find(b => b.textContent.includes('posted'))
  const clearBtn = () => btns().find(b => b.textContent.trim().startsWith('Clear'))
  const allBtn = () => btns().find(b => ['All', 'None'].includes(b.textContent.trim()))

  check('mark button starts disabled', markBtn().disabled)

  // ---- tick weeks 1 and 3, then mark -------------------------------------
  chips[0].click(); await sleep(40)
  chips[2].click(); await sleep(40)
  check('mark button enabled after 2 ticks', !markBtn().disabled)
  check('mark button labels 2 weeks', /2 weeks/.test(markBtn().textContent), markBtn().textContent.trim())

  markBtn().click()
  await sleep(120)

  let posted = JSON.parse(window.localStorage.getItem('retium_posted_v1'))
  const keys = Object.keys(posted).map(Number).sort((a, b) => a - b)
  const wantW1W3 = [...Array(7).keys()].map(i => i + 1).concat([...Array(7).keys()].map(i => i + 15))
  check('weeks 1+3 marked, nothing else',
    JSON.stringify(keys) === JSON.stringify(wantW1W3),
    `got [${keys.join(',')}]`)

  const toast = document.querySelector('#toast')
  check('toast reports the bulk action',
    /14 posts marked as posted/.test(toast.textContent), JSON.stringify(toast.textContent))

  // chips should have reset after applying
  await sleep(40)
  check('selection resets after apply',
    [...document.querySelectorAll('.bulk-chips .chip')].every(c => !c.classList.contains('on')))

  // ---- "All" then mark everything ----------------------------------------
  allBtn().click(); await sleep(60)
  check('All ticks every week',
    [...document.querySelectorAll('.bulk-chips .chip')].every(c => c.classList.contains('on')))
  markBtn().click(); await sleep(120)
  posted = JSON.parse(window.localStorage.getItem('retium_posted_v1'))
  check('all 28 days marked', Object.keys(posted).length === 28, `${Object.keys(posted).length} marked`)

  // ---- clear week 4 only -------------------------------------------------
  const chips2 = [...document.querySelectorAll('.bulk-chips .chip')]
  chips2[3].click(); await sleep(40)
  clearBtn().click(); await sleep(120)
  posted = JSON.parse(window.localStorage.getItem('retium_posted_v1'))
  const left = Object.keys(posted).map(Number).sort((a, b) => a - b)
  check('week 4 cleared, weeks 1-3 kept',
    JSON.stringify(left) === JSON.stringify([...Array(21).keys()].map(i => i + 1)),
    `${left.length} left, max day ${Math.max(...left)}`)

  // ---- week rows on Home reflect it --------------------------------------
  tabs.find(b => b.textContent.includes('Home')).click()
  await sleep(80)
  const heroDone = !!document.querySelector('.done-body')
  check('Home still renders after bulk ops', !!document.querySelector('#v-home') && !heroDone,
    heroDone ? 'unexpectedly shows "All caught up"' : '3 weeks left to post')

  console.log(failures ? `\nFAILED: ${failures} check(s)` : '\nALL CHECKS PASSED')
  process.exit(failures ? 1 : 0)
}

run().catch(e => { console.error('TEST CRASHED:', e); process.exit(2) })
