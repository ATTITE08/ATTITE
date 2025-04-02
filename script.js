document.addEventListener("DOMContentLoaded", function() {
    const produitSelect = document.getElementById("produit");
    const quantiteInput = document.getElementById("quantite");
    const totalSpan = document.getElementById("total");
    const commandeForm = document.getElementById("commandeForm");
    const statusMessage = document.getElementById("statusMessage");

    function updateTotal() {
        let prixUnitaire = parseInt(produitSelect.options[produitSelect.selectedIndex].getAttribute("data-prix"));
        let quantite = parseInt(quantiteInput.value);
        totalSpan.textContent = (prixUnitaire * quantite) + " FCFA";
    }

    produitSelect.addEventListener("change", updateTotal);
    quantiteInput.addEventListener("input", updateTotal);

    commandeForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        let nom = document.getElementById("nom").value;
        let email = document.getElementById("email").value;
        let produit = produitSelect.value;
        let quantite = parseInt(quantiteInput.value);
        let total = totalSpan.textContent;

        let commande = { nom, email, produit, quantite, total };

        try {
            let response = await fetch("http://localhost:3000/commandes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(commande),
            });

            let data = await response.json();

            if (response.ok) {
                statusMessage.textContent = "✅ Commande enregistrée avec succès !";
                statusMessage.style.color = "green";
                commandeForm.reset();
                updateTotal();
            } else {
                statusMessage.textContent = "❌ Erreur : " + data.message;
                statusMessage.style.color = "red";
                console.error("Erreur serveur :", data.error);
            }
        } catch (error) {
            statusMessage.textContent = "❌ Impossible de contacter le serveur.";
            statusMessage.style.color = "red";
            console.error("Erreur de connexion :", error);
        }
    });
});