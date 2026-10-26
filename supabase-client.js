(function () {
  'use strict';

  const config = window.LIGHT_FROM_AFAR_AUTH_CONFIG || {};
  const library = window.supabase;
  const url = String(config.supabaseUrl || '').trim();
  const key = String(config.publishableKey || '').trim();

  window.lightFromAfarAuth = {
    client: null,
    configured: Boolean(url && key && library && typeof library.createClient === 'function'),
    recoverySessionActive: false,
    error: ''
  };

  if (!window.lightFromAfarAuth.configured) {
    window.lightFromAfarAuth.error = !library
      ? 'The authentication library did not load. Check your internet connection and reload.'
      : 'Authentication needs a Supabase project URL and publishable key in auth-config.js.';
    return;
  }

  try {
    window.lightFromAfarAuth.client = library.createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true
      }
    });
    // Subscribe immediately so the password-recovery event is recorded even
    // before auth-page.js finishes loading.
    window.lightFromAfarAuth.recoverySubscription = window.lightFromAfarAuth.client.auth.onAuthStateChange(function (event) {
      if (event === 'PASSWORD_RECOVERY') window.lightFromAfarAuth.recoverySessionActive = true;
      else if (event === 'SIGNED_OUT') window.lightFromAfarAuth.recoverySessionActive = false;
    }).data.subscription;
  } catch (error) {
    window.lightFromAfarAuth.configured = false;
    window.lightFromAfarAuth.error = 'Could not initialize authentication: ' + error.message;
  }
})();
