-- Promeut le compte fondateur en COACH (rôle par défaut ATHLETE sinon).
-- Idempotent : ne fait rien si le compte n'existe pas encore.
UPDATE "User" SET "role" = 'COACH' WHERE lower("email") = 'damien.sauveur@gmail.com';
