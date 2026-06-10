const SUPABASE_URL = 'https://qgdxeukddlhxbnvdwnrm.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_MGCHdPkTePLhtWiN4yUmOQ_DIeMnNBK'

// ── Supabase helpers ──────────────────────────────────────

async function signIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, password })
  })
  return res.json()
}

async function fetchAvatar(userId, accessToken) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/avatars?select=*&user_id=eq.${userId}`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`,
      }
    }
  )
  const data = await res.json()
  return data && data.length > 0 ? data[0] : null
}

// ── Save and load session from Chrome storage ─────────────

async function saveSession(session) {
  return new Promise(resolve => {
    chrome.storage.local.set({ avatar_session: session }, resolve)
  })
}

async function loadSession() {
  return new Promise(resolve => {
    chrome.storage.local.get('avatar_session', result => {
      resolve(result.avatar_session || null)
    })
  })
}

async function clearSession() {
  return new Promise(resolve => {
    chrome.storage.local.remove('avatar_session', resolve)
  })
}

// ── UI helpers ────────────────────────────────────────────

function showLoggedIn() {
  document.getElementById('logged-out').style.display = 'none'
  document.getElementById('logged-in').style.display = 'block'
}

function showLoggedOut() {
  document.getElementById('logged-out').style.display = 'block'
  document.getElementById('logged-in').style.display = 'none'
}

function setLoginStatus(msg, isError = false) {
  const el = document.getElementById('login-status')
  el.textContent = msg
  el.className = 'status ' + (isError ? 'error' : '')
}

function setFilterStatus(msg, isSuccess = false) {
  const el = document.getElementById('filter-status')
  el.textContent = msg
  el.className = 'status ' + (isSuccess ? 'success' : '')
}

// ── On popup open ─────────────────────────────────────────

async function init() {
  const session = await loadSession()

  if (session) {
    showLoggedIn()
    const avatar = await fetchAvatar(session.user.id, session.access_token)
    if (avatar) {
      const info = document.getElementById('avatar-info')
      info.style.display = 'block'
      info.innerHTML = `
        👟 Shoe size: <strong>${avatar.shoe_size || 'not set'}</strong><br>
        👕 Top size: <strong>${avatar.top_size || 'not set'}</strong><br>
        👖 Bottom size: <strong>${avatar.bottom_size || 'not set'}</strong><br>
        ✨ Style: <strong>${avatar.style_tags || 'not set'}</strong>
      `
    }
  } else {
    showLoggedOut()
  }
}

// ── Login button ──────────────────────────────────────────

document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value.trim()

  if (!email || !password) {
    setLoginStatus('Please enter your email and password', true)
    return
  }

  setLoginStatus('Logging in...')

  const data = await signIn(email, password)

  if (data.error) {
    setLoginStatus(data.error_description || 'Login failed', true)
    return
  }

  await saveSession({ access_token: data.access_token, user: data.user })
  showLoggedIn()
  init()
})

// ── Filter button ─────────────────────────────────────────

document.getElementById('filter-btn').addEventListener('click', async () => {
  const session = await loadSession()
  if (!session) return

  const avatar = await fetchAvatar(session.user.id, session.access_token)
  if (!avatar) {
    setFilterStatus('No avatar found. Set up your profile first.')
    return
  }

  // Send avatar to content script
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  chrome.tabs.sendMessage(tab.id, { action: 'filter', avatar }, response => {
    if (response && response.shown !== undefined) {
      setFilterStatus(`🎯 Showing ${response.shown} of ${response.total} products`, true)
      document.getElementById('filter-btn').style.display = 'none'
      document.getElementById('reset-btn').style.display = 'block'
    } else {
      setFilterStatus('Could not find products on this page.')
    }
  })
})

// ── Reset button ──────────────────────────────────────────

document.getElementById('reset-btn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  chrome.tabs.sendMessage(tab.id, { action: 'reset' }, () => {
    setFilterStatus('')
    document.getElementById('filter-btn').style.display = 'block'
    document.getElementById('reset-btn').style.display = 'none'
  })
})

// ── Logout button ─────────────────────────────────────────

document.getElementById('logout-btn').addEventListener('click', async () => {
  await clearSession()
  showLoggedOut()
})

// ── Start ─────────────────────────────────────────────────
init()