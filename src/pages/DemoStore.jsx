import { useState } from 'react'
import { supabase } from '../supabaseClient'

function DemoStore() {
  const [filtered, setFiltered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [avatar, setAvatar] = useState(null)
  const [error, setError] = useState(null)

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

  async function handleShopMySize() {
    setLoading(true)
    setError(null)

    // Get the currently logged in user
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      setError('Please log in to your Avatar first')
      setLoading(false)
      return
    }

    // Fetch their avatar preferences
    const { data, error } = await supabase
      .from('avatars')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (error || !data) {
      setError('No avatar found. Please set up your avatar first.')
      setLoading(false)
      return
    }

    setAvatar(data)
    setFiltered(true)
    setLoading(false)
  }

  function handleReset() {
    setFiltered(false)
    setAvatar(null)
    setError(null)
  }

  // Filter products by avatar preferences
  const displayedProducts = filtered && avatar
    ? products.filter(product => {
        const sizeMatch = product.size === avatar.shoe_size
        const styleMatch = avatar.style_tags
          ? avatar.style_tags.toLowerCase().includes(product.style.toLowerCase())
          : true
        const brandMatch = avatar.brand_prefs
          ? avatar.brand_prefs.toLowerCase().includes(product.brand.toLowerCase())
          : true
        return sizeMatch && (styleMatch || brandMatch)
      })
    : products

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
            Showing {displayedProducts.length} of {products.length} products
          </p>
        </div>
      </div>

      {/* Avatar filter bar */}
      <div style={{ background: filtered ? '#f0f7ff' : '#f9f9f9', border: `1px solid ${filtered ? '#b3d4f5' : '#eee'}`, borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          {filtered && avatar ? (
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: '500', fontSize: '15px' }}>🎯 Filtered to your Avatar</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
                Size: {avatar.shoe_size} · Style: {avatar.style_tags} · Brands: {avatar.brand_prefs}
              </p>
            </div>
          ) : (
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: '500', fontSize: '15px' }}>👟 Shop smarter</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>See only products in your size and style</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {filtered ? (
            <button
              onClick={handleReset}
              style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
            >
              Show all
            </button>
          ) : (
            <button
              onClick={handleShopMySize}
              disabled={loading}
              style={{ padding: '10px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
            >
              {loading ? 'Loading...' : '✨ Shop my size'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
      )}

      {/* Product grid */}
      {displayedProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
          <p style={{ fontSize: '48px', margin: '0 0 1rem' }}>🤔</p>
          <p style={{ fontSize: '18px', fontWeight: '500' }}>No exact matches found</p>
          <p style={{ fontSize: '14px' }}>Try updating your avatar preferences or browse all products</p>
          <button onClick={handleReset} style={{ marginTop: '1rem', padding: '10px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Show all products
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {displayedProducts.map(product => (
            <div
              key={product.id}
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
      )}
    </div>
  )
}

export default DemoStore