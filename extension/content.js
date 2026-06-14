// ── Content script ────────────────────────────────────────
// Runs on every webpage and watches for form field activity

// Track fields we've seen recently (to avoid duplicate saves)
const recentlySavedFields = new Set()

// ── Listen for messages from background.js ───────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'autofill') {
    const result = fillForms(message.avatar)
    sendResponse(result)
  }
  if (message.action === 'reset') {
    resetProducts()
    sendResponse({ reset: true })
  }
  return true
})

// ── Watch all input fields for typing ────────────────────
document.addEventListener('input', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    handleFieldInput(e.target)
  }
}, true)

// Track when user stops typing (debounce)
let typingTimeouts = new Map()

function handleFieldInput(field) {
  // Clear the previous timeout for this field
  if (typingTimeouts.has(field)) {
    clearTimeout(typingTimeouts.get(field))
  }

  // Set a new timeout — if user stops typing for 2 seconds
  const timeout = setTimeout(() => {
    onFieldChanged(field)
    typingTimeouts.delete(field)
  }, 2000)

  typingTimeouts.set(field, timeout)
}

// ── When user finishes typing in a field ──────────────────
async function onFieldChanged(field) {
  // Only process if field has a value
  if (!field.value || field.value.trim().length === 0) return

  // Don't process hidden or very small fields
  if (field.type === 'hidden' || field.offsetHeight === 0) return

  // Get field label
  const fieldLabel = getFieldLabel(field)
  if (!fieldLabel) return

  console.log('Avatar: Asking Claude about field:', fieldLabel)

  // Ask background.js to identify what type of field this is
  chrome.runtime.sendMessage(
    { action: 'identify_field', label: fieldLabel },
    (response) => {
      if (response && response.type && response.type !== 'unknown') {
        console.log('Avatar: Field identified as', response.type)
        // We identified a field type — ask user if they want to save it
        showSavePrompt(field, field.value, response.type)
      }
    }
  )
}

// ── Get the label for a form field ───────────────────────
function getFieldLabel(field) {
  // Try to find the label text in many different ways

  // 1. Associated label element
  if (field.id) {
    const label = document.querySelector(`label[for="${field.id}"]`)
    if (label) return label.innerText.toLowerCase().trim()
  }

  // 2. aria-label attribute
  const ariaLabel = field.getAttribute('aria-label')
  if (ariaLabel) return ariaLabel.toLowerCase().trim()

  // 3. aria-labelledby (like Google Forms)
  const labelledById = field.getAttribute('aria-labelledby')
  if (labelledById) {
    const ids = labelledById.split(' ')
    for (let id of ids) {
      const el = document.getElementById(id)
      if (el) return el.innerText.toLowerCase().trim()
    }
  }

  // 4. placeholder attribute
  const placeholder = field.getAttribute('placeholder')
  if (placeholder) return placeholder.toLowerCase().trim()

  // 5. name attribute
  const name = field.getAttribute('name')
  if (name) return name.toLowerCase().trim()

  // 6. Parent container text (last resort)
  let parent = field.parentElement
  for (let i = 0; i < 2; i++) {
    if (parent) {
      const text = parent.innerText
      if (text && text.length < 100) return text.toLowerCase().trim()
      parent = parent.parentElement
    }
  }

  return null
}

