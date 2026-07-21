let convidados=[];

const lista =
document.getElementById("lista");

const pesquisa =
document.getElementById("pesquisa");

window.onload = iniciar;

async function iniciar(){

    convidados =
    await carregarConvidados();

    desenhar(convidados);

}

pesquisa.onkeyup = ()=>{

    const t =
    pesquisa.value
    .toLowerCase();

    const f =
    convidados.filter(c=>{

        return c.nomeExibicao
        .toLowerCase()
        .includes(t)

        ||

        c.nomeCompleto
        .toLowerCase()
        .includes(t);

    });

    desenhar(f);

};

function desenhar(listaConvidados){

lista.innerHTML="";

listaConvidados.forEach(c=>{

const card =
document.createElement("div");

card.className="card";

card.innerHTML=`

<div>

<strong>${c.nomeExibicao}</strong>

<br>

Mesa:
${c.mesaAtual || c.mesaPlanejada || "-"}

</div>

<div>

${c.checkin=="SIM"

?"🟢"

:"⚪"}

</div>

`;

card.onclick=()=>{

abrir(c);

};

lista.appendChild(card);

});

}

function abrir(c){

alert(c.nomeExibicao);

}
