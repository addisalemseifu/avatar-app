// ── Background service worker ─────────────────────────────
// This runs silently in the background at all times
// It's the only part that can call the Claude API

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_API_KEY = 'ADD_YOUR_API_KEY_HERE'

// ── Listen for messages from content script ───────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message)
  if (message.action === 'identify_field') {
    console.log('Identifying field:', message.label)
    identifyField(message.label)
      .then(result => sendResponse(result))
      .catch(err => sendResponse({ type: 'unknown', error: err.message }))
    return true
  }
  if (message.action === 'save_field') {
    console.log('Saving field:', message.fieldType)
    saveFieldToSupabase(message.fieldType, message.value, message.sessionUserId, message.sessionToken)
      .then(result => sendResponse(result))
      .catch(err => sendResponse({ success: false, error: err.message }))
    return true
  }
})

// ── Ask Claude what type of field this is ────────────────
async function identifyField(fieldLabel) {
  console.log('identifyField called with:', fieldLabel)
  
  try {
    console.log('Calling Claude API with label:', fieldLabel)
    
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
  'Content-Type': 'application/json',
  'x-api-key': CLAUDE_API_KEY,
  'anthropic-version': '2023-06-01',
  'anthropic-dangerous-direct-browser-access': 'true'
},
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: `You are analyzing a web form field. 
          
The field label is: "${fieldLabel}"

Reply with ONLY a JSON object like this, nothing else:
{"type": "name"}

The type must be one of these exact values:
- "first_name" (for first name fields)
- "last_name" (for last name fields)  
- "full_name" (for full name fields)
- "email" (for email fields)
- "phone" (for phone number fields)
- "address" (for address fields)
- "city" (for city fields)
- "country" (for country fields)
- "zip" (for zip/postal code fields)
- "date_of_birth" (for date of birth fields)
- "unknown" (if you can't determine the field type)

Reply with ONLY the JSON. No explanation.`
          }
        ]
      })
    })

    console.log('Claude API response status:', response.status)
    
    const data = await response.json()
    console.log('Claude API response data:', JSON.stringify(data, null, 2))
    
    let text = data.content[0].text.trim()
console.log('Claude text response:', text)

// Strip markdown code fence if present
text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
console.log('Cleaned text:', text)

const parsed = JSON.parse(text)
    console.log('Parsed field type:', parsed)
    
    return parsed
  } catch (err) {
    console.error('identifyField error:', err.message, err)
    return { type: 'unknown', error: err.message }
  }
}

// ── Save field to Supabase ───────────────────────────────
async function saveFieldToSupabase(fieldType, value, userId, accessToken) {
  console.log('Saving to Supabase:', fieldType, value, 'for user:', userId)
  
  try {
    const updateData = {
      user_id: userId
    }

    const fieldMapping = {
      'first_name': 'first_name',
      'last_name': 'last_name',
      'full_name': 'full_name',
      'email': 'email',
      'phone': 'phone',
      'address': 'shipping_address',
    }

    const column = fieldMapping[fieldType]
    if (!column) return { success: false, error: 'Unknown field type' }

    updateData[column] = value

    const url = `https://qgdxeukddlhxbnvdwnrm.supabase.co/rest/v1/avatars?user_id=eq.${userId}`
    console.log('PATCH URL:', url)

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'sb_publishable_MGCHdPkTePLhtWiN4yUmOQ_DIeMnNBK',
      },
      body: JSON.stringify(updateData)
    })

    let data = null
if (response.status !== 204) {
  try {
    data = await response.json()
    console.log('Supabase response:', JSON.stringify(data, null, 2))
  } catch (e) {
    console.log('Supabase response: empty (success)')
  }
}
console.log('PATCH success:', response.ok, 'Status:', response.status)
return { success: response.ok }
  } catch (err) {
    console.error('Save error:', err)
    return { success: false, error: err.message }
  }
}