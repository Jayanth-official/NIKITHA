// ==========================================================================
// PORTFOLIO LOGIC & INTERACTION - NIKITHA R.
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initTheme();
  initTypewriter();
  initScrollReveal();
  initTabs();
  initAudio();
  initChatbot();
  initMobileNav();
});

/* ==========================================================================
   1. PARTICLES BACKGROUND
   ========================================================================== */
function initParticles() {
  const container = document.getElementById('particles-container');
  if (!container) return;

  const count = 30;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    
    // Random sizes, positions and anim delays
    const size = Math.random() * 6 + 2;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 100}vw`;
    p.style.animationDuration = `${Math.random() * 12 + 8}s`;
    p.style.animationDelay = `${Math.random() * -15}s`;
    
    container.appendChild(p);
  }
}

/* ==========================================================================
   2. THEME CONTROLLER & WICK IMAGE SWAP
   ========================================================================== */
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  const sunIcon = toggle.querySelector('.sun-icon');
  const moonIcon = toggle.querySelector('.moon-icon');

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nikitha-theme', theme);

    if (theme === 'dark') {
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    } else {
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    }
  }

  // Load saved theme or default to dark
  const savedTheme = localStorage.getItem('nikitha-theme') || 'dark';
  setTheme(savedTheme);

  toggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });
}

/* ==========================================================================
   3. TYPEWRITER EFFECT
   ========================================================================== */
function initTypewriter() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;

  const words = [
    "MSc IT Graduate.",
    "Frontend Web Developer.",
    "SQL Database Designer.",
    "Problem Solver."
  ];

  let wordIndex = 0;
  let txt = '';
  let isDeleting = false;

  function type() {
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
      txt = currentWord.substring(0, txt.length - 1);
    } else {
      txt = currentWord.substring(0, txt.length + 1);
    }

    el.textContent = txt;

    let typeSpeed = 100;
    if (isDeleting) {
      typeSpeed /= 2;
    }

    if (!isDeleting && txt === currentWord) {
      typeSpeed = 2000; // Pause at end of word
      isDeleting = true;
    } else if (isDeleting && txt === '') {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typeSpeed = 500; // Pause before typing new word
    }

    setTimeout(type, typeSpeed);
  }

  setTimeout(type, 500);
}

/* ==========================================================================
   4. SCROLL REVEAL & STATS COUNT-UP
   ========================================================================== */
function initScrollReveal() {
  const elements = document.querySelectorAll('.scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-fade');
  const skillsSection = document.getElementById('skills');
  const skillBars = document.querySelectorAll('.progress-bar');
  const statNums = document.querySelectorAll('.stat-num');

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  elements.forEach(el => observer.observe(el));

  // Skills progressive load
  const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        skillBars.forEach(bar => {
          const width = bar.getAttribute('data-width');
          bar.style.width = width;
        });
      }
    });
  }, { threshold: 0.1 });

  if (skillsSection) skillsObserver.observe(skillsSection);

  // Hero Card Stats Count-up
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statNums.forEach(num => {
          const target = parseInt(num.getAttribute('data-val'), 10);
          let current = 0;
          const interval = setInterval(() => {
            current++;
            num.textContent = current;
            if (current >= target) clearInterval(interval);
          }, 150);
        });
      }
    });
  }, { threshold: 0.2 });

  const heroSection = document.getElementById('hero');
  if (heroSection) statsObserver.observe(heroSection);
}

/* ==========================================================================
   5. TABS CONTROLLER (Soft Skills / Hobbies)
   ========================================================================== */
function initTabs() {
  const headers = document.querySelectorAll('.tab-btn');
  const panes = document.querySelectorAll('.tab-pane');

  headers.forEach(header => {
    header.addEventListener('click', () => {
      const tabId = header.getAttribute('data-tab');

      headers.forEach(h => h.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      header.classList.add('active');
      document.getElementById(tabId).classList.add('active');
    });
  });
}

/* ==========================================================================
   6. AMBIENT MUSIC PLAYER (Web Audio API Synthesiser)
   ========================================================================== */
function initAudio() {
  const triggerBtn = document.getElementById('audio-trigger-btn');
  const panel = document.getElementById('audio-panel');
  const closeBtn = document.getElementById('close-audio-btn');
  const playBtn = document.getElementById('audio-play-btn');
  const playSvg = document.getElementById('play-svg');
  const pauseSvg = document.getElementById('pause-svg');
  const volumeSlider = document.getElementById('volume-slider');
  const trackTitle = document.getElementById('music-track-title');
  const vis = document.getElementById('visualizer-bars');
  const btnSynth = document.getElementById('btn-synth-mode');
  const btnLofi = document.getElementById('btn-lofi-mode');

  let audioCtx = null;
  let synthInterval = null;
  let padNode = null;
  let gainNode = null;
  let isPlaying = false;
  let musicMode = 'synth'; // 'synth' or 'lofi'
  let streamAudio = null;

  // Toggle control panel
  triggerBtn.addEventListener('click', () => {
    panel.classList.toggle('active');
  });

  closeBtn.addEventListener('click', () => {
    panel.classList.remove('active');
  });

  // Track select
  btnSynth.addEventListener('click', () => {
    if (musicMode === 'synth') return;
    btnSynth.classList.add('active');
    btnLofi.classList.remove('active');
    stopAudio();
    musicMode = 'synth';
    trackTitle.textContent = "Sound: Procedural Synth";
  });

  btnLofi.addEventListener('click', () => {
    if (musicMode === 'lofi') return;
    btnLofi.classList.add('active');
    btnSynth.classList.remove('active');
    stopAudio();
    musicMode = 'lofi';
    trackTitle.textContent = "Sound: Ambient Lofi";
  });

  // Play / Pause toggle
  playBtn.addEventListener('click', () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  });

  volumeSlider.addEventListener('input', (e) => {
    const val = e.target.value / 100;
    if (gainNode && audioCtx) {
      gainNode.gain.setValueAtTime(val * 0.15, audioCtx.currentTime);
    }
    if (streamAudio) {
      streamAudio.volume = val * 0.3;
    }
  });

  function startAudio() {
    isPlaying = true;
    playSvg.classList.add('hidden');
    pauseSvg.classList.remove('hidden');
    vis.classList.add('playing');

    if (musicMode === 'synth') {
      trackTitle.textContent = "Sound: Procedural Synth";
      playSynth();
    } else {
      trackTitle.textContent = "Sound: Ambient Lofi";
      playLofiStream();
    }
  }

  function stopAudio() {
    isPlaying = false;
    playSvg.classList.remove('hidden');
    pauseSvg.classList.add('hidden');
    vis.classList.remove('playing');
    trackTitle.textContent = "Sound: Off";

    if (synthInterval) {
      clearInterval(synthInterval);
      synthInterval = null;
    }

    if (padNode) {
      try {
        padNode.stop();
      } catch (e) {}
      padNode = null;
    }

    if (streamAudio) {
      streamAudio.pause();
      streamAudio = null;
    }
  }

  // Web Audio Procedural Synthesizer
  function playSynth() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Set master volume node
    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime((volumeSlider.value / 100) * 0.15, audioCtx.currentTime);
    gainNode.connect(audioCtx.destination);

    // 1. Play Soft Pad Chord (C major ambient background)
    playSoftPad();

    // 2. Play Random Pentatonic Melodic Notes
    // Pentatonic scale frequencies: C4, D4, E4, G4, A4, C5
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
    
    // Play initial chime
    playChime(scale[Math.floor(Math.random() * scale.length)]);

    // Interval to trigger random chimes
    synthInterval = setInterval(() => {
      if (!isPlaying || musicMode !== 'synth') return;
      
      // Select random note frequency
      const freq = scale[Math.floor(Math.random() * scale.length)];
      playChime(freq);
    }, 2800);
  }

  function playSoftPad() {
    // Generate low warm harmonic tones
    const rootOsc = audioCtx.createOscillator();
    const fifthOsc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();

    rootOsc.type = 'triangle';
    rootOsc.frequency.setValueAtTime(130.81, audioCtx.currentTime); // C3

    fifthOsc.type = 'triangle';
    fifthOsc.frequency.setValueAtTime(196.00, audioCtx.currentTime); // G3

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, audioCtx.currentTime);

    const padGain = audioCtx.createGain();
    padGain.gain.setValueAtTime(0.3, audioCtx.currentTime);

    rootOsc.connect(filter);
    fifthOsc.connect(filter);
    filter.connect(padGain);
    padGain.connect(gainNode);

    rootOsc.start();
    fifthOsc.start();

    // Assign reference to stop later
    padNode = {
      stop: () => {
        rootOsc.stop();
        fifthOsc.stop();
      }
    };
  }

  function playChime(freq) {
    if (!audioCtx || !gainNode) return;

    const osc = audioCtx.createOscillator();
    const chimeGain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    // Triangle wave has a clean, music-box-like chime sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Warm resonant filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
    filter.Q.setValueAtTime(1, audioCtx.currentTime);

    // Chime ADSR envelope (Attack: 0.1s, Decay/Sustain, Release: 2.5s)
    const now = audioCtx.currentTime;
    chimeGain.gain.setValueAtTime(0, now);
    chimeGain.gain.linearRampToValueAtTime(0.6, now + 0.1);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    osc.connect(filter);
    filter.connect(chimeGain);
    chimeGain.connect(gainNode);

    osc.start(now);
    osc.stop(now + 2.6);
  }

  // Stream lofi track
  function playLofiStream() {
    // Royalty-free peaceful lofi chill track
    streamAudio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    streamAudio.volume = (volumeSlider.value / 100) * 0.3;
    streamAudio.loop = true;
    streamAudio.crossOrigin = "anonymous";
    
    streamAudio.play().catch(err => {
      console.warn("Audio streaming failed, falling back to synthesiser mode.", err);
      // Fallback
      btnSynth.click();
      startAudio();
    });
  }
}

/* ==========================================================================
   7. AI CHATBOT (Professional / Action Personalities)
   ========================================================================== */
function initChatbot() {
  const triggerBtn = document.getElementById('chatbot-trigger-btn');
  const chatContainer = document.getElementById('chatbot-container');
  const closeBtn = document.getElementById('chatbot-close-btn');
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');
  const messages = document.getElementById('chatbot-messages');
  const quickReplies = document.querySelectorAll('.quick-reply-btn');
  const modeBtn = document.getElementById('btn-chatbot-mode-toggle');

  let activePersonality = 'professional'; // 'professional' or 'action' (John Wick style)

  const heroTriggerBtn = document.getElementById('hero-chat-trigger');

  triggerBtn.addEventListener('click', () => {
    chatContainer.classList.toggle('active');
    // Hide notification pulse
    const pulse = triggerBtn.querySelector('.chatbot-pulse');
    if (pulse) pulse.remove();
  });

  if (heroTriggerBtn) {
    heroTriggerBtn.addEventListener('click', () => {
      chatContainer.classList.add('active');
      const pulse = triggerBtn.querySelector('.chatbot-pulse');
      if (pulse) pulse.remove();
    });
  }

  closeBtn.addEventListener('click', () => {
    chatContainer.classList.remove('active');
  });

  // Toggle Bot Personality
  modeBtn.addEventListener('click', () => {
    activePersonality = activePersonality === 'professional' ? 'action' : 'professional';
    if (activePersonality === 'action') {
      modeBtn.textContent = '🕶️';
      modeBtn.title = 'Switch to Professional Mode';
      addBotMessage("Mode updated: John Wick Protocol enabled. Ask me anything... keep it short.");
    } else {
      modeBtn.textContent = '🤵';
      modeBtn.title = 'Switch to Action Mode';
      addBotMessage("Mode updated: Professional AI Assistant online. How can I help you learn about Nikitha today?");
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) return;

    addUserMessage(val);
    input.value = '';
    
    // Simulate thinking delay
    showTypingIndicator();
    setTimeout(() => {
      removeTypingIndicator();
      const response = generateResponse(val);
      addBotMessage(response);
    }, 1000);
  });

  quickReplies.forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-query');
      let text = '';
      if (q === 'skills') text = 'What are her technical skills?';
      else if (q === 'projects') text = 'What academic projects did she build?';
      else if (q === 'internship') text = 'Tell me about her internship.';
      else if (q === 'contact') text = 'How can I contact Nikitha?';
      
      addUserMessage(text);
      showTypingIndicator();
      setTimeout(() => {
        removeTypingIndicator();
        addBotMessage(generateResponse(q));
      }, 800);
    });
  });

  function addUserMessage(text) {
    const msg = document.createElement('div');
    msg.classList.add('chat-message', 'user-msg');
    msg.textContent = text;
    messages.appendChild(msg);
    scrollToBottom();
  }

  function addBotMessage(text) {
    const msg = document.createElement('div');
    msg.classList.add('chat-message', 'bot-msg');
    msg.innerHTML = text; // allow markup for links
    messages.appendChild(msg);
    scrollToBottom();
  }

  function showTypingIndicator() {
    const ind = document.createElement('div');
    ind.classList.add('typing-indicator');
    ind.id = 'chat-typing-indicator';
    ind.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    messages.appendChild(ind);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const ind = document.getElementById('chat-typing-indicator');
    if (ind) ind.remove();
  }

  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  // Response generation logic
  function generateResponse(query) {
    const q = query.toLowerCase();
    
    // ----------------------------------------------------
    // Personality 1: Action (John Wick Theme)
    // ----------------------------------------------------
    if (activePersonality === 'action') {
      if (q.includes('skill') || q.includes('python') || q.includes('pandas')) {
        return "Nikitha handles code like a loaded chamber. Python, SQL, Pandas data analysis. Lethal when she pulls the trigger. Her targets don't fail compile checks.";
      }
      if (q.includes('project') || q.includes('pharmacy') || q.includes('deepfake') || q.includes('sales') || q.includes('dashboard')) {
        return "She built a Pharmacy system. Kept inventory tight, records clean. Then she forged a Sales Dashboard with Python and Pandas to extract business insights. Currently training CNN nets on Deepfakes. Identifying imposters. Nobody hides from her cameras.";
      }
      if (q.includes('intern') || q.includes('zealyen')) {
        return "Zealyen Infotech. One month in the field. Structured dynamic pages using HTML/CSS and Bootstrap. Quiet execution. Mission accomplished.";
      }
      if (q.includes('contact') || q.includes('phone') || q.includes('email') || q.includes('hire')) {
        return "Reach her at <strong>nikitha168r@gmail.com</strong> or call <strong>+91 6382231170</strong>. Don't waste her time. The High Table is watching.";
      }
      if (q.includes('education') || q.includes('college') || q.includes('vistas')) {
        return "She completed her MSc in IT at VELS (VISTAS) Chennai in 2026. Started with a BSc in CS at Vel Tech in 2024. Prepared. Disciplined.";
      }
      if (q.includes('hobby') || q.includes('music') || q.includes('travel')) {
        return "She travels. She listens to music. She watches movies. We all need a way to decompress after a contract.";
      }
      if (q.includes('john wick') || q.includes('baba yaga') || q.includes('who are you')) {
        return "I am a shadow of the Continental. Serving Nikitha. Be careful what you ask next.";
      }
      return "Hmm. I don't have intel on that. Keep it simple, or I'll have to call a cleaner.";
    }

    // ----------------------------------------------------
    // Personality 2: Professional (Standard Helper)
    // ----------------------------------------------------
    if (q.includes('skill') || q.includes('python') || q.includes('pandas') || q.includes('sql') || q.includes('html')) {
      return "Nikitha's technical skillset includes:<br>• <strong>Web Design</strong>: HTML, CSS, JavaScript, and Bootstrap (Highly proficient)<br>• <strong>Databases</strong>: SQL and DBMS (Certified by NPTEL, 2025)<br>• <strong>Programming</strong>: Python programming, including Pandas for data cleaning and manipulation<br>• <strong>Data Visualization</strong>: Power BI dashboard design.";
    }
    if (q.includes('project') || q.includes('pharmacy') || q.includes('deepfake') || q.includes('sales') || q.includes('dashboard')) {
      return "Nikitha has built several key projects:<br>1. <strong>Sales Dashboard Report</strong>: Built with Python and Pandas. Cleans, aggregates, and visualizes retail dataset trends to highlight revenue opportunities.<br>2. <strong>Pharmacy Management System</strong>: Developed with HTML, CSS, and SQL to track stocks, sales, and invoice records.<br>3. <strong>AI Deepfake Detection Framework</strong> (Ongoing): A python project utilizing Convolutional Neural Networks (CNN) to identify manipulated media files.";
    }
    if (q.includes('intern') || q.includes('zealyen')) {
      return "Nikitha completed a <strong>1-month Web Development Internship at Zealyen Infotech</strong>, where she designed responsive, user-friendly frontend web layouts using HTML, CSS, JavaScript, and Bootstrap.";
    }
    if (q.includes('contact') || q.includes('phone') || q.includes('email') || q.includes('hire')) {
      return "You can get in touch with Nikitha directly:<br>• <strong>Email</strong>: <a href='mailto:nikitha168r@gmail.com'>nikitha168r@gmail.com</a><br>• <strong>Phone</strong>: <a href='tel:+916382231170'>+91 6382231170</a><br>• Or use the contact form at the bottom of the page!";
    }
    if (q.includes('education') || q.includes('college') || q.includes('vistas') || q.includes('msc') || q.includes('bsc')) {
      return "Nikitha's educational credentials:<br>• <strong>MSc in Information Technology</strong> (Completed, 2024-2026) – VELS VISTAS, Chennai.<br>• <strong>BSc in Computer Science</strong> (Completed, 2021-2024) – Vel Tech Ranga Sanku College, Tiruvallur.";
    }
    if (q.includes('hobby') || q.includes('music') || q.includes('travel') || q.includes('movie')) {
      return "In her spare time, Nikitha enjoys traveling to new places, listening to music (which helps her focus), and watching movies.";
    }
    if (q.includes('cert') || q.includes('nptel') || q.includes('power bi') || q.includes('workshop')) {
      return "Nikitha has the following certifications and workshop credentials:<br>• <strong>NPTEL Online Certification</strong>: Database Management Systems (DBMS), 2025<br>• <strong>Power BI Certification</strong>: Data Insights & Analytics Modelling (Participated)<br>• <strong>SQL Workshop</strong>: Advanced querying and database optimization (Participant)<br>• <strong>Web Development Workshop</strong>: Responsive scaling and dynamic DOM design (Participant).";
    }
    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return "Hello! I am Nikitha's AI assistant. What would you like to know about her portfolio (skills, experience, projects, or certifications)?";
    }

    // Default match-all search
    return "Thank you for asking! Nikitha is a skilled MSc IT graduate with hands-on experience in HTML, CSS, JavaScript, SQL, and Python. Feel free to ask about her 'projects', 'skills', 'education', or how to 'contact' her.";
  }
}

/* ==========================================================================
   8. MOBILE NAVIGATION & LINKS SYNC
   ========================================================================== */
function initMobileNav() {
  const toggle = document.getElementById('mobile-nav-toggle');
  const menu = document.getElementById('nav-menu');
  const links = document.querySelectorAll('.nav-link');

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
  });

  // Link active selection and close menu
  links.forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      menu.classList.remove('active');

      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Scroll active indicator sync
  const sections = document.querySelectorAll('section, header');
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop - 150) {
        current = section.getAttribute('id');
      }
    });

    if (current) {
      links.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    }
  });
}
