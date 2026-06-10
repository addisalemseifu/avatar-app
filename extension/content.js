// Listens for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'filter') {
    const result = filterProducts(message.avatar)
    sendResponse(result)
  }
  if (message.action === 'reset') {
    resetProducts()
    sendResponse({ reset: true })
  }
  return true
})

function filterProducts(avatar) {
  // Find all product cards on the page
 const selectors = [
    // Our demo store
    '.product-card',
    // ASOS
    'li[id^="product-"]',
    // Shopify stores
    '.product-item',
    '.product-tile',
    '.grid__item',
    '.product-grid-item',
    '[data-product-id]',
    '.product',
  ]

  const cards = document.querySelectorAll(selectors.join(', '))
  let shown = 0
  let hidden = 0

  cards.forEach(card => {
    const text = card.innerText.toLowerCase()

    const sizeMatch = avatar.shoe_size
      ? text.includes(avatar.shoe_size.toLowerCase())
      : false

    const styleMatch = avatar.style_tags
      ? avatar.style_tags.toLowerCase().split(',').some(s => text.includes(s.trim()))
      : false

    const brandMatch = avatar.brand_prefs
      ? avatar.brand_prefs.toLowerCase().split(',').some(b => text.includes(b.trim()))
      : false

    // If no matches at all found on page, fall back to brand/style only
    const hasAnySizeInfo = document.body.innerText.toLowerCase().includes(avatar.shoe_size ? avatar.shoe_size.toLowerCase() : 'xxxxxxxxxxx')

    let isMatch
    if (hasAnySizeInfo) {
      // Site shows sizes — filter by size + brand/style
      isMatch = sizeMatch && (styleMatch || brandMatch || !avatar.brand_prefs)
    } else {
      // Site doesn't show sizes on listing page — filter by brand and style only
      isMatch = styleMatch || brandMatch
    }

    if (isMatch) {
      card.style.display = ''
      shown++
    } else {
      card.style.display = 'none'
      hidden++
    }
  })

  return { shown, hidden, total: shown + hidden }
}

function resetProducts() {
  const selectors = [
    '.product-card',
    '.product-item',
    '.product-tile',
    '.grid__item',
    '.product-grid-item',
    '[data-product-id]',
    '.product',
  ]
  const cards = document.querySelectorAll(selectors.join(', '))
  cards.forEach(card => card.style.display = '')
}