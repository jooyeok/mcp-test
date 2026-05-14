// Playwright test for Shopping List App
const { chromium } = require('playwright');
const path = require('path');

const FILE_URL = 'file:///' + path.resolve(__dirname, 'shopping-list.html').replace(/\\/g, '/');

let browser, page;
let passed = 0, failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS  ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ❌ FAIL  ${name}`);
    console.log(`         ${e.message}`);
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

async function setup() {
  browser = await chromium.launch({ headless: false, slowMo: 150 });
  page = await browser.newPage();
  // Clear localStorage before each full run
  await page.goto(FILE_URL);
  await page.evaluate(() => localStorage.removeItem('shopping-list'));
  await page.reload();
}

async function teardown() {
  await browser.close();
}

// ─── helpers ────────────────────────────────────────────────────────────────

async function addItem(text) {
  await page.fill('#item-input', text);
  await page.click('#btn-add');
}

async function getItemTexts() {
  return page.$$eval('.item .item-text', els => els.map(e => e.textContent));
}

async function getItems() {
  return page.$$eval('.item', els => els.map(e => ({
    text: e.querySelector('.item-text').textContent,
    done: e.classList.contains('done'),
  })));
}

// ─── tests ──────────────────────────────────────────────────────────────────

async function runTests() {
  console.log('\n📋 쇼핑 리스트 앱 자동 테스트\n');
  console.log('─'.repeat(50));

  // ── 1. 기본 UI 렌더링 ──────────────────────────────
  console.log('\n[1] 기본 UI 렌더링');

  await test('페이지 제목이 "쇼핑 리스트" 이다', async () => {
    const title = await page.title();
    assert(title === '쇼핑 리스트', `title="${title}"`);
  });

  await test('입력창이 존재한다', async () => {
    const input = await page.$('#item-input');
    assert(input !== null, '입력창 없음');
  });

  await test('추가 버튼이 존재한다', async () => {
    const btn = await page.$('#btn-add');
    assert(btn !== null, '추가 버튼 없음');
  });

  await test('초기 상태에서 리스트가 비어있다', async () => {
    const items = await getItemTexts();
    assert(items.length === 0, `아이템 ${items.length}개 있음`);
  });

  // ── 2. 아이템 추가 ─────────────────────────────────
  console.log('\n[2] 아이템 추가');

  await test('"사과" 추가 → 목록에 표시된다', async () => {
    await addItem('사과');
    const texts = await getItemTexts();
    assert(texts.includes('사과'), `목록: ${JSON.stringify(texts)}`);
  });

  await test('"우유" Enter 키로 추가', async () => {
    await page.fill('#item-input', '우유');
    await page.keyboard.press('Enter');
    const texts = await getItemTexts();
    assert(texts.includes('우유'), `목록: ${JSON.stringify(texts)}`);
  });

  await test('"바나나" 추가 → 총 3개', async () => {
    await addItem('바나나');
    const texts = await getItemTexts();
    assert(texts.length === 3, `항목 수: ${texts.length}`);
  });

  await test('빈 입력값은 추가되지 않는다', async () => {
    await page.fill('#item-input', '   ');
    await page.click('#btn-add');
    const texts = await getItemTexts();
    assert(texts.length === 3, `항목 수: ${texts.length}`);
  });

  await test('추가 후 입력창이 비워진다', async () => {
    await addItem('딸기');
    const val = await page.inputValue('#item-input');
    assert(val === '', `입력창 값: "${val}"`);
  });

  await test('localStorage에 저장된다', async () => {
    const stored = await page.evaluate(() => localStorage.getItem('shopping-list'));
    assert(stored !== null && stored.includes('사과'), '저장 없음');
  });

  await test('페이지 새로고침 후 데이터 유지', async () => {
    await page.reload();
    const texts = await getItemTexts();
    assert(texts.includes('사과') && texts.includes('우유'), `목록: ${JSON.stringify(texts)}`);
  });

  // ── 3. 체크(완료) 토글 ────────────────────────────
  console.log('\n[3] 체크(완료) 토글');

  await test('원형 버튼 클릭 → done 클래스 추가', async () => {
    const check = await page.$('.item:last-child .item-check');
    await check.click();
    const items = await getItems();
    const lastDone = items[items.length - 1].done;
    assert(lastDone, '완료 상태 아님');
  });

  await test('완료 항목 텍스트에 취소선이 적용된다', async () => {
    const textDecoration = await page.$eval(
      '.item.done .item-text',
      el => getComputedStyle(el).textDecoration
    );
    assert(textDecoration.includes('line-through'), `decoration="${textDecoration}"`);
  });

  await test('다시 클릭하면 완료 해제된다', async () => {
    const check = await page.$('.item.done .item-check');
    await check.click();
    const doneItems = await page.$$('.item.done');
    assert(doneItems.length === 0, `완료 항목 ${doneItems.length}개 남음`);
  });

  await test('텍스트 클릭으로도 완료 토글된다', async () => {
    await page.$eval('.item:first-child .item-text', el => el.click());
    const first = (await getItems())[0];
    assert(first.done, '텍스트 클릭 토글 안 됨');
  });

  // ── 4. 아이템 삭제 ─────────────────────────────────
  console.log('\n[4] 아이템 삭제');

  await test('✕ 버튼 클릭 → 해당 항목 삭제', async () => {
    const before = await getItemTexts();
    const firstText = before[0];
    await page.click('.item:first-child .btn-delete');
    const after = await getItemTexts();
    assert(!after.includes(firstText), `"${firstText}" 아직 있음`);
    assert(after.length === before.length - 1, `항목 수: ${after.length}`);
  });

  await test('삭제 후 나머지 항목은 유지된다', async () => {
    const texts = await getItemTexts();
    assert(texts.length >= 2, `항목 수: ${texts.length}`);
  });

  // ── 5. 완료 항목 일괄 삭제 ────────────────────────
  console.log('\n[5] 완료 항목 일괄 삭제');

  await test('"완료 항목 삭제" 버튼 존재', async () => {
    const btn = await page.$('#btn-clear');
    assert(btn !== null, '버튼 없음');
  });

  await test('완료 항목만 일괄 삭제된다', async () => {
    // 현재 항목 중 첫 번째를 완료로 표시
    await page.$eval('.item:first-child .item-check', el => el.click());
    const beforeDone = (await getItems()).filter(i => i.done).length;
    const beforeTotal = (await getItems()).length;
    await page.click('#btn-clear');
    const afterItems = await getItems();
    assert(afterItems.every(i => !i.done), '완료 항목 남아있음');
    assert(afterItems.length === beforeTotal - beforeDone, `항목 수: ${afterItems.length}`);
  });

  // ── 6. 필터 기능 ───────────────────────────────────
  console.log('\n[6] 필터 기능');

  await test('초기에는 "전체" 탭이 활성화', async () => {
    const active = await page.$eval('.filter-btn.active', el => el.dataset.filter);
    assert(active === 'all', `활성 필터: "${active}"`);
  });

  await test('"미완료" 탭 → 미완료 항목만 표시', async () => {
    // 일부 완료 처리
    await addItem('테스트완료항목');
    await page.$eval('.item:first-child .item-check', el => el.click());
    await page.click('[data-filter="active"]');
    const items = await getItems();
    assert(items.every(i => !i.done), `완료 항목 포함됨: ${JSON.stringify(items)}`);
  });

  await test('"완료" 탭 → 완료 항목만 표시', async () => {
    await page.click('[data-filter="done"]');
    const items = await getItems();
    assert(items.every(i => i.done), `미완료 항목 포함됨: ${JSON.stringify(items)}`);
  });

  await test('"전체" 탭으로 복귀', async () => {
    await page.click('[data-filter="all"]');
    const active = await page.$eval('.filter-btn.active', el => el.dataset.filter);
    assert(active === 'all', `활성 필터: "${active}"`);
  });

  // ── 7. 요약/카운트 표시 ────────────────────────────
  console.log('\n[7] 요약/카운트 표시');

  await test('헤더 요약 텍스트가 업데이트된다', async () => {
    const summary = await page.textContent('#summary');
    assert(summary.includes('총') && summary.includes('완료'), `summary="${summary}"`);
  });

  await test('푸터 미완료 카운트가 표시된다', async () => {
    const count = await page.textContent('#count-label');
    assert(count.includes('미완료'), `count="${count}"`);
  });

  // ── 결과 출력 ──────────────────────────────────────
  console.log('\n' + '─'.repeat(50));
  console.log(`\n🏁 결과: ${passed + failed}개 테스트 중 ✅ ${passed}개 통과, ❌ ${failed}개 실패\n`);
  if (failed === 0) {
    console.log('🎉 모든 테스트 통과!\n');
  }
}

(async () => {
  await setup();
  await runTests();
  await teardown();
  process.exit(failed > 0 ? 1 : 0);
})();