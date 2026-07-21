const API =
"https://script.google.com/macros/s/AKfycbyydFstY24y3Bt5YZjiT8BZeDEMt9_eH3YD1POJpP14ksI5Eb7L14TSglb8qhHD9Ko_/exec";

async function carregarConvidados(){

    const r =
    await fetch(API+"?acao=convidados");

    return await r.json();

}

async function carregarAutoridades(){

    const r =
    await fetch(API+"?acao=autoridades");

    return await r.json();

}

async function carregarMesas(){

    const r =
    await fetch(API+"?acao=mesas");

    return await r.json();

}
