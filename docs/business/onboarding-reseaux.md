# Accueillir les nouveaux venus d'Instagram et TikTok

**Cible** : des parents de 35 ans et plus qui veulent progresser en CrossFit, préparer un Hyrox ou un TyRun, ou simplement tenir la forme.
**Message** : on ne fait pas ce qu'on veut, on fait ce qu'on peut, et on progresse quand même.
**Ton** : toi, Damien, papa et athlète, qui vit la même chose qu'eux. Jamais « no excuses ».

## Le parcours en un coup d'œil

```
Vidéo (Reel / TikTok)
   └─ appel à l'action : « Commente PROFIL »
        └─ DM automatique : lien vers la landing + quiz (?src=ig ou ?src=tt)
             └─ Landing : 3 questions → profil → inscription (accès libre)
                  └─ App : « Bienvenue · 3 étapes » (jours, records, 1re séance)
                       └─ Toi : DM perso sous 24 h + suivi J3 / J7
                            └─ 4 janvier : abonnement (fondateur 29 €) ou Premium (DM)
```

Chaque inscrit garde sa **provenance** (Instagram, TikTok…). Tu la vois dans `/profil › Abonnés et inscriptions` et dans l'export CSV.

## 1. Mettre en place (une seule fois, environ 2 h)

### Liens à utiliser
- Bio Instagram : `https://<ton-site>/?src=ig`
- Bio TikTok : `https://<ton-site>/?src=tt`
- Stories et DM : `https://<ton-site>/?src=ig-story` / `?src=ig-dm` pour savoir ce qui convertit
- Box, salles, TyRun : `?src=box-<nom>`, `?src=tyrun`

`<ton-site>` est l'adresse Render pour l'instant. Un nom de domaine (environ 10 à 15 €/an) fait plus pro : branche-le dans Render (Settings → Custom Domains) et mets à jour `APP_URL`.

### Bio Instagram et TikTok (150 caractères)
> Papa · coach · athlète 35+ 🏋️
> CrossFit · Hyrox · Functional pour parents pressés
> On fait ce qu'on peut. Et on progresse.
> 👇 Ton profil en 3 questions

### Stories à la une (5 bulles)
1. **COMMENCER** : 3 stories : « Tu as 35 ans et plus, des enfants, peu de temps ? → quiz → lien ».
2. **PROFILS** : une story par profil (CrossFit, Hybrid, Functional), avec pour qui c'est fait.
3. **L'APP** : enregistrement d'écran : séance du jour, chrono, version courte, feedback vocal.
4. **RÉSULTATS** : retours d'athlètes, cartes de partage, PR battus (avec leur accord).
5. **MA VIE** : ta semaine avec ton fils et sans lui, comment tu cales tes séances.

### Publications épinglées (3)
1. « Qui je suis » : papa, coach, pourquoi Corpus Program.
2. « Le quiz » : quel profil pour toi ? (carrousel avec les 3 questions).
3. « On fait ce qu'on peut » : ta semaine type de parent, réelle.

### Automatisation « commente un mot-clé » (ManyChat ou équivalent)
Instagram autorise les DM automatiques aux personnes qui commentent, via un outil connecté comme ManyChat. Vérifie le tarif du moment : une offre gratuite limitée existe en général. Sur TikTok, l'automatisation est plus limitée : réponds à la main ou mets le lien en bio.

| Mot-clé | DM automatique |
|---|---|
| **PROFIL** | « Hello 👋 Voici le quiz : 3 questions pour trouver ton profil (CrossFit, Hybrid ou Functional). Accès libre jusqu'au 3 janvier, sans carte → [lien ?src=ig-dm]. Tu as des enfants ? Moi aussi, l'app est pensée pour ça 😉 » |
| **HYROX** / **TYRUN** | « Top ! Le profil Hybrid prépare Hyrox, TyRun… ou juste tes chiffres : force et cardio continu, tests réguliers. Commence ici → [lien ?profil=hybrid&src=ig-dm]. Ta course, c'est quand ? » |
| **20MIN** | « Le profil Functional : 3 modules de 20 min à placer quand tu peux, plus un jour tampon pour rattraper. → [lien ?profil=functional&src=ig-dm] » |
| **PREMIUM** | Pas d'automatisation : réponds toi-même (script ci-dessous). |

Un lien `https://<ton-site>/signup?profil=hybrid&src=ig-dm` arrive directement sur l'inscription avec le profil déjà choisi.

## 2. Scripts de DM (à copier, puis à personnaliser)

**Nouvel abonné qui a interagi** (toi, sous 24 h) :
> Salut [prénom], merci pour le follow 🙏 Question rapide : tu t'entraînes plutôt CrossFit, Hyrox, ou tu veux juste tenir la forme avec le rythme de la vie de parent ?

