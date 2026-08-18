/* ==========================================================
   CONFIGURAÇÃO DO FIREBASE
   ----------------------------------------------------------
   Cole aqui os dados do seu projeto:
   Firebase Console > Configurações do projeto > Seus apps > Web

   Enquanto estiver com os valores "SEU_..." o site funciona
   normalmente, mas só com o conteúdo padrão (sem salvar nada).
   ========================================================== */

export const firebaseConfig = {
  apiKey: "AIzaSyCRS9BtAF-t4Ed3Mv9VnFQ03AqCf_CcXhw",
  authDomain: "ponto-da-moda-13930.firebaseapp.com",
  projectId: "ponto-da-moda-13930",
  storageBucket: "ponto-da-moda-13930.firebasestorage.app",
  messagingSenderId: "756805621715",
  appId: "1:756805621715:web:47b294a3373ab302464126"
};

/* true quando a configuração já foi preenchida de verdade */
export const isConfigured = !String(firebaseConfig.apiKey).startsWith("SEU_");