// ── Show a popup asking "Save this?" ─────────────────────
function showSavePrompt(field, value, fieldType) {
  // Don't show if we just saved something similar
  const key = `${fieldType}:${value.substring(0, 20)}`
  if (recentlySavedFields.has(key)) return
  recentlySavedFields.add(key)

  // Create the popup
  const popup = document.createElement('div')
  popup.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 99999;
    font-family: sans-serif;
    max-width: 300px;
  `

  const fieldTypeDisplay = fieldType.replace('_', ' ')
  popup.innerHTML = `
    <p style="margin: 0 0 12px; font-size: 14px; color: #333;">
      💾 Save your ${fieldTypeDisplay}?
    </p>
    <p style="margin: 0 0 12px; font-size: 12px; color: #666; font-style: italic;">
      "${value}"
    </p>
    <div style="display: flex; gap: 8px;">
      <button id="save-yes" style="flex: 1; padding: 8px; background: #000; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;">
        Save
      </button>
      <button id="save-no" style="flex: 1; padding: 8px; background: #f0f0f0; color: #333; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;">
        Not now
      </button>
    </div>
  `

  document.body.appendChild(popup)

  // Handle Save click
  popup.querySelector('#save-yes').addEventListener('click', () => {
    saveToAvatar(fieldType, value)
    popup.remove()
  })

  // Handle Not now click
  popup.querySelector('#save-no').addEventListener('click', () => {
    popup.remove()
  })

  // Auto remove after 10 seconds if user ignores it
  setTimeout(() => {
    if (popup.parentElement) popup.remove()
  }, 10000)
}

// ── Save the field value to the user's Avatar ────────────
async function saveToAvatar(fieldType, value) {
  // Get the user's session
  const session = await loadSession()
  if (!session) {
    alert('Please log into Avatar first')
    return
  }

  console.log('Avatar: Saving', fieldType, 'to Avatar')

  // Send to background worker to save
  chrome.runtime.sendMessage({
    action: 'save_field',
    fieldType: fieldType,
    value: value,
    sessionUserId: session.user.id,
    sessionToken: session.access_token
  })
}

// ── Load session from Chrome storage ─────────────────────
async function loadSession() {
  return new Promise(resolve => {
    chrome.storage.local.get('avatar_session', result => {
      resolve(result.avatar_session || null)
    })
  })
}

// ── Product filtering (existing code) ────────────────────
function fillForms(avatar) {
  let filled = 0
  const inputs = document.querySelectorAll('input, textarea')

  inputs.forEach(input => {
    const type = (input.type || '').toLowerCase()
    const name = (input.name || '').toLowerCase()
    const id = (input.id || '').toLowerCase()
    const placeholder = (input.placeholder || '').toLowerCase()
    const autocomplete = (input.autocomplete || '').toLowerCase()

    let labelText = ''
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`)
      if (label) labelText = label.innerText.toLowerCase()
    }

    const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase()
    const allClues = `${type} ${name} ${id} ${placeholder} ${autocomplete} ${labelText} ${ariaLabel}`

    const fullNameSignals = ['full name', 'fullname', 'full_name', 'your name', 'name']
    const firstNameSignals = ['first name', 'firstname', 'first_name', 'given name', 'fname']
    const lastNameSignals = ['last name', 'lastname', 'last_name', 'surname', 'lname']

    const nameParts = (avatar.full_name || '').trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    if (fullNameSignals.some(signal => allClues.includes(signal))) {
      if (avatar.full_name) {
        setFieldValue(input, avatar.full_name)
        filled++
      }
    }
    else if (firstNameSignals.some(signal => allClues.includes(signal))) {
      if (firstName) {
        setFieldValue(input, firstName)
        filled++
      }
    }
    else if (lastNameSignals.some(signal => allClues.includes(signal))) {
      if (lastName) {
        setFieldValue(input, lastName)
        filled++
      }
    }
  })

  return { filled }
}

function setFieldValue(input, value) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value'
  ).set
  nativeInputValueSetter.call(input, value)

  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))

  input.style.backgroundColor = '#f0f7ff'
  input.style.border = '1px solid #b3d4f5'
  setTimeout(() => {
    input.style.backgroundColor = ''
    input.style.border = ''
  }, 2000)
}

function resetProducts() {
  const selectors = ['.product-card', 'li[id^="product-"]', '.product-item', '.product-tile']
  const cards = document.querySelectorAll(selectors.join(', '))
  cards.forEach(card => card.style.display = '')
}