**Après sa réponse** :
> Je vois. Moi c'est pareil : les semaines où j'ai mon fils, je fais avec ce que j'ai. J'ai construit une app pour ça : 3 questions et tu as ton programme. C'est gratuit jusqu'au 3 janvier → [lien]. Dis-moi ce que tu en penses !

**Inscrit depuis 3 jours sans première séance** (repère-le dans `/profil`) :
> Hey [prénom], tu as pu lancer ta première séance ? Si la semaine est chargée, prends la « version courte » : l'important c'est de commencer, pas d'être parfait.

**Après sa première séance** (tu reçois son feedback dans `/retours`) :
> Bien joué pour ta première ! J'ai lu ton retour [détail]. On ajuste [conseil]. Continue comme ça 💪

**Demande Premium** :
> Merci ! Le Premium, c'est 15 places à 149 €/mois : ta programmation plus un bilan chaque semaine avec moi, des ajustements selon ta semaine, ta récup et ta course. Avant de te proposer une place : tu t'entraînes combien de fois par semaine en ce moment, et quel est ton objectif dans 3 mois ?

## 3. La séquence de bienvenue (premiers 14 jours)

| Quand | Où | Quoi |
|---|---|---|
| J0 | App | Carte « Bienvenue · 3 étapes » : jours dispos, records, première séance (automatique) |
| J0–J1 | DM | Message perso de bienvenue (script ci-dessus) |
| J3 | DM | Relance si pas de séance (« version courte ») |
| J7 | DM ou story | « Ta première semaine ? » + demande de partager sa carte de séance |
| J14 | DM | « Qu'est-ce qui t'aiderait à tenir ? » : ta meilleure source d'idées de contenu |

**E-mails** : seulement pour les inscrits qui ont coché la case (export CSV dans `/profil`). Importe-les dans Brevo (offre gratuite) et envoie 1 e-mail par semaine au maximum.

## 4. Le passage au payant (décembre → janvier)

| Date | Action |
|---|---|
| 1er décembre → 20 décembre | Contenu quotidien, quiz, inscriptions. Rien à vendre. |
| 21 décembre | Story et post : « Le 4 janvier, Corpus Program devient payant. 30 places fondateur à 29 €/mois à vie. » |
| 28 décembre | Rappel + témoignages des testeurs |
| 2 janvier | « Plus que 2 jours d'accès libre » (story + DM aux inscrits actifs) |
| 4 janvier | Lancement : « C'est parti ». L'app demande l'abonnement, et le premier prélèvement des abonnés de décembre tombe ce jour-là |
| 31 janvier | Fin du tarif fondateur |

## 5. Contenu : montrer la vraie vie de parent

### 4 piliers (environ 4 Reels/TikTok par semaine)
1. **La vraie vie** (30 %) : « Séance de 35 min pendant la sieste / avant l'école ». « Semaine avec mon fils : 3 séances, version courte. Et c'est OK. » « Ce que j'ai sauté cette semaine, et comment le jour tampon a sauvé ma semaine. »
2. **Technique utile** (30 %) : un mouvement bloquant par vidéo (arraché, tractions strictes, double unders), en 30 secondes, pour les 35+ (mobilité, épaules, dos).
3. **Hyrox / TyRun** (25 %) : la séance du jour, les stations, l'allure, « 1 an de prépa en étant papa ».
4. **Preuves** (15 %) : PR des athlètes, cartes de partage, retours vocaux (avec leur accord).

### Accroches qui parlent aux parents 35+
- « Tu as 40 ans, deux enfants, et 45 minutes. Voilà ce que je fais. »
- « Ce que personne ne dit sur l'entraînement quand tu es parent. »
- « J'ai sauté 2 séances cette semaine. Voilà pourquoi ce n'est pas grave. »
- « Hyrox à 38 ans avec un enfant : ma semaine réelle. »
- « La version courte de ma séance, quand le petit se réveille plus tôt. »
- « Ton corps à 35 ans n'est pas celui de tes 25 ans. Entraîne-le en conséquence. »
- « On ne fait pas ce qu'on veut. On fait ce qu'on peut. »

### Ton rythme selon ta semaine
- **Semaine avec ton fils** : minimum non négociable (une story, 5 DM, cocher le suivi). Tu publies les vidéos tournées à l'avance. Ta réalité *est* le contenu : filme 15 secondes de ta séance courte.
- **Semaine sans ton fils** : la journée type (75 à 90 min), plus un bloc de tournage de 2 h pour préparer 6 à 8 vidéos de la semaine suivante.
