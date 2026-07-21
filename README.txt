FRONTEND — RECEPÇÃO BABR

1. Extraia o conteúdo na raiz do repositório do GitHub Pages.

2. Abra:
   js/config.js

3. Substitua:
   COLE_AQUI_A_URL_DO_WEB_APP

   pela URL terminada em /exec da implantação do Apps Script.

4. Estrutura:

   index.html
   autoridades.html
   mesas.html
   dashboard.html
   css/style.css
   js/config.js
   js/api.js
   js/util.js
   js/recepcao.js
   js/autoridades.js
   js/mesas.js
   js/dashboard.js

5. Páginas:

   index.html
   Pesquisa por grupo e check-in individual dos membros.

   autoridades.html
   Exibe somente autoridades com CHECKIN = SIM e
   CONFIRMAR_AUTORIDADE ainda não marcado.

   mesas.html
   Ocupação das mesas e alteração da mesa atual.

   dashboard.html
   Totais, ocupação e últimos check-ins.

6. IMPORTANTE SOBRE CONFIRMAR_AUTORIDADE

   Para aparecer na página autoridades.html, a pessoa deve ter:
   AUTORIDADE = SIM
   CHECKIN = SIM
   CONFIRMAR_AUTORIDADE vazio

   Ao clicar em "Confirmar presença", o sistema grava:
   CONFIRMAR_AUTORIDADE = SIM

7. Depois de alterar js/config.js, faça commit e aguarde a publicação
   do GitHub Pages.
