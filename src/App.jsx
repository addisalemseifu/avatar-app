import { useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase.from('avatars').select('*')
      if (error) {
        console.log('Connection error:', error.message)
      } else {
        console.log('Supabase connected! Data:', data)
      }
    }
    testConnection()
  }, [])

  return (
    <div>
      <h1>Avatar App</h1>
      <p>Check the browser console for connection status</p>
    </div>
  )
}

export default App