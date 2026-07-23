/* Sky Frequency site assistant — self-contained, rule-based chat widget.
   No external services or APIs. Injects its own styles and DOM.
   Content source: client FAQ doc "SFN Frequently Asked Questions for Chatbot" (2026-07-16). */
(function () {
  "use strict";
  if (window.__sfChatLoaded) return;
  window.__sfChatLoaded = true;

  /* ---------- brand / contact ---------- */
  var NAVY = "#192546";
  var BLUE = "#2ea3f2";
  var PHONE_LINK = '<a href="tel:601-707-7228">(601) 707-7228</a>';
  var EMAIL_LINK = '<a href="mailto:sales@skyfreq.com">sales@skyfreq.com</a>';
  var CONTACT_LINK = '<a href="/contact-us/">Contact Form</a>';
  var CTA = "<br><br>Complete our " + CONTACT_LINK + " or call us at " + PHONE_LINK + ".";

  var SERVICES_HTML =
    "SkyFrequency is a full-service Technology Systems Integrator. We design, install, support and maintain:" +
    "<ul>" +
    '<li><a href="/services/video-surveillance-systems/">CCTV Video Surveillance</a></li>' +
    "<li>Access Control</li>" +
    '<li><a href="/services/alarm-fire-monitor-services/">Alarm Systems &amp; Monitoring</a></li>' +
    '<li><a href="/services/phone-services/">Business Phone Systems (VoIP)</a></li>' +
    "<li>High-Speed Business Internet</li>" +
    "<li>Structured Cabling (CAT6, Fiber &amp; Coax)</li>" +
    '<li><a href="/services/it-services/">IT Services &amp; Managed Support</a></li>' +
    '<li><a href="/services/home-entertainment/">Audio/Visual Systems</a></li>' +
    "<li>Wireless Networking &amp; Point-to-Point Links</li>" +
    '<li><a href="/services/computer-repair/">Computer Repair</a></li>' +
    "</ul>Turnkey solutions — from design and installation to ongoing service. Anything specific I can tell you about?";

  var FLOW_START = "__SF_FLOW__"; // sentinel: start the quote flow

  /* ---------- intents (first match wins, most specific first) ---------- */
  var INTENTS = [
    /* -- phone systems -- */
    { re: /(keep|port|transfer|move).{0,24}(number)/,
      reply: "Yes — in almost every case we can port your existing business phone numbers with no interruption." + CTA },
    { re: /((need|buy|get).{0,16}new phone|new phones|reuse.{0,12}phone|existing phone)/,
      reply: "Not always. Depending on your equipment we can often reuse existing phones, or recommend new IP " +
             "phones — our bundled Phone Service includes new phones in the monthly fee." + CTA },
    { re: /(replace|switch|leave|cancel|drop|from).{0,24}(c ?spire|at&?t|comcast|ringcentral|nextiva|provider|carrier)/,
      reply: "Absolutely. We regularly replace systems from C Spire, AT&amp;T, Comcast, RingCentral, Nextiva and others. " +
             "Most customers get lower monthly costs, better call quality, new phones, a mobile app, text messaging, " +
             "auto attendant and voicemail-to-email." + CTA },

    /* -- pricing (specific before generic, generic before quote flow) -- */
    { re: /(camera|cctv|surveillance).{0,30}(cost|price|how much)|((cost|price|how much).{0,30}(camera|cctv|surveillance))/,
      reply: "Every project is different — camera system pricing depends on the number of cameras, recording " +
             "requirements, building size, cabling and installation complexity. We provide a detailed custom " +
             "proposal after discussing your needs. Want to start a quick quote right here? Just type <b>quote</b>." + CTA },
    { re: /(phone|voip).{0,30}(cost|price|how much)|((cost|price|how much).{0,30}(phone|voip))/,
      reply: "Costs vary with the number of users, phone models and features — and many businesses find they can " +
             "upgrade while <i>reducing</i> their monthly bill. Type <b>quote</b> to start a quick quote." + CTA },
    { re: /(free (estimate|consultation|evaluation|assessment)|is.{0,10}consult.{0,10}free)/,
      reply: "Yes! Consultations and system evaluations are completely free. We'll discuss your needs, review your " +
             "existing systems and provide recommendations and a detailed proposal." + CTA },
    { re: /(price|pricing|cost|how much|rate|fee)/,
      reply: "Every project is quoted individually, and consultations are always free. " +
             "Type <b>quote</b> and I'll gather a few details to speed things up — or reach us directly." + CTA },

    /* -- quote / lead-qualification flow trigger -- */
    { re: /(quote|estimate|proposal|consultation|get started|interested|sign up|buy)/,
      reply: FLOW_START },

    /* -- billing -- */
    { re: /(pay|bill|invoice|payment|owe)/,
      reply: 'You can pay your invoice online through our <a href="/bill-pay/">Bill &amp; Pay portal</a>. ' +
             "Billing question? Call us at " + PHONE_LINK + "." },

    /* -- cabling (before internet: "CAT6 and fiber" must not hit the internet intent) -- */
    { re: /(clean ?up|organize|abandoned|messy|telecom room|cable management)/,
      reply: "Absolutely — customers regularly hire us to organize telecom rooms, remove abandoned cabling, improve " +
             "cable management and prep infrastructure for expansion." + CTA },
    { re: /(cat ?6|cat ?5|fiber optic|coax|cabling|patch panel|network rack|structured)/,
      reply: "Yes — we install CAT6, CAT6A, fiber optic and coax cabling, network racks and patch panels, with full " +
             "cable certification." + CTA },

    /* -- internet -- */
    { re: /(rural|starlink|remote area|out in the country|no (internet|service))/,
      reply: "Often, yes — depending on your location we may recommend fiber, fixed wireless, cable or Starlink " +
             "Business Internet." + CTA },
    { re: /(internet|fiber|bandwidth|broadband|wifi|wi-fi|wireless)/,
      reply: "Yes — we provide high-speed business Internet, from basic office connections to enterprise fiber, plus " +
             "Wi-Fi and point-to-point wireless links. We recommend the best option for your location and handle the " +
             "order, installation, invoicing and management." + CTA },

    /* -- cameras -- */
    { re: /(how long|store|storage|retention|recorded|keep.{0,12}video)/,
      reply: "Typical systems store video for 30 to 90 days, depending on camera count, recording quality and your " +
             "retention requirements — longer periods can be designed." + CTA },
    { re: /(view|watch|see).{0,24}(camera|video|phone|remote)/,
      reply: "Yes — you can securely view live and recorded video from virtually anywhere on your smartphone, tablet " +
             "or computer." + CTA },
    { re: /(camera|surveillance|cctv|video security|ptz|license plate|thermal)/,
      reply: "We install commercial-grade surveillance systems from industry leaders like Hanwha Vision — indoor, " +
             "outdoor, PTZ and thermal cameras, license plate recognition, AI analytics, cloud monitoring and mobile " +
             'viewing. See <a href="/services/video-surveillance-systems/">Video Surveillance</a>.' + CTA },

    /* -- access control -- */
    { re: /(unlock|access control|badge|key ?fob|card reader|pin pad|biometric|door)/,
      reply: "Yes — our access control systems include card readers, key fobs, PIN pads, mobile credentials and " +
             "biometric readers. Authorized users can unlock doors remotely, add or remove users, get alerts, view " +
             "entry history and manage multiple locations from a phone." + CTA },

    /* -- alarms -- */
    { re: /(alarm|intrusion|burglar|motion|glass break|panic|fire|smoke|monitor)/,
      reply: "Yes — we install commercial intrusion alarm systems: door contacts, motion detectors, glass-break " +
             "sensors, panic buttons, fire integration, mobile notifications and 24/7 professional monitoring. " +
             'See <a href="/services/alarm-fire-monitor-services/">Alarm &amp; Fire Monitoring</a>.' + CTA },

    /* -- phones generic -- */
    { re: /(voip|phone system|business phone|pbx|landline|phone service|phone line|telephone)/,
      reply: "We install and support VoIP business phone systems and hosted PBX — with mobile apps, text messaging, " +
             "auto attendant and voicemail-to-email. Most customers cut their monthly costs. " +
             'Details: <a href="/services/phone-services/">Phone Services</a>.' + CTA },

    /* -- IT -- */
    { re: /(managed it|it (service|support)|server|firewall|microsoft|365|cyber|backup|help ?desk|network)/,
      reply: "Yes — our IT services cover network and server support, Microsoft 365, Wi-Fi, firewalls, PC support, " +
             "remote monitoring, cybersecurity and backup solutions. " +
             'See <a href="/services/it-services/">IT Services</a>.' + CTA },

    /* -- computer repair -- */
    { re: /(computer|laptop|pc|mac|virus|malware|screen|data recovery|repair)/,
      reply: "We repair computers and laptops with fast turnaround and low out-of-warranty prices — bring it to us in " +
             'Madison or we can come to you. <a href="/services/computer-repair/">Computer Repair</a>.' + CTA },

    /* -- A/V -- */
    { re: /(audio|visual|a\/v|av system|home theater|theatre|entertainment|tv|television|speaker|sound|surround)/,
      reply: "We design and install audio/visual systems — home theater, sound and smart TV setups for businesses and " +
             'homes. See <a href="/services/home-entertainment/">Home Entertainment</a>.' + CTA },

    /* -- maintenance / emergency -- */
    { re: /(emergency|urgent|critical|outage|down right now|asap|help now|failover)/,
      reply: "If you're experiencing a critical outage, contact us immediately at " + PHONE_LINK + " and we'll " +
             "prioritize getting you back online. We also set up failover systems to mitigate Internet outages." },
    { re: /(maintenance|after install|ongoing|support (plan|after)|warranty)/,
      reply: "Yes — we provide on-demand service and support after installation. One call, and it's handled." + CTA },

    /* -- company -- */
    { re: /(what (does|do|is|are) (skyfreq\w*|sky ?frequency|you|y'?all)|what do (you|y'?all) do|about (you|the company|skyfreq)|who are you|integrator)/,
      reply: SERVICES_HTML },
    { re: /(what|which).{0,20}(business|industr|client|customer|compan).{0,12}(serve|work)/,
      reply: "We work with organizations of every size — retail, convenience stores, restaurants, offices, " +
             "warehouses, manufacturing, healthcare, churches, schools, municipalities, hospitality, property " +
             "management, fitness centers and multi-location businesses. One location or hundreds, we can help." + CTA },
    { re: /(outside mississippi|other state|southeast|alabama|louisiana|tennessee|arkansas|how far|travel|service area|do you serve)/,
      reply: "We're based in Madison, Mississippi and serve customers throughout Mississippi and across the " +
             "Southeast for many of our technology solutions." + CTA },
    { re: /(why (choose|pick|go with)|better than|vs\.? (national|competitors)|local (provider|company))/,
      reply: "One trusted technology partner: experienced local support, turnkey installation, commercial-grade " +
             "equipment, competitive pricing and fast response times — and unlike national providers, we design, " +
             "install, service and support your systems ourselves. One point of contact for everything." + CTA },
    { re: /(size|small|large|big|enterprise|how many location|multi.?location|project)/,
      reply: "Any size — from a single office phone system to a complete technology solution across hundreds of " +
             "locations. We design to fit your business and budget." + CTA },
    { re: /(founded|history|how long.{0,16}(business|around)|started|since when|who (owns|runs|founded))/,
      reply: "SkyFrequency is a technology systems integrator headquartered in Madison, MS, led by founders Wade " +
             "Spooner and Ted Parsons — decades of combined communications-industry experience, BBB-accredited " +
             'since 2014. More on our <a href="/about/">About page</a>.' },
    { re: /(where|location|address|directions|office|find you|madison)/,
      reply: "Our corporate office is at <b>953 HWY 51, Suite 2C, Madison, MS 39110</b> — serving all of Mississippi " +
             "and the Southeast. " +
             '<a href="https://maps.google.com/maps?q=953%20HWY%2051%20Suite%202C%20Madison%2C%20MS%2039110" target="_blank" rel="noopener">Get directions</a>.' },
    { re: /(hour|open|close|when.*(open|available)|weekend|saturday|sunday)/,
      reply: "We're open <b>8:00 AM – 8:00 PM, Monday through Friday</b>, closed Saturday and Sunday. " +
             "You can send a message any time through our " + CONTACT_LINK + "." },
    { re: /(service|offer|solutions|do you (do|have|sell|install)|what.*(can|do) (you|y'?all))/,
      reply: SERVICES_HTML },
    { re: /(team|staff|technician|who works)/,
      reply: 'Meet our leadership team on the <a href="/about/">About page</a> — Wade Spooner (President/CEO), ' +
             "Ted Parsons (EVP/CMO) and Wesley Spooner (EVP, IT &amp; Network Operations)." },
    { re: /(job|career|hiring|work for)/,
      reply: "We don't post openings on the site, but you're welcome to reach out at " + EMAIL_LINK + "." },
    { re: /(contact|reach|call|email|talk|speak|human|person|representative)/,
      reply: "You can reach us at " + PHONE_LINK + ", email " + EMAIL_LINK + ", or use our " + CONTACT_LINK +
             " — one of our technology consultants will follow up shortly." },
    { re: /(thank|thanks|appreciate)/,
      reply: "You're welcome! Anything else I can help with?" },
    { re: /(bye|goodbye|see you|later|that'?s all|done)/,
      reply: "Thanks for stopping by! If you need us, we're at " + PHONE_LINK + ". Have a great day!" },
    { re: /^(hi|hey|hello|howdy|good (morning|afternoon|evening))\b/,
      reply: "Hi there! I can help with our services, pricing, hours, location or billing — or type <b>quote</b> " +
             "to start a quick project quote. What can I do for you?" }
  ];

  var FALLBACK =
    "I'm not sure about that one — I'm a simple assistant! I can answer questions about our " +
    '<a href="/services/">services</a>, pricing, hours, location or billing, or type <b>quote</b> to start a ' +
    "quick quote. For anything else, call " + PHONE_LINK + " or use our " + CONTACT_LINK + ".";

  var GREETING =
    "Hi! Welcome to SkyFrequency — Mississippi's single-source technology partner. Ask me about our services, " +
    "pricing or hours, or type <b>quote</b> to tell us about your project. How can I help?";

  var CHIPS = [
    ["Our services", "What services do you offer?"],
    ["Get a quote", "quote"],
    ["Hours & location", "What are your hours?"],
    ["Pay my bill", "How do I pay my bill?"],
    ["Contact us", "How do I contact you?"]
  ];

  /* ---------- lead-qualification quote flow (no backend: hands off via email) ---------- */
  var FLOW_STEPS = [
    { key: "Business type",       q: "Happy to help! First — what type of business do you have?" },
    { key: "Services interested", q: "Which services are you interested in? (Business phones, Internet, CCTV, access control, alarm, cabling, IT, audio/visual — any or all!)" },
    { key: "Project type",        q: "Is this a <b>new installation</b>, a <b>replacement</b>, or an <b>expansion</b>?" },
    { key: "Locations / users",   q: "About how many locations and employees/users would this cover?" },
    { key: "City",                q: "What city is the project located in?" },
    { key: "Target date",         q: "Do you have a target completion date? (It's fine if not!)" }
  ];
  var flow = null; // {step: n, answers: []}

  function flowSummary() {
    var lines = FLOW_STEPS.map(function (s, i) { return s.key + ": " + flow.answers[i]; });
    var body = "Quote request from the SkyFreq.com chat assistant\n\n" + lines.join("\n") +
               "\n\nBest phone number and email to reach me:\n";
    var mailto = "mailto:sales@skyfreq.com?subject=" +
                 encodeURIComponent("Quote Request from Website Chat") +
                 "&body=" + encodeURIComponent(body);
    var esc = lines.map(function (l) {
      return l.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }).join("<br>");
    return "Perfect — here's what I've got:<br><br><i>" + esc + "</i><br><br>" +
           'To get your custom proposal, <a href="' + mailto + '">click here to email this to our team</a> ' +
           "(just add your name and number), or use our " + CONTACT_LINK + " — or call " + PHONE_LINK +
           " and we'll take it from there. A technology consultant will follow up quickly!";
  }

  function handleFlow(text) {
    if (/(cancel|never ?mind|stop|exit|quit|forget it)/i.test(text)) {
      flow = null;
      return "No problem — quote canceled. Anything else I can help with?";
    }
    flow.answers.push(text);
    if (flow.answers.length >= FLOW_STEPS.length) {
      var out = flowSummary();
      flow = null;
      return out;
    }
    return FLOW_STEPS[flow.answers.length].q;
  }

  function startFlow() {
    flow = { answers: [] };
    return FLOW_STEPS[0].q + "<br><small>(You can type <b>cancel</b> at any point.)</small>";
  }

  function answer(text) {
    var t = text.toLowerCase().replace(/[^\w\s&'\/?.-]/g, " ");
    for (var i = 0; i < INTENTS.length; i++) {
      if (INTENTS[i].re.test(t)) return INTENTS[i].reply;
    }
    return FALLBACK;
  }

  /* ---------- styles ---------- */
  var css =
  "#sfchat-bubble{position:fixed;right:20px;bottom:20px;width:62px;height:62px;min-width:62px;padding:0;" +
    "box-sizing:border-box;border-radius:50%;line-height:1;" +
    "background:" + BLUE + " !important;border:2px solid #fff;cursor:pointer;" +
    "box-shadow:0 4px 18px rgba(0,0,0,.45);" +
    "z-index:99998;display:flex;align-items:center;justify-content:center;transition:transform .15s}" +
  "#sfchat-bubble:hover{transform:scale(1.08);background:" + BLUE + " !important}" +
  "#sfchat-bubble svg{width:30px;height:30px;fill:#fff !important;display:block}" +
  "#sfchat-bubble svg path{fill:#fff !important}" +
  "#sfchat-badge{position:absolute;top:-4px;right:-4px;width:20px;height:20px;border-radius:50%;" +
    "background:#e53935;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;" +
    "justify-content:center;border:2px solid #fff;box-sizing:border-box;" +
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}" +
  "#sfchat-label{position:fixed;right:20px;bottom:90px;background:#fff;color:" + NAVY + ";" +
    "font-size:13px;font-weight:700;padding:7px 14px;border-radius:16px;z-index:99998;" +
    "box-shadow:0 3px 12px rgba(0,0,0,.35);pointer-events:none;" +
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}" +
  ".sfchat-hidden{display:none !important}" +
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
  bubble.style.position = "fixed"; // guard against site button styles
  bubble.setAttribute("aria-label", "Chat with Sky Frequency");
  bubble.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true" fill="#fff"><path fill="#fff" d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-9 9H7V9h4v2zm6 0h-4V9h4v2z"/></svg>' +
    '<span id="sfchat-badge" aria-hidden="true">1</span>';

  var label = document.createElement("div");
  label.id = "sfchat-label";
  label.setAttribute("aria-hidden", "true");
  label.textContent = "Chat Now";

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
  document.body.appendChild(label);
  document.body.appendChild(panel);

  /* once the visitor has opened the chat, stop nagging for the rest of the visit */
  function hideAttention() {
    label.classList.add("sfchat-hidden");
    var badge = document.getElementById("sfchat-badge");
    if (badge) badge.classList.add("sfchat-hidden");
    sessionStorage.setItem("sfchat-seen", "1");
  }
  if (sessionStorage.getItem("sfchat-seen") === "1") hideAttention();

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
      var reply;
      if (flow) {
        reply = handleFlow(text);
      } else {
        reply = answer(text);
        if (reply === FLOW_START) reply = startFlow();
      }
      addMsg("bot", reply);
    }, 450 + Math.random() * 350);
  }

  function openPanel() {
    hideAttention();
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
