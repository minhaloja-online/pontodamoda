/* ==========================================================
   CONFIGURAÇÃO DO FIREBASE
   ----------------------------------------------------------
   Cole aqui os dados do seu projeto:
   Firebase Console > Configurações do projeto > Seus apps > Web

   Enquanto estiver com os valores "SEU_..." o site funciona
   normalmente, mas só com o conteúdo padrão (sem salvar nada).
   ========================================================== */

export const firebaseConfig = {
  apiKey:            "SEU_API_KEY",
  authDomain:        "SEU_PROJETO.firebaseapp.com",
  projectId:         "SEU_PROJETO",
  storageBucket:     "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId:             "SEU_APP_ID"
};

/* true quando a configuração já foi preenchida de verdade */
export const isConfigured = !String(firebaseConfig.apiKey).startsWith("SEU_");
