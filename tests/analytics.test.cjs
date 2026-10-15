const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInContext, createContext } = require('node:vm');
const source = readFileSync(new URL('../assets/js/analytics.js', 'file://' + __filename), 'utf8');
const key = 'pricerecall.analytics-consent.v1';
const store = 'https://apps.apple.com/kr/app/id6768031093';

function fixture(options = {}) {
    const listeners = {};
    const scripts = [];
    const cookieWrites = [];
    const values = new Map(options.consent === undefined ? [] : [[key, options.consent]]);
    const element = dataset => ({
        dataset, handlers: {}, hidden: true,
        addEventListener(type, callback) { this.handlers[type] = callback; },
        focus() { this.focused = true; }
    });
    const panel = element({});
    const deny = element({ analyticsChoice: 'denied' });
    const grant = element({ analyticsChoice: 'granted' });
    const settings = element({});
    const config = {
        measurementId: 'G-TESTONLY123', enabled: 'true', automaticOutboundDisabled: 'true',
        productionOrigin: 'https://pricerecall.com', pageUrl: 'https://pricerecall.com/blog/example/',
        storeUrl: store, ...options.config
    };
    const window = {
        location: new URL(options.url || 'https://pricerecall.com/?email=NEVER_SEND#PRIVATE'),
        localStorage: {
            getItem(name) { if (options.storageError) throw Error('blocked'); return values.get(name) ?? null; },
            setItem(name, value) { if (options.storageError) throw Error('blocked'); values.set(name, value); }
        },
        addEventListener(type, callback) { listeners['window:' + type] = callback; }
    };
    const document = {
        currentScript: { dataset: config }, referrer: options.referrer || '',
        head: { appendChild(script) { scripts.push(script); } },
        createElement() { return {}; },
        getElementById(id) { return id === 'analytics-consent' ? panel : null; },
        querySelectorAll(selector) { return selector === '[data-analytics-choice]' ? [deny, grant] : [settings]; },
        addEventListener(type, callback) { listeners[type] = callback; },
        set cookie(value) { cookieWrites.push(value); }
    };
    const context = createContext({ window, document, URL, Date });
    const run = () => runInContext(source, context);
    run();
    const calls = () => Array.from(window.dataLayer || [], item => Array.from(item));
    const events = name => calls().filter(item => item[0] === 'event' && item[1] === name);
    const choose = value => (value === 'granted' ? grant : deny).handlers.click();
    const load = () => scripts[0].onload();
    const click = (href, extra = {}) => {
        const event = { button: 0, defaultPrevented: false,
            target: { closest: () => href ? { href } : null }, ...extra };
        listeners.click?.(event);
        return event;
    };
    return { window, document, scripts, cookieWrites, values, panel, deny, grant, settings,
        calls, events, choose, load, click, run,
        storage(value, storageKey = key) { listeners['window:storage']({ key: storageKey, newValue: value }); }
    };
}

test('동의 전·거부 시 Google script와 측정 요청이 없고 설치 클릭을 막지 않는다', () => {
    const f = fixture();
    assert.equal(f.panel.hidden, false);
    assert.equal(f.scripts.length, 0);
    assert.equal(f.calls().length, 0);
    f.choose('denied');
    assert.equal(f.scripts.length, 0);
    assert.equal(f.panel.hidden, true);
    assert.equal(f.values.get(key), 'denied');
    assert.equal(f.click(store).defaultPrevented, false);
    assert.equal(f.events('click').length, 0);
});

test('허용 후 SDK가 준비되면 안전한 page_view를 한 번만 보낸다', () => {
    const f = fixture({ referrer: 'https://user:password@www.google.com/search?q=SECRET_EMAIL#SECRET' });
    f.choose('granted');
    assert.equal(f.scripts.length, 1);
    assert.equal(f.events('page_view').length, 0);
    assert.equal(f.scripts[0].referrerPolicy, 'origin');
    f.load();
    f.choose('granted');
    assert.equal(f.events('page_view').length, 1);
    const config = f.calls().find(row => row[0] === 'config')[2];
    assert.equal(config.send_page_view, false);
    assert.equal(config.allow_google_signals, false);
    assert.equal(config.allow_ad_personalization_signals, false);
    assert.equal(config.page_location, 'https://pricerecall.com/blog/example/');
    assert.equal(config.page_referrer, 'https://www.google.com/');
    assert.equal('debug_mode' in config, false);
    assert.equal('debug_mode' in f.events('page_view')[0][2], false);
    assert.equal(/SECRET|NEVER_SEND|password|email=/.test(JSON.stringify(f.calls())), false);
});

