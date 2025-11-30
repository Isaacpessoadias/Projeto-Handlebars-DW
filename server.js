const express = require('express');
const exphbs = require('express-handlebars');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.engine('handlebars', exphbs.engine({
    defaultLayout: false, 
    helpers: {
        eq: (a, b) => a === b
    }}));
app.set('view engine', 'handlebars');

let tutores = [
    {id: 1, nome: "João Silva", telefone: "(11) 99999-1111", email: "joao@email.com"},
    {id: 2, nome: "Maria Santos", telefone: "(11) 99999-2222", email: "maria@email.com"},
    {id: 3, nome: "Pedro Oliveira", telefone: "(11) 99999-3333", email: "pedro@email.com"},
];

let animais = [
    {id: 1, nome: "Rex", especie: "cachorro", raca: "Labrador", idade: 3, tutorId: 1},
    {id: 2, nome: "Mimi", especie: "gato", raca: "Persa", idade: 2, tutorId: 2},
    {id: 3, nome: "Bolinha", especie: "cachorro", raca: "Bulldog", idade: 5, tutorId: 1},
];

let agendamentos = [
    {id: 1, animalId: 1, tipoVacina: "V8", data: "2024-12-20", horario: "10:00", status: "agendado"},
    {id: 2, animalId: 2, tipoVacina: "Antirrábica", data: "2024-12-18", horario: "14:30", status: "realizado"},
    {id: 3, animalId: 3, tipoVacina: "V10", data: "2024-12-22", horario: "09:00", status: "agendado"},
];

app.get('/', (req, res) => {
    res.render('home');
})


app.get('/tutores', (req, res) => {
    res.render('listarTutores', {tutores});
});

app.get('/tutores/novo', (req, res) => {
    res.render('cadastrarTutor');
});

app.post('/tutores', (req, res) => {
    const {nome, telefone, email} = req.body;
    const novoTutor = {
        id: tutores.length > 0 ? Math.max(...tutores.map(t => t.id)) + 1 : 1,
        nome: nome,
        telefone: telefone,
        email: email
    };
    tutores.push(novoTutor);
    res.redirect('/tutores');
});

app.get('/tutores/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const tutor = tutores.find(t => t.id === id);
    if (tutor) {
        res.render('detalharTutor', {tutor});
    } else {
        res.status(404).send('Tutor não encontrado');
    }
});

app.get('/tutores/:id/editar', (req, res) => {
    const id = parseInt(req.params.id);
    const tutor = tutores.find(t => t.id === id);
   
    if(!tutor)
        return res.status(404).send('Tutor não encontrado.');

    res.render('editarTutor', {tutor});
});

app.post('/tutores/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const tutor = tutores.find(t => t.id === id);
    if (tutor) {
        tutor.nome = req.body.nome;
        tutor.telefone = req.body.telefone;
        tutor.email = req.body.email;
        res.redirect('/tutores');
    } else {
        res.status(404).send('Tutor não encontrado');
    }
});

app.post('/tutores/:id/excluir', (req, res) => {
    const id = parseInt(req.params.id);
    const index = tutores.findIndex(t => t.id === id);

    if(index !== -1) {
        tutores.splice(index, 1);
        res.redirect('/tutores');
    } else {
        return res.status(404).send('Tutor não encontrado.');
    }
});

app.get('/animais', (req, res) => {
    const animaisComTutor = animais.map(a => {
        const tutor = tutores.find(t => t.id === a.tutorId);
        return {
            ...a,
            tutorNome: tutor ? tutor.nome : 'Não informado'
        };
    });
    res.render('listarAnimais', {animais: animaisComTutor});
});

app.get('/animais/novo', (req, res) => {
    res.render('cadastrarAnimal', {tutores});
});

app.post('/animais', (req, res) => {
    const {nome, especie, raca, idade, tutorId} = req.body;
    const novoAnimal = {
        id: animais.length > 0 ? Math.max(...animais.map(a => a.id)) + 1 : 1,
        nome: nome,
        especie: especie,
        raca: raca,
        idade: parseInt(idade),
        tutorId: parseInt(tutorId)
    };
    animais.push(novoAnimal);
    res.redirect('/animais');
});

app.get('/animais/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const animal = animais.find(a => a.id === id);
    if (animal) {
        const tutor = tutores.find(t => t.id === animal.tutorId);
        res.render('detalharAnimal', {
            animal: {
                ...animal,
                tutorNome: tutor ? tutor.nome : 'Não informado'
            }
        });
    } else {
        res.status(404).send('Animal não encontrado');
    }
});

app.get('/animais/:id/editar', (req, res) => {
    const id = parseInt(req.params.id);
    const animal = animais.find(a => a.id === id);
   
    if(!animal)
        return res.status(404).send('Animal não encontrado.');

    res.render('editarAnimal', {animal, tutores});
});

