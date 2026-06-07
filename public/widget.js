(function () {
    if (document.getElementById('avatar-widget-bar')) return
  // Get the store key from the script tag
  const script = document.currentScript || document.querySelector('script[data-store-key]')
const storeKey = script ? script.getAttribute('data-store-key') : null

  if (!storeKey) {
    console.warn('Avatar widget: no data-store-key found on script tag')
    return
  }

  const SUPABASE_URL = 'https://qgdxeukddlhxbnvdwnrm.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_MGCHdPkTePLhtWiN4yUmOQ_DIeMnNBK'
 const AVATAR_APP_URL = 'https://avatar-app-git-main-addis2.vercel.app'

  // ── Inject the button styles ──────────────────────────────
  const style = document.createElement('style')
  style.textContent = `
    #avatar-widget-bar {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
      font-family: sans-serif;
    }
    #avatar-filter-btn {
      background: #000;
      color: #fff;
      border: none;
      padding: 12px 22px;
      border-radius: 50px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    #avatar-filter-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(0,0,0,0.25);
    }
    #avatar-filter-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    #avatar-status-bar {
      background: #f0f7ff;
      border: 1px solid #b3d4f5;
      color: #0C447C;
      padding: 10px 16px;
      border-radius: 10px;
      font-size: 13px;
      max-width: 260px;
      text-align: center;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      display: none;
    }
    #avatar-reset-btn {
      background: transparent;
      border: 1px solid #ccc;
      color: #333;
      padding: 8px 16px;
      border-radius: 50px;
      font-size: 13px;
      cursor: pointer;
      display: none;
    }
  `
  document.head.appendChild(style)

  // ── Inject the widget HTML ────────────────────────────────
  const bar = document.createElement('div')
  bar.id = 'avatar-widget-bar'
  bar.innerHTML = `
    <div id="avatar-status-bar"></div>
    <div style="display:flex; gap:8px; align-items:center;">
      <button id="avatar-reset-btn">Show all</button>
      <button id="avatar-filter-btn">✨ Shop my size</button>
    </div>
  `
  document.body.appendChild(bar)

  const filterBtn = document.getElementById('avatar-filter-btn')
  const resetBtn = document.getElementById('avatar-reset-btn')
  const statusBar = document.getElementById('avatar-status-bar')

  // ── Get logged in user from Supabase ──────────────────────
  async function getSession() {
    // Find the Supabase session in localStorage
    const keys = Object.keys(localStorage).filter(k => k.startsWith('sb-'))
    
    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key)
        const parsed = JSON.parse(raw)
        // New Supabase format stores session nested
        if (parsed && parsed.access_token) {
          return { access_token: parsed.access_token, user: parsed.user }
        }
        if (parsed && parsed.session && parsed.session.access_token) {
          return { access_token: parsed.session.access_token, user: parsed.session.user }
        }
      } catch (e) {
        continue
      }
    }
    return null
  }

  // ── Fetch avatar preferences ──────────────────────────────
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

  // ── Filter products on the page ───────────────────────────
  function filterProducts(avatar) {
    // Works with Shopify product grids
    // Looks for elements with data-size, data-brand, or common Shopify class names
    const cards = document.querySelectorAll(
      '.product-card, .product-item, .grid__item, [data-size], .product-grid-item, li.grid__item'
    )

    let shown = 0
    let hidden = 0

    cards.forEach(card => {
      const text = card.innerText.toLowerCase()
      const dataSize = (card.getAttribute('data-size') || '').toLowerCase()

      const sizeMatch = avatar.shoe_size
        ? text.includes(avatar.shoe_size.toLowerCase()) || dataSize.includes(avatar.shoe_size.toLowerCase())
        : true

      const brandMatch = avatar.brand_prefs
        ? avatar.brand_prefs.toLowerCase().split(',').some(b => text.includes(b.trim()))
        : true

      const styleMatch = avatar.style_tags
        ? avatar.style_tags.toLowerCase().split(',').some(s => text.includes(s.trim()))
        : true

      if (sizeMatch && (brandMatch || styleMatch)) {
        card.style.display = ''
        shown++
      } else {
        card.style.display = 'none'
        hidden++
      }
    })

    return { shown, hidden }
  }

  function resetProducts() {
    const cards = document.querySelectorAll(
      '.product-card, .product-item, .grid__item, [data-size], .product-grid-item, li.grid__item'
    )
    cards.forEach(card => card.style.display = '')
  }

  // ── Main button click handler ─────────────────────────────
 filterBtn.addEventListener('click', async () => {
    filterBtn.disabled = true
    filterBtn.textContent = 'Loading...'

    console.log('Avatar widget: button clicked')
    
    const session = await getSession()
    console.log('Avatar widget: session found:', session)

    if (!session) {
      console.log('Avatar widget: no session found')
      statusBar.style.display = 'block'
      statusBar.innerHTML = `No Avatar account detected. <a href="${AVATAR_APP_URL}/signup" target="_blank" style="color:#0C447C;font-weight:500;">Create one free →</a>`
      filterBtn.textContent = '✨ Shop my size'
      filterBtn.disabled = false
      return
    }

    console.log('Avatar widget: fetching avatar for user:', session.user.id)
    const avatar = await fetchAvatar(session.user.id, session.access_token)
    console.log('Avatar widget: avatar data:', avatar)

    if (!avatar) {
      statusBar.style.display = 'block'
      statusBar.innerHTML = `Set up your Avatar first. <a href="${AVATAR_APP_URL}/profile" target="_blank" style="color:#0C447C;font-weight:500;">Go to profile →</a>`
      filterBtn.textContent = '✨ Shop my size'
      filterBtn.disabled = false
      return
    }

    const { shown, hidden } = filterProducts(avatar)
    console.log('Avatar widget: shown:', shown, 'hidden:', hidden)

    statusBar.style.display = 'block'
    statusBar.innerHTML = `🎯 Showing ${shown} products in your size · ${hidden} hidden`

    filterBtn.style.display = 'none'
    resetBtn.style.display = 'block'
  })

  // ── Reset button ──────────────────────────────────────────
  resetBtn.addEventListener('click', () => {
    resetProducts()
    filterBtn.style.display = 'block'
    filterBtn.textContent = '✨ Shop my size'
    filterBtn.disabled = false
    resetBtn.style.display = 'none'
    statusBar.style.display = 'none'
  })

})()