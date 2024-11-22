const express = require('express');
const fs = require('fs').promises; // Para leitura assíncrona de arquivos
const path = require('path');
const app = express();
const PORT = 3001;

// Middleware para processar JSON e dados de formulário
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Função para ler o arquivo de questões
async function carregarQuestoes() {
    try {
        const caminhoArquivo = path.join(__dirname, 'questoes.json');
        const dados = await fs.readFile(caminhoArquivo, 'utf8');
        return JSON.parse(dados);
    } catch (erro) {
        console.error('Erro ao ler arquivo de questões:', erro);
        return null;
    }
}

// Rota principal
app.get('/', (req, res) => {
    res.json({ mensagem: 'Bem-vindo ao questionário!' });
});

// Rota para obter todas as questões
app.get('/questoes', async (req, res) => {
    try {
        const questionario = await carregarQuestoes();
        if (!questionario) {
            return res.status(500).json({ erro: 'Erro ao carregar questões' });
        }
        res.json(questionario);
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao processar requisição' });
    }
});

// Rota para obter uma questão específica por ID
app.get('/questoes/:id', async (req, res) => {
    try {
        const questionario = await carregarQuestoes();
        if (!questionario) {
            return res.status(500).json({ erro: 'Erro ao carregar questões' });
        }

        const questao = questionario.perguntas.find(q => q.id === parseInt(req.params.id));
        if (!questao) {
            return res.status(404).json({ erro: 'Questão não encontrada' });
        }
        res.json(questao);
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao processar requisição' });
    }
});

// Rota para verificar resposta
app.post('/verificar-resposta', async (req, res) => {
    try {
        const { questaoId, resposta } = req.body;
        const questionario = await carregarQuestoes();
        if (!questionario) {
            return res.status(500).json({ erro: 'Erro ao carregar questões' });
        }

        const questao = questionario.perguntas.find(q => q.id === parseInt(questaoId));
        if (!questao) {
            return res.status(404).json({ erro: 'Questão não encontrada' });
        }

        // Lógica de verificação de resposta
        // Nota: Você pode adicionar a lógica específica de verificação aqui
        res.json({
            recebido: true,
            questao: questao.texto,
            respostaEnviada: resposta
        });
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao processar requisição' });
    }
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ erro: 'Algo deu errado!' });
});

// Rota para lidar com endpoints não encontrados
app.use((req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada' });
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
