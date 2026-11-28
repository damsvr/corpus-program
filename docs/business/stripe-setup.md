# Brancher Stripe (environ 30 min, à faire une fois)

L'app fonctionne **sans** Stripe : tant que les clés ne sont pas saisies, la page `/abonnement` affiche « le paiement arrive très bientôt ». Jusqu'au **3 janvier 2027 inclus** (`FREE_ACCESS_UNTIL`), tout le monde teste librement. À partir du **lundi 4 janvier**, un athlète sans abonnement est redirigé vers `/abonnement`. Son historique et ses records sont conservés.

Ne sont jamais facturés : ton compte coach et les inscrits d'un lien d'accès gratuit (TyRun).

## 1. Compte Stripe
1. Crée le compte sur stripe.com avec ton **numéro d'entreprise BCE** et ton compte bancaire professionnel.
2. Reste en **mode test** pour les étapes 2 à 4 : les clés commencent par `sk_test_`. Carte de test : `4242 4242 4242 4242`, n'importe quelle date future, n'importe quel CVC.

## 2. Produit et prix
Catalogue de produits → **Ajouter un produit** « Corpus Program » :
- prix récurrent mensuel de **39,00 EUR**, à noter dans `STRIPE_PRICE_ID` (`price_…`) ;
- un second prix mensuel de **29,00 EUR**, nommé « Membre fondateur », à noter dans `STRIPE_FOUNDER_PRICE_ID`.

Tant que tu es en franchise de TVA, ces prix sont des montants finaux, sans TVA. Le jour où tu passes au régime normal, demande à ton comptable comment traiter la TVA (Stripe Tax ou prix TTC inchangés).

## 3. Webhook
Développeurs → Webhooks → **Ajouter un endpoint** :
- URL : `https://<ton-app>.onrender.com/api/stripe/webhook`
- événements : `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
- copie le **secret de signature** (`whsec_…`) dans `STRIPE_WEBHOOK_SECRET`.

## 4. Portail client
Paramètres → Billing → **Portail client** → Activer. Autorise : mise à jour de la carte, factures, **résiliation en fin de période**. C'est ce que voit l'athlète quand il touche « Gérer ma carte, mes factures, résilier ».

## 5. Variables sur Render
Dashboard Render → service `corpus-program` → Environment :

| Variable | Valeur |
|---|---|
| `APP_URL` | `https://<ton-app>.onrender.com` (ou ton domaine) |
| `STRIPE_SECRET_KEY` | `sk_test_…`, puis `sk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` |
| `STRIPE_PRICE_ID` | prix à 39 € |
| `STRIPE_FOUNDER_PRICE_ID` | prix à 29 € |
| `LEGAL_NAME`, `LEGAL_ADDRESS`, `LEGAL_EMAIL`, `LEGAL_BCE` | tes informations légales (affichées sur `/mentions-legales`, `/cgv`, `/confidentialite`) |

`FREE_ACCESS_UNTIL`, `FOUNDER_UNTIL` et `FOUNDER_SEATS` sont déjà dans `render.yaml`. Change-les sur Render si tu veux décaler une date.

## 6. Tester, puis passer en réel
1. En mode test : crée un compte athlète, va sur `/abonnement`, paie avec la carte 4242, puis vérifie dans `/profil` (compte coach) que « Payants » est passé à 1.
2. Pendant l'accès libre, le premier prélèvement est automatiquement décalé au **4 janvier** : l'athlète voit « période d'essai ».
3. Pour passer en réel, refais les étapes 2 à 4 en **mode live** (les prix et le webhook ne sont pas copiés depuis le mode test) et remplace les 4 variables Stripe sur Render.

## Bon à savoir
- **Plan Render free** : le service se met en veille, et le premier visiteur attend environ 30 s. Stripe relance un webhook qui échoue, donc rien n'est perdu, mais pour des clients payants **passe au plan Starter (environ 7 $/mois) avant le 4 janvier**.
- **Codes promo** : ils sont activés dans Checkout. Tu peux créer un coupon dans Stripe (ex. un mois offert pour un partenaire TyRun).
- **Places fondateur** : le compteur s'appuie sur les abonnés en cours au prix fondateur. Après le 31 janvier ou à 30 places, les nouveaux abonnés paient 39 €, et les fondateurs gardent 29 €.
