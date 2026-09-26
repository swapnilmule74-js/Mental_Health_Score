const API_BASE_URL = 'https://mental-health-score-k0lh.onrender.com';

const form = document.getElementById('predict-form');
const submitBtn = document.getElementById('submit-btn');
const formError = document.getElementById('form-error');
const resultSection = document.getElementById('result');
const resetBtn = document.getElementById('reset-btn');

const scoreNumberEl = document.getElementById('score-number');
const scoreLabelEl = document.getElementById('score-label');
const scoreNoteEl = document.getElementById('score-note');
const gaugeFill = document.getElementById('gauge-fill');
const gaugeNeedle = document.getElementById('gauge-needle');

const GAUGE_ARC_LENGTH = 251.2; // matches stroke-dasharray in CSS
const GAUGE_MIN_SCORE = 0;
const GAUGE_MAX_SCORE = 10;

// Field id -> payload key, plus the input element type for parsing.
const FIELD_MAP = [
  { id: 'age', key: 'Age', type: 'int' },
  { id: 'gender', key: 'Gender', type: 'str' },
  { id: 'country', key: 'Country', type: 'str' },
  { id: 'academic-level', key: 'Academic_Level', type: 'str' },
  { id: 'platform', key: 'Most_Used_Platform', type: 'str' },
  { id: 'purpose', key: 'Purpose_Of_Use', type: 'str' },
  { id: 'usage-hours', key: 'Avg_Daily_Usage_Hours', type: 'float' },
  { id: 'unlocks', key: 'Daily_Unlocks', type: 'int' },
  { id: 'study-hours', key: 'Study_Hours', type: 'float' },
  { id: 'activity-hours', key: 'Physical_Activity_Hours', type: 'float' },
  { id: 'sleep-hours', key: 'Sleep_Hours_Per_Night', type: 'float' },
  { id: 'stress', key: 'Stress_Level', type: 'str' },
];

function clearFieldErrors() {
  document.querySelectorAll('.field').forEach((f) => f.classList.remove('invalid'));
  document.querySelectorAll('.field-error').forEach((e) => { e.textContent = ''; });
  formError.textContent = '';
}

function markFieldInvalid(id, message) {
  const input = document.getElementById(id);
  const field = input ? input.closest('.field') : null;
  const errorEl = document.querySelector(`[data-error-for="${id}"]`);
  if (field) field.classList.add('invalid');
  if (errorEl) errorEl.textContent = message;
}

function collectAndValidate() {
  clearFieldErrors();
  const payload = {};
  let firstInvalidId = null;

  FIELD_MAP.forEach(({ id, key, type }) => {
    const input = document.getElementById(id);
    const rawValue = input.value.trim();

    if (rawValue === '') {
      markFieldInvalid(id, 'This field is required.');
      if (!firstInvalidId) firstInvalidId = id;
      return;
    }

    if (type === 'int' || type === 'float') {
      const num = Number(rawValue);
      if (Number.isNaN(num)) {
        markFieldInvalid(id, 'Enter a number.');
        if (!firstInvalidId) firstInvalidId = id;
        return;
      }
      if (input.min !== '' && num < Number(input.min)) {
        markFieldInvalid(id, `Must be at least ${input.min}.`);
        if (!firstInvalidId) firstInvalidId = id;
        return;
      }
      if (input.max !== '' && num > Number(input.max)) {
        markFieldInvalid(id, `Must be at most ${input.max}.`);
        if (!firstInvalidId) firstInvalidId = id;
        return;
      }
      payload[key] = type === 'int' ? Math.trunc(num) : num;
    } else {
      payload[key] = rawValue;
    }
  });

  return { payload, firstInvalidId };
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  if (isLoading) {
    submitBtn.innerHTML = '<span class="spinner" style="display:inline-block"></span><span class="btn-label">Reading&hellip;</span>';
  } else {
    submitBtn.innerHTML = '<span class="btn-label">Take the reading</span>';
  }
}

function bandForScore(score) {
  if (score <= 3) {
    return {
      label: 'Struggling',
      note: 'The signals here point to real strain. A conversation with a counsellor, doctor, or someone you trust could help more than another hour of scrolling.',
      color: getComputedStyle(document.documentElement).getPropertyValue('--rust').trim(),
    };
  }
  if (score <= 5.5) {
    return {
      label: 'Under strain',
      note: 'Things are wobblier than they could be. Small shifts — more sleep, a little less screen — tend to move this number.',
      color: getComputedStyle(document.documentElement).getPropertyValue('--amber').trim(),
    };
  }
  if (score <= 7.5) {
    return {
      label: 'Steady',
      note: 'A reasonably balanced state. Keep an eye on the habits that got you here.',
      color: getComputedStyle(document.documentElement).getPropertyValue('--teal').trim(),
    };
  }
  return {
    label: 'Thriving',
    note: 'Your day-to-day rhythm looks like it\u2019s working for you. Good foundations worth protecting.',
    color: getComputedStyle(document.documentElement).getPropertyValue('--teal-deep').trim(),
  };
}

function renderResult(score) {
  const clamped = Math.min(Math.max(score, GAUGE_MIN_SCORE), GAUGE_MAX_SCORE);
  const fraction = (clamped - GAUGE_MIN_SCORE) / (GAUGE_MAX_SCORE - GAUGE_MIN_SCORE);
  const band = bandForScore(score);

  scoreNumberEl.textContent = score.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
  scoreLabelEl.textContent = band.label;
  scoreLabelEl.style.color = band.color;
  scoreNoteEl.textContent = band.note;

  resultSection.hidden = false;

  // Animate gauge fill and needle on next frame so the transition triggers.
  gaugeFill.style.stroke = band.color;
  gaugeFill.style.strokeDashoffset = String(GAUGE_ARC_LENGTH);
  gaugeNeedle.style.transform = 'rotate(-90deg)';

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const offset = GAUGE_ARC_LENGTH * (1 - fraction);
      gaugeFill.style.strokeDashoffset = String(offset);
      const angle = -90 + fraction * 180;
      gaugeNeedle.style.transform = `rotate(${angle}deg)`;
    });
  });

  resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function submitPrediction(payload) {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}.`;
    try {
      const body = await response.json();
      if (body && body.detail) {
        if (Array.isArray(body.detail)) {
          detail = body.detail
            .map((d) => `${(d.loc || []).slice(-1)[0] || 'field'}: ${d.msg}`)
            .join(' \u2014 ');
        } else {
          detail = String(body.detail);
        }
      }
    } catch (_) {
      // response had no JSON body; keep the generic message
    }
    throw new Error(detail);
  }

  return response.json();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  resultSection.hidden = true;

  const { payload, firstInvalidId } = collectAndValidate();
  if (firstInvalidId) {
    document.getElementById(firstInvalidId).focus();
    formError.textContent = 'Please fix the highlighted fields.';
    return;
  }

  setLoading(true);
  try {
    const data = await submitPrediction(payload);
    const score = data.predicated_mental_health_score;
    renderResult(score);
  } catch (err) {
    if (err instanceof TypeError) {
      formError.textContent = `Can\u2019t reach the API at ${API_BASE_URL}. Is the backend running?`;
    } else {
      formError.textContent = err.message || 'Something went wrong. Please try again.';
    }
  } finally {
    setLoading(false);
  }
});

resetBtn.addEventListener('click', () => {
  resultSection.hidden = true;
  form.reset();
  clearFieldErrors();
  document.getElementById('age').focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
