export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { rating, comment, date } = req.body;

    if (!rating || typeof rating !== "number") {
      return res.status(400).json({ error: "Note manquante ou invalide" });
    }

    console.log("NOUVEL_AVIS", JSON.stringify({ rating, comment: comment || "", date }));

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'avis:", error);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
}
