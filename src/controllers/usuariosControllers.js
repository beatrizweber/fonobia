export const usuariosController = {
    
    async get_u (request, reply, sql) {
        const resultado = await sql.query('SELECT * FROM usuarios');
    },

    async post_u (request, reply, sql) {
        const body = request.body;
        if (!body || !body.nome || !body.email || !body.senha_hash || !body.tipo) {
            reply.status(400).send({error: "Existe algum dado faltando, por favor tente novamente!"});
        }
        const resultado = await sql.query(`INSERT INTO usuario (nome, email, senha_hash, tipo) VALUES ($1, $2, $3, $4)`);
        reply.status(200).send({message: "Seus dados foram inseridos corretamente!"});
    },

    async put_u (request, reply, sql) {
        const id = request.params.id;
        const body = request.body;

        const resultado = await sql.query();
        const nomeAtualizado = resultado.rows[0].nome
        
        if (resultado.rows.length === 0) {
            reply.status(400).send({error: "O ID inserido não foi encontrado no sistema!"})
        }

        reply.status(200).send({message: "Os dados do usuário: " + nomeAtualizado + " foram atualizados!"});

    },

    async delete_u (request, reply, sql) {
        const id = request.params.id;
        const resultado = await sql.query();
        reply.status(200).send({message: "O usuário com o id: " + id + " foi deletado com sucesso!"})
    }
}
