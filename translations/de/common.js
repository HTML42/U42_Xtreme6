window.TRANSLATIONS = Array.isArray(window.TRANSLATIONS) ? window.TRANSLATIONS : [];

Object.assign(window.TRANSLATIONS, {
  'errors.missing_parameters': 'Fehlende Parameter.',
  'errors.no_permission': 'Keine Berechtigung.',
  'errors.invalid_currency': 'Ungültige Währung.',
  'errors.update_failed': 'Aktualisierung fehlgeschlagen.',

  'errors.login.deleted': 'Dein Konto wurde gelöscht.',
  'errors.login.id': 'Ungültige Login-ID.',
  'errors.login.notfound': 'Benutzer nicht gefunden.',

  'errors.registration.username_required': 'Bitte gib einen Benutzernamen ein.',
  'errors.registration.username_too_short': 'Benutzername zu kurz (mindestens 4 Zeichen).',
  'errors.registration.username_exists': 'Der Benutzername ist bereits vergeben.',
  'errors.registration.email_required': 'Bitte gib eine E-Mail-Adresse ein.',
  'errors.registration.email_invalid': 'E-Mail muss eine gültige E-Mail-Adresse sein.',
  'errors.registration.email_exists': 'Diese E-Mail-Adresse wird bereits verwendet.',
  'errors.registration.password_required': 'Bitte gib ein Passwort ein.',
  'errors.registration.password_too_short': 'Passwort zu kurz (mindestens 8 Zeichen).',
  'errors.registration.password2_required': 'Bitte bestätige dein Passwort.',
  'errors.registration.passwords_mismatch': 'Die beiden Passwörter sind nicht gleich.',
  'errors.registration.failed': 'Registrierung fehlgeschlagen.',

  'errors.password_change.current_password_required': 'Bitte gib dein aktuelles Passwort ein.',
  'errors.password_change.current_password_invalid': 'Dein aktuelles Passwort ist nicht korrekt.',
  'errors.password_change.new_password_required': 'Bitte gib ein neues Passwort ein.',
  'errors.password_change.new_password_too_short': 'Neues Passwort zu kurz (mindestens 8 Zeichen).',
  'errors.password_change.new_password_repeat_required': 'Bitte wiederhole dein neues Passwort.',
  'errors.password_change.passwords_mismatch': 'Die neuen Passwörter stimmen nicht überein.',
  'errors.password_change.failed': 'Passwortänderung fehlgeschlagen.',

  'errors.email_confirmation.invalid_link': 'Ungültiger Bestätigungslink.',
  'errors.email_confirmation.expired': 'Der Bestätigungslink ist abgelaufen.',
  'errors.email_confirmation.already_used': 'Dieser Bestätigungslink wurde bereits verwendet.',
  'errors.email_confirmation.user_deleted': 'Dieses Konto kann nicht aktiviert werden.',
  'errors.email_confirmation.failed': 'E-Mail-Bestätigung fehlgeschlagen.',

  'ui.sidebar.title': 'Navigation',
  'ui.footer.text': 'Extreme Web Framework Version 6',

  'ui.view.index.intro': 'Willkommen im Xtreme6 Frontend mit JS-Templates.',
  'ui.view.imprint.intro': 'Hier findest du alle rechtlichen Informationen (Impressum).',
  'ui.view.privacy.intro': 'Hier findest du unsere Datenschutzinformationen.',
  'ui.view.login.intro': 'Melde dich an, um deine Pläne, Einzahlungen und Auszahlungen zu verwalten.',
  'ui.view.registration.intro': 'Bitte fülle alle Felder aus, um dein Konto zu erstellen.'
});