app.post('/animais/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const animal = animais.find(a => a.id === id);
    if (animal) {
        animal.nome = req.body.nome;
        animal.especie = req.body.especie;
        animal.raca = req.body.raca;
        animal.idade = parseInt(req.body.idade);
        animal.tutorId = parseInt(req.body.tutorId);
        res.redirect('/animais');
    } else {
        res.status(404).send('Animal não encontrado');
    }
});

app.post('/animais/:id/excluir', (req, res) => {
    const id = parseInt(req.params.id);
    const index = animais.findIndex(a => a.id === id);

    if(index !== -1) {
        animais.splice(index, 1);
        res.redirect('/animais');
    } else {
        return res.status(404).send('Animal não encontrado.');
    }
});

app.get('/agendamentos', (req, res) => {
    const agendamentosComDados = agendamentos.map(ag => {
        const animal = animais.find(a => a.id === ag.animalId);
        const tutor = animal ? tutores.find(t => t.id === animal.tutorId) : null;
        return {
            ...ag,
            animalNome: animal ? animal.nome : 'Não informado',
            animalEspecie: animal ? animal.especie : '',
            tutorNome: tutor ? tutor.nome : 'Não informado'
        };
    });
    res.render('listarAgendamentos', {agendamentos: agendamentosComDados});
});

app.get('/agendamentos/novo', (req, res) => {
    res.render('cadastrarAgendamento', {animais});
});

app.post('/agendamentos', (req, res) => {
    const {animalId, tipoVacina, data, horario, status} = req.body;
    const novoAgendamento = {
        id: agendamentos.length > 0 ? Math.max(...agendamentos.map(a => a.id)) + 1 : 1,
        animalId: parseInt(animalId),
        tipoVacina: tipoVacina,
        data: data,
        horario: horario,
        status: status
    };
    agendamentos.push(novoAgendamento);
    res.redirect('/agendamentos');
});

app.get('/agendamentos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const agendamento = agendamentos.find(a => a.id === id);
    if (agendamento) {
        const animal = animais.find(a => a.id === agendamento.animalId);
        const tutor = animal ? tutores.find(t => t.id === animal.tutorId) : null;
        res.render('detalharAgendamento', {
            agendamento: {
                ...agendamento,
                animal: animal,
                tutor: tutor
            }
        });
    } else {
        res.status(404).send('Agendamento não encontrado');
    }
});

app.get('/agendamentos/:id/editar', (req, res) => {
    const id = parseInt(req.params.id);
    const agendamento = agendamentos.find(a => a.id === id);
   
    if(!agendamento)
        return res.status(404).send('Agendamento não encontrado.');

    res.render('editarAgendamento', {agendamento, animais});
});

app.post('/agendamentos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const agendamento = agendamentos.find(a => a.id === id);
    if (agendamento) {
        agendamento.animalId = parseInt(req.body.animalId);
        agendamento.tipoVacina = req.body.tipoVacina;
        agendamento.data = req.body.data;
        agendamento.horario = req.body.horario;
        agendamento.status = req.body.status;
        res.redirect('/agendamentos');
    } else {
        res.status(404).send('Agendamento não encontrado');
    }
});

app.post('/agendamentos/:id/excluir', (req, res) => {
    const id = parseInt(req.params.id);
    const index = agendamentos.findIndex(a => a.id === id);

    if(index !== -1) {
        agendamentos.splice(index, 1);
        res.redirect('/agendamentos');
    } else {
        return res.status(404).send('Agendamento não encontrado.');
    }
});
// CRUD PRODUTOS
// Listar produtos
let produtos = [
    {id: 1, nome: "Ração Premium", preco: 120.00, estoque: 15},
    {id: 2, nome: "Coleira", preco: 35.00, estoque: 40},
    {id: 3, nome: "Brinquedo", preco: 20.00, estoque: 25},
];


app.get('/produtos', (req, res) => {
    res.render('listarProdutos', {produtos});
});

// Página novo produto
app.get('/produtos/novo', (req, res) => {
    res.render('cadastrarProduto');
});

// Criar produto
app.post('/produtos', (req, res) => {
    const {nome, preco, estoque} = req.body;

    const novo = {
        id: produtos.length ? Math.max(...produtos.map(p => p.id)) + 1 : 1,
        nome,
        preco: parseFloat(preco),
        estoque: parseInt(estoque)
    };

    produtos.push(novo);
    res.redirect('/produtos');
});

// Detalhar produto
app.get('/produtos/:id', (req, res) => {
    const produto = produtos.find(p => p.id === parseInt(req.params.id));
    if (!produto) return res.status(404).send("Produto não encontrado");
    res.render('detalharProduto', {produto});
});

// Editar produto
app.get('/produtos/:id/editar', (req, res) => {
    const produto = produtos.find(p => p.id === parseInt(req.params.id));
    if (!produto) return res.status(404).send("Produto não encontrado");
    res.render('editarProduto', {produto});
});

