import jwt from 'jsonwebtoken'

// Prod:
const JWT_SECRET = process.env.JWT_SECRET || 'rVng3S6ApC2vVLWjrmsGx97FRijWWchJ'
const USER_ID = process.env.USER_ID || '194881'
// 194879: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE5NDg3OSIsImNsaWVudElkIjoiUE9SVEFMIiwiaWF0IjoxNjUxNzUzOTg4LCJleHAiOjE2NTQzNDU5ODh9.8Ua_BqzYZLx01PabDjqsvlHYv4HyZAh49h66s5YalKI

class GenJWTToken {
  gen() {
    return jwt.sign({
      id: USER_ID, clientId: 'PORTAL'
    },
      JWT_SECRET, {
        expiresIn: '30 days'
      }
    )
  }
}

export default new GenJWTToken()