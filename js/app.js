let convidados=[];

const lista=document.getElementById("lista");

const pesquisa=document.getElementById("pesquisa");

window.onload=iniciar;

async function iniciar(){

const resposta=

await apiGet("convidados");

convidados=resposta.dados;

desenhar(convidados);

}

pesquisa.oninput=filtrar;

function filtrar(){

const t=

pesquisa.value.toLowerCase();

desenhar(

convidados.filter(c=>

c.nomeExibicao.toLowerCase().includes(t)

||

c.nomeCompleto.toLowerCase().includes(t)

)

);

}

function desenhar(listaConvidados){

lista.innerHTML="";

listaConvidados.forEach(c=>{

const div=document.createElement("div");

div.className="card";

div.innerHTML=`

<div>

<div class="nome">

${c.nomeExibicao}

</div>

<div class="mesa">

Mesa ${c.mesaAtual||c.mesaPlanejada||"-"}

</div>

</div>

<div class="status ${c.checkin?'presente':'ausente'}"></div>

`;

div.onclick=()=>abrirGrupo(c.id);

lista.appendChild(div);

});

}
