grandmajster:
const MAX_BODY = 8000;
const esc = s => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const cut = (s, n) => String(s ?? '').trim().slice(0, n);
const json = (o, status = 200) =>
new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export default async (req) => {
if (req.method !== 'POST') return json({ ok: false, error: 'method' }, 405);

const origin = req.headers.get('origin');
const host = req.headers.get('x-forwarded-host')  req.headers.get('host')  new URL(req.url).host;
if (origin && new URL(origin).host !== host && origin !== new URL(req.url).origin) return json({ ok: false, error: 'origin' }, 403);

const token = process.env.TG_BOT_TOKEN, chat = process.env.TG_CHAT_ID;
if (!token || !chat) return json({ ok: false, error: 'not_configured' }, 500);

const raw = await req.text();
if (raw.length > MAX_BODY) return json({ ok: false, error: 'too_large' }, 413);
let d;
try { d = JSON.parse(raw); } catch { return json({ ok: false, error: 'bad_json' }, 400); }
if (!d || typeof d !== 'object') return json({ ok: false, error: 'bad_json' }, 400);

if (d.hp) return json({ ok: true });

const name = cut(d.name, 100), contact = cut(d.contact, 150);
if (name.length < 2 || contact.length < 5) return json({ ok: false, error: 'invalid' }, 400);

const rows = [
['Имя', name], ['Контакт', contact], ['Компания', cut(d.company, 150)],
['Сайт / соцсети', cut(d.website, 200)], ['Что нужно', cut(d.need, 60)],
['Задача', cut(d.message, 1500)], ['Страница', cut(d.source, 200)]
].filter(([, v]) => v);
const text = '<b>Новая заявка с сайта KINETIA</b>\n\n' + rows.map(([k, v]) => <b>${k}:</b> ${esc(v)}).join('\n');

let r;
try {
r = await fetch(https://api.telegram.org/bot${token}/sendMessage, {
method: 'POST', headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ chat_id: chat, text, parse_mode: 'HTML', disable_web_page_preview: true })
});
} catch { return json({ ok: false, error: 'telegram_unreachable' }, 502); }
if (!r.ok) return json({ ok: false, error: 'telegram' }, 502);
return json({ ok: true });
};
