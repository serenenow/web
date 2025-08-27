"use client"

import { logger } from "@/lib/utils/logger"
import { useEffect } from "react"

export default function GoogleOAuthPopupPage() {
  useEffect(() => {
    // PKCE helper functions
    const generateRandomString = (length: number): string => {
      const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
      let text = ""
      for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
      }
      return text
    }

    const sha256 = async (plain: string): Promise<ArrayBuffer> => {
      const encoder = new TextEncoder()
      const data = encoder.encode(plain)
      return window.crypto.subtle.digest("SHA-256", data)
    }

    const base64urlencode = (str: ArrayBuffer): string => {
      return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(str))))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "")
    }

    const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
      const hashed = await sha256(codeVerifier)
      return base64urlencode(hashed)
    }

    const initiateGoogleAuth = async () => {
      try {
        const connectBtn = document.getElementById("connectBtn") as HTMLButtonElement
        const loading = document.getElementById("loading") as HTMLDivElement
        const errorDiv = document.getElementById("error") as HTMLDivElement

        if (connectBtn && loading && errorDiv) {
          // Show loading state
          connectBtn.style.display = "none"
          loading.style.display = "block"
          errorDiv.style.display = "none"

          // Generate PKCE parameters
          const codeVerifier = generateRandomString(128)
          const codeChallenge = await generateCodeChallenge(codeVerifier)

          // Store code verifier in localStorage
          localStorage.setItem("google_oauth_code_verifier", codeVerifier)

          // Build Google OAuth URL
          const params = new URLSearchParams({
            client_id: "1067362792264-mo1gp8v8g339iugk549va7se0un730s1.apps.googleusercontent.com", // Replace with actual client ID
            redirect_uri: window.location.origin + "/google-oauth-popup.html",
            response_type: "code",
            scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/meetings.space.created",
            access_type: "offline",
            prompt: "consent",
            code_challenge: codeChallenge,
            code_challenge_method: "S256",
            state: "oauth_popup",
          })

          const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
          logger.info("AUth URL "+ authUrl)

          // Redirect to Google OAuth
          window.location.href = authUrl
        }
      } catch (error) {
        logger.error("Error initiating Google auth:", error)
        showError("Failed to connect to Google. Please try again.")
      }
    }

    const showError = (message: string) => {
      const connectBtn = document.getElementById("connectBtn") as HTMLButtonElement
      const loading = document.getElementById("loading") as HTMLDivElement
      const errorDiv = document.getElementById("error") as HTMLDivElement

      if (connectBtn && loading && errorDiv) {
        connectBtn.style.display = "block"
        loading.style.display = "none"
        errorDiv.textContent = message
        errorDiv.style.display = "block"
      }
    }

    const handleOAuthCallback = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get("code")
      const error = urlParams.get("error")
      const state = urlParams.get("state")

      if (error) {
        logger.error("OAuth error:", error)
        showError(`Authentication failed: ${error}`)
        return
      }

      if (code && state === "oauth_popup") {
        // Retrieve code verifier
        const codeVerifier = localStorage.getItem("google_oauth_code_verifier")

        if (!codeVerifier) {
          showError("Authentication session expired. Please try again.")
          return
        }

        // Clean up localStorage
        localStorage.removeItem("google_oauth_code_verifier")

        // Send data back to parent window
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "GOOGLE_OAUTH_SUCCESS",
              code: code,
              codeVerifier: codeVerifier,
            },
            window.location.origin,
          )

          // Close popup
          window.close()
        } else {
          showError("Unable to communicate with parent window. Please close this window and try again.")
        }
      }
    }

    // Attach click handler to button
    const connectBtn = document.getElementById("connectBtn")
    if (connectBtn) {
      connectBtn.addEventListener("click", initiateGoogleAuth)
    }

    // Check if this is a callback URL
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has("code") || urlParams.has("error")) {
      handleOAuthCallback()
    }

    // Cleanup function
    return () => {
      if (connectBtn) {
        connectBtn.removeEventListener("click", initiateGoogleAuth)
      }
    }
  }, [])

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Connect Google Account</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 400px;
              width: 100%;
            }
            .logo {
              width: 48px;
              height: 48px;
              margin: 0 auto 20px;
              background: #4285f4;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 24px;
            }
            h1 {
              color: #333;
              margin-bottom: 10px;
              font-size: 24px;
            }
            p {
              color: #666;
              margin-bottom: 25px;
              line-height: 1.5;
            }
            .btn {
              background: #4285f4;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-size: 16px;
              cursor: pointer;
              transition: background 0.2s;
              width: 100%;
            }
            .btn:hover {
              background: #3367d6;
            }
            .btn:disabled {
              background: #ccc;
              cursor: not-allowed;
            }
            .loading {
              display: none;
              margin-top: 20px;
            }
            .spinner {
              border: 2px solid #f3f3f3;
              border-top: 2px solid #4285f4;
              border-radius: 50%;
              width: 20px;
              height: 20px;
              animation: spin 1s linear infinite;
              margin: 0 auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .error {
              color: #d93025;
              margin-top: 15px;
              padding: 10px;
              background: #fce8e6;
              border-radius: 4px;
              display: none;
            }
          `,
          }}
        />
      </head>
      <body>
        <div className="container">
          <div className="logo">📅</div>
          <h1>Connect Google Account</h1>
          <p>{"We'll redirect you to Google to grant access to your Calendar for scheduling appointments."}</p>

          <button id="connectBtn" className="btn">
            Connect Google Calendar
          </button>

          <div id="loading" className="loading">
            <div className="spinner"></div>
            <p>Connecting to Google...</p>
          </div>

          <div id="error" className="error"></div>
        </div>
      </body>
    </html>
  )
}
