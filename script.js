const formulario = document.getElementById("formulario");
const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const campoEstado = document.getElementById("estado");
const campoCidade = document.getElementById("cidade");
const filtroCidades = document.getElementById("filtro-cidades");
const quantidadeCidades = document.getElementById("quantidade-cidades");
const mensagem = document.getElementById("mensagem");
const resumo = document.getElementById("resumo");
const textoResumo = document.getElementById("texto-resumo");

let listaCidades = [];
let consultaAtual = 0;

function mostrarMensagem(texto, tipo = "") {
    mensagem.textContent = texto;
    mensagem.className = tipo;
}

function preencherCidades(cidades) {
    campoCidade.innerHTML = "";

    const opcaoInicial = document.createElement("option");
    opcaoInicial.value = "";
    opcaoInicial.textContent = "Selecione uma cidade";
    campoCidade.appendChild(opcaoInicial);

    const textoFiltro = filtroCidades.value
        .trim()
        .toLocaleLowerCase("pt-BR");

    const cidadesFiltradas = cidades.filter((cidade) =>
        cidade.nome.toLocaleLowerCase("pt-BR").includes(textoFiltro)
    );

    cidadesFiltradas.forEach((cidade) => {
        const opcao = document.createElement("option");
        opcao.value = cidade.nome;
        opcao.textContent = cidade.nome;
        campoCidade.appendChild(opcao);
    });

    if (cidadesFiltradas.length === 0) {
        const opcao = document.createElement("option");
        opcao.value = "";
        opcao.textContent = "Nenhuma cidade encontrada";
        campoCidade.appendChild(opcao);
    }
}

async function carregarEstados() {
    campoEstado.disabled = true;
    campoEstado.innerHTML =
        '<option value="">Carregando estados...</option>';

    mostrarMensagem("Buscando estados...");

    try {
        const resposta = await fetch(
            "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
        );

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os estados.");
        }

        const estados = await resposta.json();

        campoEstado.innerHTML =
            '<option value="">Selecione um estado</option>';

        estados.forEach((estado) => {
            const opcao = document.createElement("option");
            opcao.value = estado.sigla;
            opcao.textContent = estado.nome;
            campoEstado.appendChild(opcao);
        });

        campoEstado.disabled = false;
        mostrarMensagem("Estados carregados. Selecione um estado.");
    } catch (erro) {
        campoEstado.innerHTML =
            '<option value="">Erro ao carregar estados</option>';

        mostrarMensagem(
            "Erro ao carregar os estados. Verifique sua conexão e tente novamente.",
            "erro"
        );
    }
}

async function carregarCidades() {
    const siglaEstado = campoEstado.value;
    const numeroConsulta = ++consultaAtual;

    listaCidades = [];
    campoCidade.innerHTML = "";
    campoCidade.disabled = true;
    filtroCidades.value = "";
    filtroCidades.disabled = true;
    quantidadeCidades.textContent = "";
    resumo.hidden = true;

    if (!siglaEstado) {
        campoCidade.innerHTML =
            '<option value="">Selecione um estado primeiro</option>';

        mostrarMensagem("Selecione um estado para carregar as cidades.");
        return;
    }

    campoCidade.innerHTML =
        '<option value="">Carregando...</option>';

    mostrarMensagem("Carregando cidades...");

    try {
        const resposta = await fetch(
            `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${siglaEstado}/municipios`
        );

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar as cidades.");
        }

        const cidades = await resposta.json();

        if (numeroConsulta !== consultaAtual) {
            return;
        }

        listaCidades = cidades;

        preencherCidades(listaCidades);

        campoCidade.disabled = false;
        filtroCidades.disabled = false;

        const nomeEstado =
            campoEstado.options[campoEstado.selectedIndex].textContent;

        quantidadeCidades.textContent =
            `${nomeEstado} possui ${listaCidades.length} municípios.`;

        mostrarMensagem("Cidades carregadas.");
    } catch (erro) {
        if (numeroConsulta === consultaAtual) {
            campoCidade.innerHTML =
                '<option value="">Erro ao carregar cidades</option>';

            mostrarMensagem(
                "Erro ao carregar as cidades. Selecione novamente o estado para tentar outra vez.",
                "erro"
            );
        }
    }
}

campoEstado.addEventListener("change", carregarCidades);

filtroCidades.addEventListener("input", () => {
    preencherCidades(listaCidades);
});

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    resumo.hidden = true;

    const nome = campoNome.value.trim();
    const email = campoEmail.value.trim();
    const siglaEstado = campoEstado.value;
    const cidade = campoCidade.value;

    if (!nome || !email || !siglaEstado || !cidade) {
        mostrarMensagem(
            "Preencha todos os campos e selecione uma cidade.",
            "erro"
        );
        return;
    }

    if (!campoEmail.checkValidity()) {
        mostrarMensagem("Digite um e-mail válido.", "erro");
        campoEmail.focus();
        return;
    }

    const nomeEstado =
        campoEstado.options[campoEstado.selectedIndex].textContent;

    textoResumo.textContent =
        `${nome}, de ${cidade}/${siglaEstado}, inscrito com sucesso.`;

    resumo.hidden = false;

    mostrarMensagem(
        `Inscrição validada para o estado ${nomeEstado}.`,
        "sucesso"
    );
});

carregarEstados();