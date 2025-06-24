function showSignInModal() {
  showCustomModal(`
    <div class="w-schedule-modal__body padding-md width-100%">
      <div class="text-component">
        <h1 class="text-xl">Connexion</h1>
        <form id="sign-in-form">
          <input class="form-control margin-bottom-sm" name="nom" placeholder="Nom" required />
          <input class="form-control margin-bottom-sm" name="prenom" placeholder="Prénom" required />
          <input class="form-control margin-bottom-sm" name="password" type="password" placeholder="Mot de passe" required />
          <button class="btn btn--primary margin-top-sm">Se connecter</button>
        </form>
      </div>
    </div>
  `);

  document.getElementById('sign-in-form').onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const res = await fetch('/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) alert('✅ Connecté'); else alert('❌ Erreur de connexion');
  };
}

function showSignUpModal() {
  showCustomModal(`
    <div class="w-schedule-modal__body padding-md width-100%">
      <div class="text-component">
        <h1 class="text-xl">Créer un compte</h1>
        <form id="sign-up-form">
          <input class="form-control margin-bottom-sm" name="nom" placeholder="Nom" required />
          <input class="form-control margin-bottom-sm" name="prenom" placeholder="Prénom" required />
          <input class="form-control margin-bottom-sm" name="password" type="password" placeholder="Mot de passe" required />
          <button class="btn btn--primary margin-top-sm">Créer</button>
        </form>
      </div>
    </div>
  `);

  document.getElementById('sign-up-form').onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const res = await fetch('/auth/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) alert('✅ Compte créé'); else alert('❌ Erreur lors de l’inscription');
  };
}

function signOut() {
  fetch('/auth/signout', { method: 'POST' })
    .then(res => {
      if (res.ok) alert('👋 Déconnecté');
      else alert('❌ Erreur lors de la déconnexion');
    });
}
