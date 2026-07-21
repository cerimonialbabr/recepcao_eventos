const API="https://script.google.com/macros/s/AKfycbyydFstY24y3Bt5YZjiT8BZeDEMt9_eH3YD1POJpP14ksI5Eb7L14TSglb8qhHD9Ko_/exec";

async function apiGet(acao,param={}){

const url=new URL(API);

url.searchParams.append("acao",acao);

Object.keys(param).forEach(k=>{

url.searchParams.append(k,param[k]);

});

const r=await fetch(url);

return await r.json();

}

async function apiPost(body){

const r=await fetch(API,{

method:"POST",

body:JSON.stringify(body)

});

return await r.json();

}
