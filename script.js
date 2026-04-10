import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js';
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js';

const statsData = {
  labels: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  users: [48, 61, 73, 91, 108, 131, 155]
};

const firebaseConfig = {
  apiKey: 'AIzaSyCvJtf3Wm43Qxm1tzqfwaW_Rn4bwoIR3zk',
  authDomain: 'studio-5960746282-bfd68.firebaseapp.com',
  projectId: 'studio-5960746282-bfd68',
  storageBucket: 'studio-5960746282-bfd68.firebasestorage.app',
  messagingSenderId: '88581717226',
  appId: '1:88581717226:web:767a54cf4ef0168e46eb93'
};

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const counters = document.querySelectorAll('[data-counter]');
const revealItems = document.querySelectorAll('.reveal');
const growthChartCanvas = document.getElementById('growthChart');
const feedbackForm = document.getElementById('feedbackForm');
const formStatus = document.getElementById('formStatus');
const THEME_STORAGE_KEY = 'weblock-theme';
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

function applyTheme(theme) {
  const resolvedTheme = theme === 'system'
    ? (prefersDark.matches ? 'dark' : 'light')
    : theme;

  root.classList.toggle('dark', resolvedTheme === 'dark');
  root.dataset.theme = theme;
  root.style.colorScheme = resolvedTheme;

  if (themeToggle) {
    themeToggle.textContent = resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode';
  }
}

function getPreferredTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }
  return 'system';
}

function saveTheme(theme) {
  if (theme === 'system') {
    localStorage.removeItem(THEME_STORAGE_KEY);
    return;
  }

  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function animateCounter(element) {
  const target = Number(element.dataset.counter || 0);
  const duration = 1400;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.floor(target * eased);
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target;
    }
  }

  requestAnimationFrame(update);
}

function setupRevealObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  revealItems.forEach((item) => observer.observe(item));
}

function setupCounterObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.7 });

  counters.forEach((counter) => observer.observe(counter));
}

function createGrowthChart() {
  if (!growthChartCanvas) {
    return;
  }

  const ChartLib = window.Chart;
  const isDark = root.classList.contains('dark');
  const gridColor = isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(148, 163, 184, 0.24)';
  const labelColor = isDark ? '#cbd5e1' : '#475569';
  const gradient = growthChartCanvas.getContext('2d').createLinearGradient(0, 0, 0, 320);

  gradient.addColorStop(0, 'rgba(14, 165, 233, 0.35)');
  gradient.addColorStop(1, 'rgba(14, 165, 233, 0.02)');

  if (window.weblockChart) {
    window.weblockChart.destroy();
  }

  window.weblockChart = new ChartLib(growthChartCanvas, {
    type: 'line',
    data: {
      labels: statsData.labels,
      datasets: [
        {
          label: 'Users',
          data: statsData.users,
          fill: true,
          backgroundColor: gradient,
          borderColor: '#0ea5e9',
          borderWidth: 3,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#34d399'
        }
      ]
    },
    options: {
      animation: {
        duration: 1400,
        easing: 'easeOutQuart'
      },
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: isDark ? '#020617' : '#ffffff',
          titleColor: isDark ? '#ffffff' : '#0f172a',
          bodyColor: isDark ? '#cbd5e1' : '#334155',
          borderColor: gridColor,
          borderWidth: 1,
          displayColors: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: labelColor
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: labelColor
          },
          grid: {
            color: gridColor
          }
        }
      }
    }
  });
}

function setFormStatus(message, tone = 'neutral') {
  if (!formStatus) {
    return;
  }

  const toneClasses = {
    neutral: 'text-slate-500 dark:text-slate-400',
    success: 'text-emerald-600 dark:text-emerald-300',
    error: 'text-rose-600 dark:text-rose-300'
  };

  formStatus.textContent = message;
  formStatus.className = `min-h-[1.5rem] text-sm ${toneClasses[tone] || toneClasses.neutral}`;
}

function setupFeedbackForm() {
  if (!feedbackForm) {
    return;
  }

  feedbackForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = feedbackForm.querySelector('button[type="submit"]');
    const formData = new FormData(feedbackForm);
    const payload = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      message: String(formData.get('message') || '').trim()
    };

    if (!payload.name || !payload.email || !payload.message) {
      setFormStatus('Please fill in all fields before submitting.', 'error');
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Submitting...';
      submitButton.classList.add('opacity-70');
    }

    setFormStatus('Sending your feedback...', 'neutral');

    try {
      await addDoc(collection(db, 'feedbacks'), {
        ...payload,
        createdAt: serverTimestamp(),
        source: 'weblock-website'
      });

      feedbackForm.reset();
      setFormStatus('Thanks. Your feedback has been saved successfully.', 'success');
    } catch (error) {
      console.error('Error saving feedback:', error);
      setFormStatus('Something went wrong while saving your feedback. Please try again.', 'error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
        submitButton.classList.remove('opacity-70');
      }
    }
  });
}

applyTheme(getPreferredTheme());
setupRevealObserver();
setupCounterObserver();
createGrowthChart();
setupFeedbackForm();

themeToggle?.addEventListener('click', () => {
  const nextTheme = root.classList.contains('dark') ? 'light' : 'dark';
  saveTheme(nextTheme);
  applyTheme(nextTheme);
  createGrowthChart();
});

prefersDark.addEventListener('change', () => {
  if (!localStorage.getItem(THEME_STORAGE_KEY)) {
    applyTheme('system');
    createGrowthChart();
  }
});
