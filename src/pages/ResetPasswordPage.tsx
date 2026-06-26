import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>()
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })

      if (response.ok) {
        alert('Password updated successfully!')
        navigate('/login')
      } else {
        setMessage('Error updating password. The link might be expired.')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again later.')
    }
  }

  return (
    <div className="reset-container">
      <h2>Set your new password</h2>
      <form onSubmit={handleReset}>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Update Password</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}

export default ResetPasswordPage
