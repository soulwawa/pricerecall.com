(() => {
    'use strict';

    const config = document.currentScript?.dataset;
    if (!config || !/^G-[A-Z0-9]+$/.test(config.measurementId || '') ||
        config.enabled !== 'true' || config.automaticOutboundDisabled !== 'true' ||
        window.priceRecallAnalyticsInitialized) return;

    const panel = document.getElementById('analytics-consent');
    const choices = document.querySelectorAll('[data-analytics-choice]');
    const settings = document.querySelectorAll('[data-analytics-settings]');
    if (!panel || choices.length !== 2) return;

    let origin, page, store;
    try {
        origin = new URL(config.productionOrigin);
        page = new URL(config.pageUrl);
        store = new URL(config.storeUrl);
    } catch { return; }
    if (origin.origin !== 'https://pricerecall.com' || page.origin !== origin.origin ||
        store.origin !== 'https://apps.apple.com' ||
        !/\/id6768031093\/?$/.test(store.pathname)) return;

    window.priceRecallAnalyticsInitialized = true;
    const production = window.location.origin === origin.origin;
    const storageKey = 'pricerecall.analytics-consent.v1';
    const disableKey = 'ga-disable-' + config.measurementId;
    const validChoice = value => ['granted', 'denied'].includes(value) ? value : null;
    let consent = null;
    try { consent = validChoice(window.localStorage.getItem(storageKey)); } catch {}
    let loading = false;
    let sdkReady = false;
    let configured = false;
    let pageViewSent = false;

    let referrer = '';
    try {
        const source = new URL(document.referrer);
        if (['https:', 'http:'].includes(source.protocol)) referrer = source.origin + '/';
    } catch {}
    // Jekyll이 만든 주소만 사용해 방문 URL의 쿼리·fragment·임의 경로가 전송되지 않게 한다.
    const common = { page_location: page.origin + page.pathname, page_referrer: referrer };
    if (new URL(window.location.href).searchParams.get('analytics_debug') === '1') {
        common.debug_mode = true;
    }
    const canMeasure = () => production && consent === 'granted';
    function gtag() { window.dataLayer.push(arguments); }

    function disable() {
        window[disableKey] = true;
        for (const name of ['_ga', '_ga_' + config.measurementId.slice(2)]) {
            for (const domain of ['', window.location.hostname, '.' + window.location.hostname]) {
                document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax; Secure' +
                    (domain ? '; Domain=' + domain : '');
            }
        }
    }

    function pageView() {
        if (!canMeasure() || !configured || pageViewSent) return;
        pageViewSent = true;
        gtag('event', 'page_view', { ...common, send_to: config.measurementId });
    }

    function configure() {
        if (!canMeasure() || !sdkReady) return;
        if (!configured) {
            gtag('js', new Date());
            gtag('set', common);
            gtag('config', config.measurementId, {
                ...common, send_page_view: false,
                allow_google_signals: false, allow_ad_personalization_signals: false,
                cookie_flags: 'SameSite=Lax;Secure'
            });
            configured = true;
        }
        pageView();
    }

    function enable() {
        if (!canMeasure()) return;
        window[disableKey] = false;
        if (sdkReady) { configure(); return; }
        if (loading) return;
        loading = true;
        window.dataLayer = window.dataLayer || [];
        window.gtag = gtag;
        gtag('consent', 'default', {
            analytics_storage: 'denied', ad_storage: 'denied',
            ad_user_data: 'denied', ad_personalization: 'denied'
        });
        gtag('consent', 'update', { analytics_storage: 'granted' });
        const tag = document.createElement('script');
        tag.async = true;
        tag.referrerPolicy = 'origin';
        tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + config.measurementId;
        tag.onload = () => {
            sdkReady = true;
            configure();
        };
        document.head.appendChild(tag);
    }

    function applyChoice(value) {
        consent = validChoice(value);
        panel.hidden = consent !== null;
        if (canMeasure()) enable(); else disable();
    }

    for (const button of choices) button.addEventListener('click', () => {
        const value = validChoice(button.dataset.analyticsChoice);
        if (!value) return;
        try { window.localStorage.setItem(storageKey, value); } catch {}
        applyChoice(value);
        settings[0]?.focus();
    });
    for (const link of settings) link.addEventListener('click', event => {
        event.preventDefault();
        panel.hidden = false;
        choices[0].focus();
    });
    window.addEventListener('storage', event => {
        if (event.key === storageKey || event.key === null) applyChoice(event.newValue);
    });

    document.addEventListener('click', event => {
        if (!canMeasure() || !configured || event.defaultPrevented || event.button > 0) return;
        const anchor = event.target?.closest?.('a[href]');
        if (!anchor) return;
        let destination;
        try { destination = new URL(anchor.href, window.location.href); } catch { return; }
        if (destination.origin !== store.origin || destination.username || destination.password ||
            !/\/id6768031093\/?$/.test(destination.pathname)) return;
        gtag('event', 'click', {
            ...common, send_to: config.measurementId, outbound: true,
            link_domain: destination.hostname,
            link_url: store.origin + store.pathname
        });
    });

    applyChoice(consent);
})();
