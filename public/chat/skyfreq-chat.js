/* Sky Frequency site assistant — self-contained, rule-based chat widget.
   No external services or APIs. Injects its own styles and DOM.        */
(function () {
  "use strict";
  if (window.__sfChatLoaded) return;
  window.__sfChatLoaded = true;

  /* ---------- brand ---------- */
  var NAVY = "#192546";
  var BLUE = "#2ea3f2";
  var PHONE = "601-707-7228";
  var PHONE_LINK = '<a href="tel:601-707-7228">601-707-7228</a>';
  var EMAIL_LINK = '<a href="mailto:sales@skyfreq.com">sales@skyfreq.com</a>';
  var CONTACT_LINK = '<a href="/contact-us/">contact form</a>';

  var SERVICES_HTML =
    "Here's what we offer:" +
    '<ul>' +
    '<li><a href="/services/phone-services/">VoIP &amp; Business Phone Systems</a></li>' +
    '<li><a href="/services/it-services/">Managed IT Services</a></li>' +
    '<li><a href="/services/computer-repair/">Computer Repair</a></li>' +
    '<li><a href="/services/video-surveillance-systems/">Video Surveillance</a></li>' +
    '<li><a href="/services/alarm-fire-monitor-services/">Alarm &amp; Fire Monitoring</a></li>' +
    '<li><a href="/services/home-entertainment/">Home Entertainment</a></li>' +
    "</ul>Anything specific you'd like to know more about?";

  /* ---------- intents (first match wins, most specific first) ---------- */
  var INTENTS = [
    { re: /(price|pricing|cost|how much|quote|estimate|rate|fee)/,
      reply: "Pricing depends on the size of the job, so we quote each one individually. " +
             "The fastest way to get a number is to call us at " + PHONE_LINK +
             " or use our " + CONTACT_LINK + " and we'll get right back to you." },

    { re: /(pay|bill|invoice|payment|owe)/,
      reply: 'You can pay your invoice online through our <a href="/bill-pay/">Bill &amp; Pay portal</a>. ' +
             "If you have a billing question, call us at " + PHONE_LINK + "." },

    { re: /(voip|phone system|business phone|pbx|landline|phone service|phone line|telephone)/,
      reply: "We install and support VoIP and hosted PBX phone systems — crystal-clear lines that " +
             "use your internet connection and usually cost less than traditional phone service. " +
             'Details here: <a href="/services/phone-services/">Phone Services</a>.' },

    { re: /(managed it|it service|it support|network|server|firewall|cabling|help ?desk|wifi|wi-fi|internet|email)/,
      reply: "Our IT services cover network design, cabling, firewall security, help desk and ongoing " +
             'support — from installation to maintenance. See <a href="/services/it-services/">IT Services</a>.' },

    { re: /(computer|laptop|pc|mac|virus|malware|screen|data recovery|repair)/,
      reply: "We repair computers and laptops with fast turnaround and low out-of-warranty prices. " +
             "Bring it to us in Madison or we can come to you. " +
             'More here: <a href="/services/computer-repair/">Computer Repair</a>.' },

    { re: /(camera|surveillance|cctv|video security)/,
      reply: "We design, install and service video surveillance systems for homes and businesses. " +
             'Take a look: <a href="/services/video-surveillance-systems/">Video Surveillance</a>.' },

    { re: /(alarm|fire|monitor|burglar|smoke)/,
      reply: "We provide 24/7 alarm and fire monitoring with constant alerts, around the clock. " +
             'Details: <a href="/services/alarm-fire-monitor-services/">Alarm &amp; Fire Monitoring</a>.' },

    { re: /(home theater|theatre|entertainment|tv|television|audio|speaker|sound|surround)/,
      reply: "We design and install home theater, audio and smart TV systems for your home or office. " +
             'See <a href="/services/home-entertainment/">Home Entertainment</a>.' },

    { re: /(service|offer|do you (do|have|sell|install)|what.*(can|do) (you|y'?all))/,
      reply: SERVICES_HTML },

    { re: /(hour|open|close|when.*(open|available)|weekend|saturday|sunday)/,
      reply: "We're open <b>8:00 AM – 8:00 PM, Monday through Friday</b>. Closed Saturday and Sunday. " +
             "You can leave a message any time through our " + CONTACT_LINK + "." },

    { re: /(where|location|address|directions|office|madison|find you)/,
      reply: "We're at <b>953 HWY 51, Suite 2C, Madison, MS 39110</b>. " +
             '<a href="https://maps.google.com/maps?q=953%20HWY%2051%20Suite%202C%20Madison%2C%20MS%2039110" target="_blank" rel="noopener">Get directions</a>.' },

    { re: /(area|serve|jackson|ridgeland|mississippi|how far|travel)/,
      reply: "We serve Madison, Ridgeland, Jackson and businesses across central Mississippi. " +
             "Not sure if you're in range? Call us at " + PHONE_LINK + " — odds are we can help." },

    { re: /(founded|history|how long|started|since when|who (is|are|owns|runs)|about (you|the company|skyfreq))/,
      reply: "SkyFrequency is a business communications company based in Madison, MS, led by founders " +
             "Wade Spooner and Ted Parsons — a team with decades of combined experience in the " +
             "communications industry, and BBB-accredited since 2014. " +
             'More on our <a href="/about/">About page</a>.' },

    { re: /(team|staff|technician|who works)/,
      reply: 'You can meet the people behind SkyFrequency on our <a href="/team/">Team page</a>.' },

    { re: /(emergency|urgent|down|not working|broken|outage|asap|help now)/,
      reply: "Sorry you're dealing with that — the fastest way to reach us is by phone: " + PHONE_LINK +
             ". We're available 8 AM – 8 PM, Monday through Friday." },

    { re: /(contact|reach|call|email|talk|speak|human|person|representative)/,
      reply: "You can reach us at " + PHONE_LINK + ", email " + EMAIL_LINK +
             ", or use our " + CONTACT_LINK + " and we'll follow up shortly." },

    { re: /(thank|thanks|appreciate)/,
      reply: "You're welcome! Anything else I can help with?" },

    { re: /(bye|goodbye|see you|later|done)/,
      reply: "Thanks for stopping by! If you need us, we're at " + PHONE_LINK + ". Have a great day!" },

    { re: /^(hi|hey|hello|howdy|good (morning|afternoon|evening))\b/,
      reply: "Hi there! I can help with our services, pricing, hours, location or billing. What can I do for you?" },

    { re: /(job|career|hiring|work for)/,
      reply: "We don't post openings on the site, but you're welcome to reach out at " + EMAIL_LINK + "." }
  ];

  var FALLBACK =
    "I'm not sure about that one — I'm a simple assistant! I can help with our " +
    '<a href="/services/">services</a>, pricing, hours, location or billing. ' +
    "For anything else, call " + PHONE_LINK + " or use our " + CONTACT_LINK + ".";

  var GREETING =
    "Hi! Welcome to Sky Frequency. I can answer quick questions about our services, " +
    "pricing, hours and more — or point you to a real person. How can I help?";

  var CHIPS = [
    ["Our services", "What services do you offer?"],
    ["Get a quote", "How much does it cost?"],
    ["Hours & location", "What are your hours?"],
    ["Pay my bill", "How do I pay my bill?"],
    ["Contact us", "How do I contact you?"]
  ];

  /* ---------- styles ---------- */
  var css =
  "#sfchat-bubble{position:fixed;right:20px;bottom:20px;width:60px;height:60px;border-radius:50%;" +
    "background:" + NAVY + ";border:none;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.3);" +
    "z-index:99998;display:flex;align-items:center;justify-content:center;transition:transform .15s}" +
  "#sfchat-bubble:hover{transform:scale(1.08)}" +
  "#sfchat-bubble svg{width:28px;height:28px;fill:#fff}" +
  "#sfchat-panel{position:fixed;right:20px;bottom:92px;width:min(360px,calc(100vw - 32px));" +
    "height:min(520px,calc(100vh - 120px));background:#fff;border-radius:12px;z-index:99999;" +
    "box-shadow:0 8px 32px rgba(0,0,0,.35);display:none;flex-direction:column;overflow:hidden;" +
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}" +
  "#sfchat-panel.sfchat-open{display:flex}" +
  "#sfchat-head{background:" + NAVY + ";color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px}" +
  "#sfchat-head .sfchat-dot{width:10px;height:10px;border-radius:50%;background:#38d16a;flex:none}" +
  "#sfchat-head b{font-size:15px;font-weight:700}" +
  "#sfchat-head small{display:block;font-size:11px;opacity:.75;font-weight:400}" +
  "#sfchat-close{margin-left:auto;background:none;border:none;color:#fff;font-size:22px;cursor:pointer;line-height:1;padding:2px 6px}" +
  "#sfchat-msgs{flex:1;overflow-y:auto;padding:14px;background:#f4f6fa}" +
  ".sfchat-msg{max-width:85%;margin:0 0 10px;padding:9px 13px;border-radius:12px;font-size:13.5px;line-height:1.45;word-wrap:break-word}" +
  ".sfchat-bot{background:#fff;color:#222;border:1px solid #e3e7ee;border-bottom-left-radius:4px}" +
  ".sfchat-user{background:" + BLUE + ";color:#fff;margin-left:auto;border-bottom-right-radius:4px}" +
  ".sfchat-bot a{color:" + BLUE + ";font-weight:600;text-decoration:none}" +
  ".sfchat-bot a:hover{text-decoration:underline}" +
  ".sfchat-bot ul{margin:6px 0 4px;padding-left:18px}" +
  ".sfchat-bot li{margin:3px 0}" +
  "#sfchat-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 10px;background:#f4f6fa}" +
  ".sfchat-chip{background:#fff;border:1px solid " + BLUE + ";color:" + BLUE + ";border-radius:16px;" +
    "padding:5px 12px;font-size:12px;cursor:pointer;font-weight:600}" +
  ".sfchat-chip:hover{background:" + BLUE + ";color:#fff}" +
  "#sfchat-form{display:flex;border-top:1px solid #e3e7ee;background:#fff}" +
  "#sfchat-input{flex:1;border:none;padding:13px 14px;font-size:14px;outline:none}" +
  "#sfchat-send{background:none;border:none;color:" + BLUE + ";font-weight:700;font-size:14px;cursor:pointer;padding:0 16px}" +
  ".sfchat-typing{display:inline-block}.sfchat-typing i{display:inline-block;width:6px;height:6px;margin:0 1.5px;" +
    "background:#b8c0cc;border-radius:50%;animation:sfblink 1.2s infinite;font-style:normal}" +
  ".sfchat-typing i:nth-child(2){animation-delay:.2s}.sfchat-typing i:nth-child(3){animation-delay:.4s}" +
  "@keyframes sfblink{0%,80%,100%{opacity:.3}40%{opacity:1}}" +
  "@media (max-width:480px){#sfchat-panel{right:16px;bottom:86px}}";

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------- DOM ---------- */
  var bubble = document.createElement("button");
  bubble.id = "sfchat-bubble";
  bubble.setAttribute("aria-label", "Chat with Sky Frequency");
  bubble.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-9 9H7V9h4v2zm6 0h-4V9h4v2z"/></svg>';

  var panel = document.createElement("div");
  panel.id = "sfchat-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Sky Frequency chat assistant");
  panel.innerHTML =
    '<div id="sfchat-head"><span class="sfchat-dot"></span>' +
    "<div><b>Sky Frequency</b><small>Typically replies instantly</small></div>" +
    '<button id="sfchat-close" aria-label="Close chat">&times;</button></div>' +
    '<div id="sfchat-msgs" role="log" aria-live="polite"></div>' +
    '<div id="sfchat-chips"></div>' +
    '<form id="sfchat-form"><input id="sfchat-input" type="text" placeholder="Type a question..." ' +
    'aria-label="Type your question" autocomplete="off" maxlength="200">' +
    '<button id="sfchat-send" type="submit">Send</button></form>';

  document.body.appendChild(bubble);
  document.body.appendChild(panel);

  var msgs = panel.querySelector("#sfchat-msgs");
  var chipsBox = panel.querySelector("#sfchat-chips");
  var form = panel.querySelector("#sfchat-form");
  var input = panel.querySelector("#sfchat-input");

  /* ---------- state (persists across page loads within the visit) ---------- */
  var KEY = "sfchat-log";
  var history = [];
  try { history = JSON.parse(sessionStorage.getItem(KEY) || "[]"); } catch (e) {}

  function save() {
    try { sessionStorage.setItem(KEY, JSON.stringify(history.slice(-40))); } catch (e) {}
  }

  function addMsg(who, html, skipLog) {
    var d = document.createElement("div");
    d.className = "sfchat-msg sfchat-" + who;
    if (who === "user") { d.textContent = html; } else { d.innerHTML = html; }
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    if (!skipLog) { history.push({ w: who, h: html }); save(); }
    return d;
  }

  function renderChips() {
    chipsBox.innerHTML = "";
    CHIPS.forEach(function (c) {
      var b = document.createElement("button");
      b.className = "sfchat-chip";
      b.type = "button";
      b.textContent = c[0];
      b.addEventListener("click", function () { handleUser(c[1]); });
      chipsBox.appendChild(b);
    });
  }

  function answer(text) {
    var t = text.toLowerCase().replace(/[^\w\s'?-]/g, " ");
    for (var i = 0; i < INTENTS.length; i++) {
      if (INTENTS[i].re.test(t)) return INTENTS[i].reply;
    }
    return FALLBACK;
  }

  function handleUser(text) {
    text = (text || "").trim();
    if (!text) return;
    addMsg("user", text);
    input.value = "";
    var typing = document.createElement("div");
    typing.className = "sfchat-msg sfchat-bot";
    typing.innerHTML = '<span class="sfchat-typing"><i></i><i></i><i></i></span>';
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;
    setTimeout(function () {
      typing.remove();
      addMsg("bot", answer(text));
    }, 450 + Math.random() * 350);
  }

  function openPanel() {
    panel.classList.add("sfchat-open");
    sessionStorage.setItem("sfchat-open", "1");
    if (!msgs.childNodes.length) {
      if (history.length) {
        history.forEach(function (m) { addMsg(m.w, m.h, true); });
      } else {
        addMsg("bot", GREETING);
      }
      renderChips();
    }
    input.focus();
  }

  function closePanel() {
    panel.classList.remove("sfchat-open");
    sessionStorage.setItem("sfchat-open", "0");
  }

  bubble.addEventListener("click", function () {
    panel.classList.contains("sfchat-open") ? closePanel() : openPanel();
  });
  panel.querySelector("#sfchat-close").addEventListener("click", closePanel);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    handleUser(input.value);
  });

  /* restore open state across page navigation */
  if (sessionStorage.getItem("sfchat-open") === "1") openPanel();
})();
