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

app.listen(port, () => {
    console.log(`Servidor em execução: http://localhost:${port}`);

});
