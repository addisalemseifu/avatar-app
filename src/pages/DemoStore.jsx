import { useState, useEffect } from 'react'

function DemoStore() {
  const products = [
    { id: 1, name: 'Air Runner Pro', brand: 'Nike', size: 'US 9', style: 'sport', price: '$120', color: '#f0f0f0' },
    { id: 2, name: 'Street Walker', brand: 'Adidas', size: 'US 10', style: 'casual', price: '$95', color: '#e8f4e8' },
    { id: 3, name: 'Classic Low', brand: 'Nike', size: 'US 11', style: 'casual', price: '$85', color: '#f4e8e8' },
    { id: 4, name: 'Speed Boost X', brand: 'Adidas', size: 'US 10', style: 'sport', price: '$140', color: '#e8e8f4' },
    { id: 5, name: 'Urban Flex', brand: 'Puma', size: 'US 9', style: 'casual', price: '$75', color: '#f4f4e8' },
    { id: 6, name: 'Trail Blazer', brand: 'Nike', size: 'US 10', style: 'sport', price: '$130', color: '#f0e8f4' },
    { id: 7, name: 'Formal Step', brand: 'Zara', size: 'US 11', style: 'formal', price: '$110', color: '#e8f4f4' },
    { id: 8, name: 'Casual Stride', brand: 'Adidas', size: 'US 9', style: 'casual', price: '$90', color: '#f4ece8' },
  ]

  useEffect(() => {
    // Don't load if already loaded
    if (document.getElementById('avatar-widget-bar')) return

    const script = document.createElement('script')
    script.src = '/widget.js?v=' + Date.now()
    script.setAttribute('data-store-key', 'avatar_stepright_shoes_test123')
    document.body.appendChild(script)

    return () => {
      const existingScript = document.querySelector('script[data-store-key]')
      if (existingScript) document.body.removeChild(existingScript)
      const bar = document.getElementById('avatar-widget-bar')
      if (bar) bar.remove()
    }
  }, [])

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>

      {/* Store header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>StepRight Shoes</h1>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>Premium footwear for every occasion</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
            {products.length} products
          </p>
        </div>
      </div>

      {/* Product grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {products.map(product => (
          <div
            key={product.id}
            className="product-card"
            data-size={product.size}
            data-brand={product.brand}
            data-style={product.style}
            style={{ background: product.color, borderRadius: '12px', padding: '1.25rem', border: '1px solid #eee' }}
          >
            <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '12px' }}>👟</div>
            <p style={{ margin: '0 0 4px', fontWeight: '500', fontSize: '15px' }}>{product.name}</p>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#666' }}>{product.brand}</p>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#666' }}>Size: {product.size}</p>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#888', textTransform: 'capitalize' }}>{product.style}</p>
            <p style={{ margin: '0 0 12px', fontWeight: '500', fontSize: '16px' }}>{product.price}</p>
            <button style={{ width: '100%', padding: '8px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
              Add to cart
            </button>
          </div>
        ))}
      </div>

    </div>
  )
}

export default DemoStore