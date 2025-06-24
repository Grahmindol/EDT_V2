function showSignUpForm() {
  showCustomModal(`
    <div class="w-schedule-modal__body padding-md width-100%@md height-100%@md">
      <div class="text-component">
        <h1 class="text-xl">Créer un compte</h1>
        <form id="sign-up-form">
          <input type="text" name="nom" placeholder="Nom" required />
          <input type="text" name="prenom" placeholder="Prénom" required />
          <input type="password" name="password" placeholder="Mot de passe" required />
          <button class="btn btn--primary" type="submit">Créer</button>
        </form>
      </div>
    </div>
    <script> console.log(document.getElementById('sign-up-form')) </script>
  `);
}


function showSignInForm() {
  showCustomModal(`
    <div class="w-schedule-modal__body padding-md width-100%@md height-100%@md">
      <div class="text-component">
        <h1 class="text-xl">Connexion</h1>
        <form id="sign-in-form">
          <input type="text" name="nom" placeholder="Nom" required />
          <input type="text" name="prenom" placeholder="Prénom" required />
          <input type="password" name="password" placeholder="Mot de passe" required />
          <button class="btn btn--primary" type="submit">Se connecter</button>
        </form>
      </div>
    </div>
  `);
}


my_schedule.modal[0].addEventListener('modalIsOpen', () => {
  // Attache les listeners une fois que la modale est affichée
  const signUpForm = document.getElementById('sign-up-form');
  const signInForm = document.getElementById('sign-in-form');

  if (signUpForm) {
    signUpForm.onsubmit = async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(signUpForm));
      const res = await fetch('/auth/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      alert(res.ok ? '✅ Compte créé !' : '❌ Erreur');
    };
  }

  if (signInForm) {
    signInForm.onsubmit = async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(signInForm));
      const res = await fetch('/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      alert(res.ok ? '✅ Connecté !' : '❌ Identifiants invalides');
    };
  }
});

async function signOut() {
  const res = await fetch('/auth/signout', { method: 'POST' });
  alert(res.ok ? '🚪 Déconnecté' : '❌ Erreur déconnexion');
}
