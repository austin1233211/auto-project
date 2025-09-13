class AuthManager {
  constructor() {
    this.currentPlayer = null;
    this.isAuthenticated = false;
    this.onAuthChange = null;
  }

  async initialize() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const response = await apiClient.getProfile();
        this.currentPlayer = response.player;
        this.isAuthenticated = true;
        this.notifyAuthChange();
      } catch (error) {
        console.error('Token validation failed:', error);
        this.logout();
      }
    }
  }

  async login(email, password) {
    try {
      const response = await apiClient.login(email, password);
      apiClient.refreshToken();
      this.currentPlayer = response.player;
      this.isAuthenticated = true;
      this.notifyAuthChange();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async register(username, email, password) {
    try {
      const response = await apiClient.register(username, email, password);
      apiClient.refreshToken();
      this.currentPlayer = response.player;
      this.isAuthenticated = true;
      this.notifyAuthChange();
      return response;
    } catch (error) {
      throw error;
    }
  }

  logout() {
    apiClient.clearToken();
    apiClient.disconnectWebSocket();
    this.currentPlayer = null;
    this.isAuthenticated = false;
    this.notifyAuthChange();
  }

  setAuthChangeCallback(callback) {
    this.onAuthChange = callback;
  }

  notifyAuthChange() {
    if (this.onAuthChange) {
      this.onAuthChange(this.isAuthenticated, this.currentPlayer);
    }
  }

  requireAuth() {
    if (!this.isAuthenticated) {
      throw new Error('Authentication required');
    }
  }

  showLoginForm() {
    const loginHtml = `
      <div id="login-screen" class="screen">
        <div class="login-container">
          <h2>Auto Gladiators</h2>
          <div class="login-form">
            <div class="form-group">
              <input type="email" id="login-email" placeholder="Email" required>
            </div>
            <div class="form-group">
              <input type="password" id="login-password" placeholder="Password" required>
            </div>
            <button id="login-btn" class="btn primary">Login</button>
            <button id="register-btn" class="btn secondary">Register</button>
          </div>
          <div id="login-error" class="error-message" style="display: none;"></div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', loginHtml);
    this.attachLoginEvents();
  }

  attachLoginEvents() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const errorDiv = document.getElementById('login-error');

    const showError = (message) => {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    };

    const hideError = () => {
      errorDiv.style.display = 'none';
    };

    loginBtn.addEventListener('click', async () => {
      hideError();
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        showError('Please enter both email and password');
        return;
      }

      try {
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';
        
        await this.login(email, password);
        document.getElementById('login-screen').remove();
        
      } catch (error) {
        showError(error.message || 'Login failed');
      } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
      }
    });

    registerBtn.addEventListener('click', () => {
      this.showRegisterForm();
    });

    [emailInput, passwordInput].forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          loginBtn.click();
        }
      });
    });
  }

  showRegisterForm() {
    document.getElementById('login-screen').remove();
    
    const registerHtml = `
      <div id="register-screen" class="screen">
        <div class="login-container">
          <h2>Create Account</h2>
          <div class="login-form">
            <div class="form-group">
              <input type="text" id="register-username" placeholder="Username" required>
            </div>
            <div class="form-group">
              <input type="email" id="register-email" placeholder="Email" required>
            </div>
            <div class="form-group">
              <input type="password" id="register-password" placeholder="Password (min 6 chars)" required>
            </div>
            <button id="register-submit-btn" class="btn primary">Create Account</button>
            <button id="back-to-login-btn" class="btn secondary">Back to Login</button>
          </div>
          <div id="register-error" class="error-message" style="display: none;"></div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', registerHtml);
    this.attachRegisterEvents();
  }

  attachRegisterEvents() {
    const submitBtn = document.getElementById('register-submit-btn');
    const backBtn = document.getElementById('back-to-login-btn');
    const usernameInput = document.getElementById('register-username');
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');
    const errorDiv = document.getElementById('register-error');

    const showError = (message) => {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    };

    const hideError = () => {
      errorDiv.style.display = 'none';
    };

    submitBtn.addEventListener('click', async () => {
      hideError();
      const username = usernameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!username || !email || !password) {
        showError('Please fill in all fields');
        return;
      }

      if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';
        
        await this.register(username, email, password);
        document.getElementById('register-screen').remove();
        
      } catch (error) {
        showError(error.message || 'Registration failed');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
      }
    });

    backBtn.addEventListener('click', () => {
      document.getElementById('register-screen').remove();
      this.showLoginForm();
    });

    [usernameInput, emailInput, passwordInput].forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          submitBtn.click();
        }
      });
    });
  }
}

const authManager = new AuthManager();