app.post('/produtos/:id', (req, res) => {
    const produto = produtos.find(p => p.id === parseInt(req.params.id));
    if (!produto) return res.status(404).send("Produto não encontrado");

    produto.nome = req.body.nome;
    produto.preco = parseFloat(req.body.preco);
    produto.estoque = parseInt(req.body.estoque);

    res.redirect('/produtos');
});

// Excluir produto
app.post('/produtos/:id/excluir', (req, res) => {
    const index = produtos.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).send("Produto não encontrado");

    produtos.splice(index, 1);
    res.redirect('/produtos');
});
// CRUD SERVIÇOS

let servicos = [
    {id: 1, nome: "Banho", preco: 50.00, descricao: "Banho completo"},
    {id: 2, nome: "Tosa", preco: 70.00, descricao: "Tosa padrão"},
    {id: 3, nome: "Consulta", preco: 120.00, descricao: "Consulta veterinária"},
];

// Listar serviços
app.get('/servicos', (req, res) => {
    res.render('listarServicos', {servicos});
});

// Página de novo serviço
app.get('/servicos/novo', (req, res) => {
    res.render('cadastrarServico');
});

// Criar serviço
app.post('/servicos', (req, res) => {
    const {nome, preco, descricao} = req.body;

    const novo = {
        id: servicos.length > 0 ? Math.max(...servicos.map(s => s.id)) + 1 : 1,
        nome,
        preco: parseFloat(preco),
        descricao
    };

    servicos.push(novo);
    res.redirect('/servicos');
});

// Detalhar serviço
app.get('/servicos/:id', (req, res) => {
    const servico = servicos.find(s => s.id === parseInt(req.params.id));
    if (!servico) return res.status(404).send("Serviço não encontrado");
    res.render('detalharServico', {servico});
});

// Editar serviço
app.get('/servicos/:id/editar', (req, res) => {
    const servico = servicos.find(s => s.id === parseInt(req.params.id));
    if (!servico) return res.status(404).send("Serviço não encontrado");
    res.render('editarServico', {servico});
});

app.post('/servicos/:id', (req, res) => {
    const servico = servicos.find(s => s.id === parseInt(req.params.id));
    if (!servico) return res.status(404).send("Serviço não encontrado");

    servico.nome = req.body.nome;
    servico.preco = parseFloat(req.body.preco);
    servico.descricao = req.body.descricao;

    res.redirect('/servicos');
});

// Excluir serviço
app.post('/servicos/:id/excluir', (req, res) => {
    const index = servicos.findIndex(s => s.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).send("Serviço não encontrado");

    servicos.splice(index, 1);
    res.redirect('/servicos');
});
// CRRUD FUNCIONAROS

let funcionarios = [
    {id: 1, nome: "Carlos Pereira", cargo: "Veterinário", salario: 4500},
    {id: 2, nome: "Ana Souza", cargo: "Atendente", salario: 2200},
    {id: 3, nome: "Rafael Lima", cargo: "Tosador", salario: 2800},
];

// Listar funcionários
app.get('/funcionarios', (req, res) => {
    res.render('listarFuncionarios', {funcionarios});
});

// Novo funcionário
app.get('/funcionarios/novo', (req, res) => {
    res.render('cadastrarFuncionario');
});

// Criar funcionário
app.post('/funcionarios', (req, res) => {
    const {nome, cargo, salario} = req.body;

    const novo = {
        id: funcionarios.length ? Math.max(...funcionarios.map(f => f.id)) + 1 : 1,
        nome,
        cargo,
        salario: parseFloat(salario)
    };

    funcionarios.push(novo);
    res.redirect('/funcionarios');
});

// Detalhar
app.get('/funcionarios/:id', (req, res) => {
    const funcionario = funcionarios.find(f => f.id === parseInt(req.params.id));
    if (!funcionario) return res.status(404).send("Funcionário não encontrado");
    res.render('detalharFuncionario', {funcionario});
});

// Editar
app.get('/funcionarios/:id/editar', (req, res) => {
    const funcionario = funcionarios.find(f => f.id === parseInt(req.params.id));
    if (!funcionario) return res.status(404).send("Funcionário não encontrado");
    res.render('editarFuncionario', {funcionario});
});

app.post('/funcionarios/:id', (req, res) => {
    const funcionario = funcionarios.find(f => f.id === parseInt(req.params.id));
    if (!funcionario) return res.status(404).send("Funcionário não encontrado");

    funcionario.nome = req.body.nome;
    funcionario.cargo = req.body.cargo;
    funcionario.salario = parseFloat(req.body.salario);

    res.redirect('/funcionarios');
});

// Excluir
app.post('/funcionarios/:id/excluir', (req, res) => {
    const index = funcionarios.findIndex(f => f.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).send("Funcionário não encontrado");

    funcionarios.splice(index, 1);
    res.redirect('/funcionarios');
});

app.listen(port, () => {
    console.log(`Servidor em execução: http://localhost:${port}`);

});
