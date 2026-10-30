(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const client = window.lightFromAfarAuth && window.lightFromAfarAuth.client;
  const status = document.getElementById('auth-status');
  const configNote = document.getElementById('auth-config-note');
  const requestedRecovery = params.get('mode') === 'recovery';
  let recoverySessionReady = Boolean(window.lightFromAfarAuth && window.lightFromAfarAuth.recoverySessionActive);
  let recoveryPending = requestedRecovery && !recoverySessionReady && Boolean(client);
  let mode = requestedRecovery
    ? (recoverySessionReady ? 'recovery' : 'signin')
    : ['signin', 'signup', 'forgot'].includes(params.get('mode'))
    ? params.get('mode')
    : 'signin';
  let busy = false;
  let appReturnStarted = false;

  function setStatus(message, kind) {
    status.textContent = message || '';
    status.dataset.kind = kind || '';
  }

  function setMode(nextMode) {
    mode = nextMode;
    const signIn = mode === 'signin';
    const signUp = mode === 'signup';
    const recovery = mode === 'recovery';
    const forgot = mode === 'forgot';
    const simpleAuth = signIn || signUp;

    document.getElementById('signin-tab').setAttribute('aria-selected', String(signIn));
    document.getElementById('signup-tab').setAttribute('aria-selected', String(signUp));
    document.getElementById('auth-tabs').hidden = !simpleAuth || recoveryPending;
    document.getElementById('auth-social').hidden = !simpleAuth || recoveryPending;
    document.getElementById('auth-divider').hidden = !simpleAuth || recoveryPending;
    document.getElementById('name-field').hidden = !signUp;
    document.getElementById('email-field').hidden = recovery || recoveryPending;
    document.getElementById('password-field').hidden = !(signIn || signUp) || recoveryPending;
    document.getElementById('confirm-field').hidden = !signUp;
    document.getElementById('recovery-field').hidden = !recovery;
    document.getElementById('forgot-password').hidden = !signIn;
    document.getElementById('auth-cancel').hidden = simpleAuth || recoveryPending;
    document.getElementById('auth-submit').hidden = recoveryPending;
    document.getElementById('auth-email').required = !recovery && !recoveryPending;
    document.getElementById('auth-password').required = signIn || signUp;
    document.getElementById('auth-confirm-password').required = signUp;
    document.getElementById('auth-new-password').required = recovery;
    document.getElementById('auth-new-password-confirm').required = recovery;

    const titles = {
      signin: ['Welcome back', 'Sign in to your Light from Afar account.', 'Sign in'],
      signup: ['Create your account', 'Save your profile and keep your astrophotography workflow together.', 'Create account'],
      forgot: ['Reset your password', 'We’ll send a password reset link to your email address.', 'Send reset link'],
      recovery: ['Choose a new password', 'Choose and confirm your new password.', 'Update password']
    }[mode];
    document.getElementById('auth-title').textContent = titles[0];
    document.getElementById('auth-description').textContent = titles[1];
    document.getElementById('auth-submit').textContent = titles[2];
    document.getElementById('auth-password').autocomplete = signUp ? 'new-password' : 'current-password';
    if (mode !== 'recovery') setStatus('');
  }

  function setBusy(nextBusy) {
    busy = nextBusy;
    document.querySelectorAll('#auth-form button, .lfa-auth-provider, .lfa-auth-tab').forEach(function (button) {
      button.disabled = busy;
    });
    if (!busy) document.getElementById('auth-submit').textContent = ({
      signin: 'Sign in', signup: 'Create account', forgot: 'Send reset link', recovery: 'Update password'
    })[mode];
  }

  function returnToApp() {
    if (appReturnStarted) return;
    appReturnStarted = true;
    try { sessionStorage.setItem('lfa-auth-map-refresh', '1'); } catch (error) {}
    window.location.replace(new URL('index.html', window.location.href).href);
  }

  function showConfiguration() {
    if (!window.lightFromAfarAuth || !window.lightFromAfarAuth.configured) {
      configNote.hidden = false;
      configNote.textContent = (window.lightFromAfarAuth && window.lightFromAfarAuth.error) || 'Authentication is not configured yet.';
      return false;
    }
    configNote.hidden = true;
    return true;
  }

  async function signInWithProvider(provider) {
    if (busy) return;
    if (!showConfiguration()) return;
    setBusy(true);
    setStatus('Opening Google sign in…');
    try { sessionStorage.setItem('lfa-auth-map-refresh', '1'); } catch (error) {}
    try {
      const redirectTo = new URL('index.html', window.location.href).href;
      const options = { redirectTo: redirectTo };
      if (provider === 'google') options.queryParams = { prompt: 'select_account' };
      const result = await client.auth.signInWithOAuth({
        provider: provider,
        options: options
      });
      if (result.error) throw result.error;
    } catch (error) {
      try { sessionStorage.removeItem('lfa-auth-map-refresh'); } catch (storageError) {}
      setBusy(false);
      setStatus(error.message || 'Could not start sign in.', 'error');
    }
  }

  async function submitEmailForm(event) {
    event.preventDefault();
    if (busy) return;
    if (!showConfiguration()) return;

    const email = document.getElementById('auth-email').value.trim().toLowerCase();
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('Enter a valid email address.', 'error');
      return;
    }
    if (mode === 'signup') {
      if (!name) { setStatus('Enter your name.', 'error'); return; }
      if (password.length < 8) { setStatus('Use a password with at least 8 characters.', 'error'); return; }
      if (password !== document.getElementById('auth-confirm-password').value) {
        setStatus('The passwords do not match.', 'error');
        return;
      }
    }
    if (mode === 'signin' && !password) { setStatus('Enter your password.', 'error'); return; }

    setBusy(true);
    setStatus(mode === 'signup' ? 'Creating your account…' : 'Signing in…');
    try {
      const appUrl = new URL('index.html', window.location.href).href;
      let result;
      if (mode === 'signup') {
        result = await client.auth.signUp({
          email: email,
          password: password,
          options: {
            data: { display_name: name },
            emailRedirectTo: appUrl
          }
        });
        if (result.error) throw result.error;
        if (result.data.session) {
          setStatus('Account created. Opening your sky workspace…', 'success');
          returnToApp();
          return;
        }
        setStatus('Account created. Check your email and confirm your address to finish registration.', 'success');
        setBusy(false);
        return;
      }

      result = await client.auth.signInWithPassword({ email: email, password: password });
      if (result.error) throw result.error;
      setStatus('Signed in. Opening your sky workspace…', 'success');
      returnToApp();
    } catch (error) {
      setBusy(false);
      setStatus(error.message || 'Authentication failed. Please try again.', 'error');
    }
  }

  async function sendPasswordReset() {
    if (busy) return;
    if (!showConfiguration()) return;
    const email = document.getElementById('auth-email').value.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('Enter your account email address first.', 'error');
      return;
    }
    setBusy(true);
    setStatus('Sending password reset link…');
    try {
      const redirectTo = new URL('auth.html?mode=recovery', window.location.href).href;
      const result = await client.auth.resetPasswordForEmail(email, { redirectTo: redirectTo });
      if (result.error) throw result.error;
      setStatus('If an account uses that address, a password reset link is on its way.', 'success');
    } catch (error) {
      setStatus(error.message || 'Could not send the reset email.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function updatePassword(event) {
    event.preventDefault();
    if (busy) return;
    if (!showConfiguration()) return;
    if (!recoverySessionReady) {
      setStatus('Open the password reset link from your email first. This link is not an active recovery session.', 'error');
      return;
    }
    const password = document.getElementById('auth-new-password').value;
    const confirm = document.getElementById('auth-new-password-confirm').value;
    if (password.length < 8) { setStatus('Use a password with at least 8 characters.', 'error'); return; }
    if (password !== confirm) { setStatus('The passwords do not match.', 'error'); return; }
    setBusy(true);
    setStatus('Updating your password…');
    try {
      const result = await client.auth.updateUser({ password: password });
      if (result.error) throw result.error;
      setStatus('Password updated. Returning to your sky workspace…', 'success');
      window.setTimeout(returnToApp, 900);
    } catch (error) {
      setBusy(false);
      setStatus(error.message || 'Could not update the password.', 'error');
    }
  }

  document.getElementById('signin-tab').addEventListener('click', function () { setMode('signin'); });
  document.getElementById('signup-tab').addEventListener('click', function () { setMode('signup'); });
  document.getElementById('google-signin').addEventListener('click', function () { signInWithProvider('google'); });
  document.getElementById('forgot-password').addEventListener('click', function () { setMode('forgot'); });
  document.getElementById('auth-cancel').addEventListener('click', function () { setMode('signin'); });
  document.getElementById('auth-form').addEventListener('submit', function (event) {
    if (mode === 'recovery') updatePassword(event);
    else if (mode === 'forgot') { event.preventDefault(); sendPasswordReset(); }
    else submitEmailForm(event);
  });

  setMode(mode);
  if (params.get('confirmed') === '1') setStatus('Email confirmed. You can now sign in.', 'success');
  if (requestedRecovery && !recoverySessionReady) setStatus('Checking your password reset link…');
  if (!showConfiguration()) configNote.textContent += ' The public app remains available without an account.';
  if (requestedRecovery && !client) setStatus('Password recovery is unavailable until authentication is configured.', 'error');

  if (client) {
    client.auth.onAuthStateChange(function (event, session) {
      if (event === 'PASSWORD_RECOVERY') {
        recoverySessionReady = true;
        recoveryPending = false;
        window.lightFromAfarAuth.recoverySessionActive = true;
        setMode('recovery');
        setStatus('Reset link verified. Choose your new password.', 'success');
      } else if (event === 'SIGNED_OUT') {
        recoverySessionReady = false;
        window.lightFromAfarAuth.recoverySessionActive = false;
      } else if (!requestedRecovery && session && (mode === 'signin' || mode === 'signup')) {
        returnToApp();
      }
    });
    client.auth.getSession().then(function (result) {
      if (!requestedRecovery && !result.error && result.data.session && (mode === 'signin' || mode === 'signup')) returnToApp();
    });
    if (requestedRecovery && !recoverySessionReady) {
      window.setTimeout(function () {
        if (!recoverySessionReady) {
          recoveryPending = false;
          setMode('signin');
          setStatus('We could not verify this reset link. Check your connection; if the link has expired, request a new one.', 'error');
        }
      }, 2000);
    }
  }
})();