test('정확한 앱 클릭만 canonical 목적지로 한 번 보내며 navigation은 막지 않는다', () => {
    const f = fixture({ consent: 'granted' }); f.load();
    const event = f.click(store + '?authentication=SECRET#PRIVATE');
    for (const href of ['https://apps.apple.com/kr/app/id67680310930',
        'https://apps.apple.com.evil.example/kr/app/id6768031093',
        'http://apps.apple.com/kr/app/id6768031093', 'https://github.com/soulwawa/price-recal',
        'mailto:PRIVATE@example.com', 'https://user:secret@apps.apple.com/kr/app/id6768031093']) f.click(href);
    f.click(store, { defaultPrevented: true });
    f.click(store, { button: 1 });
    assert.equal(f.events('click').length, 1);
    const payload = f.events('click')[0][2];
    assert.equal(payload.link_url, store);
    assert.equal(payload.link_domain, 'apps.apple.com');
    assert.equal(payload.outbound, true);
    assert.equal('debug_mode' in payload, false);
    assert.equal(event.defaultPrevented, false);
    assert.equal(/SECRET|PRIVATE|authentication/.test(JSON.stringify(payload)), false);
});

test('거부로 변경하면 전송을 중지하고 GA 쿠키만 만료한다', () => {
    const f = fixture({ consent: 'granted' }); f.load();
    f.choose('denied'); f.click(store);
    assert.equal(f.window['ga-disable-G-TESTONLY123'], true);
    assert.equal(f.events('click').length, 0);
    assert.equal(f.cookieWrites.every(cookie => /^_ga(?:_TESTONLY123)?=; Max-Age=0;/.test(cookie)), true);
    let prevented = false;
    f.settings.handlers.click({ preventDefault() { prevented = true; } });
    assert.equal(prevented, true);
    assert.equal(f.panel.hidden, false);
    assert.equal(f.deny.focused, true);
    f.choose('granted'); f.click(store);
    assert.equal(f.scripts.length, 1);
    assert.equal(f.events('page_view').length, 1);
    assert.equal(f.events('click').length, 1);
});

test('SDK 로딩 중 거부·재허용에도 동의 없이 전송하지 않고 다시 허용할 수 있다', () => {
    const f = fixture(); f.choose('granted'); f.choose('denied'); f.load();
    assert.equal(f.events('page_view').length, 0);
    f.choose('granted');
    assert.equal(f.events('page_view').length, 1);
    assert.equal(f.scripts.length, 1);
});

test('다른 탭의 거부 또는 저장소 초기화를 현재 탭에도 반영한다', () => {
    const f = fixture({ consent: 'granted' }); f.load();
    f.storage('denied'); f.click(store);
    assert.equal(f.events('click').length, 0);
    f.storage('granted'); f.click(store);
    assert.equal(f.events('click').length, 1);
    f.storage(null, null); f.click(store);
    assert.equal(f.events('click').length, 1);
    assert.equal(f.panel.hidden, false);
});

test('로컬·미리보기·유사 hostname에서는 동의해도 전송하지 않는다', () => {
    for (const url of ['http://127.0.0.1:4000/', 'http://localhost:4000/',
        'https://soulwawa.github.io/', 'https://www.pricerecall.com/',
        'https://pricerecall.com.evil.example/', 'http://pricerecall.com/']) {
        const f = fixture({ url, consent: 'granted' });
        f.choose('granted');
        assert.equal(f.scripts.length, 0, url);
        assert.equal(f.calls().length, 0, url);
    }
});

test('debug 방문만 debug_mode:true로 구분하며 쿼리 자체는 보내지 않는다', () => {
    const f = fixture({ url: 'https://pricerecall.com/?analytics_debug=1&email=PRIVATE', consent: 'granted' });
    f.load(); f.click(store);
    assert.equal(f.events('page_view')[0][2].debug_mode, true);
    assert.equal(f.events('click')[0][2].debug_mode, true);
    assert.equal(/PRIVATE|analytics_debug|email=/.test(JSON.stringify(f.calls())), false);
});

test('잘못된 설정·미확인 자동측정 중지·중복 script 실행은 추가 요청을 만들지 않는다', () => {
    for (const config of [{ measurementId: '' }, { measurementId: 'INVALID' },
        { enabled: 'false' }, { automaticOutboundDisabled: 'false' },
        { productionOrigin: 'https://other.example' }, { pageUrl: 'https://other.example/' }]) {
        const f = fixture({ config, consent: 'granted' });
        assert.equal(f.scripts.length, 0);
    }
    const f = fixture({ consent: 'granted' }); f.load(); f.run(); f.click(store);
    assert.equal(f.scripts.length, 1);
    assert.equal(f.events('page_view').length, 1);
    assert.equal(f.events('click').length, 1);
});

test('저장소 차단이나 유효하지 않은 동의 값에서도 기본 거부이며 사이트가 중단되지 않는다', () => {
    for (const options of [{ storageError: true }, { consent: 'unknown' }]) {
        const f = fixture(options);
        assert.equal(f.scripts.length, 0);
        assert.equal(f.panel.hidden, false);
        f.choose('denied');
        assert.equal(f.scripts.length, 0);
    }
});
