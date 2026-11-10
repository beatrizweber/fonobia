import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShieldCheck } from 'lucide-react';

const SECOES = [
  {
    titulo: '1. Introdução',
    texto: `Usar tecnologia a favor da sua audição deve ser simples. Se você acabou de receber seu aparelho, tem dúvidas sobre manutenção ou busca dicas para uma adaptação mais confortável, está no lugar certo.

O AjudaÁudio é uma iniciativa social dedicada a oferecer suporte acessível, informações claras e orientações práticas para usuários de aparelhos auditivos e seus cuidadores.`,
    itens: [
      'Guia de Adaptação: Dicas para os primeiros meses de uso.',
      'Cuidados diários: Como limpar, armazenar e prolongar a vida do seu aparelho.',
      'Apoio e Comunidade: Respostas para as suas principais dúvidas.',
    ],
  },
  {
    titulo: '2. Quais dados coletamos',
    texto: `Para realizar o cadastro e login no site, a AjudaAúdio coleta os seguintes dados pessoais dos beneficiários:`,
    itens: [
      'Nome completo',
      'E-mail',
      'Senha (armazenada de forma criptografada)',
      'Data de nascimento',
      'Número do cartão do SUS',
      'Modelo do aparelho auditivo',
      'Lado de uso do aparelho (direito, esquerdo ou bilateral)',
    ],
    textoApos: `
    2.1 Dados sensíveis
Informamos que o número do cartão do SUS, o modelo do aparelho auditivo e o lado de uso são considerados dados sensíveis de saúde, nos termos do artigo 5º, inciso II, da Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). Por esse motivo, esses dados recebem tratamento diferenciado, com medidas de segurança reforçadas e coleta mediante consentimento específico e destacado do titular.

2.2 Dados de menores de idade
Caso o beneficiário seja menor de 18 anos, a coleta de seus dados pessoais e sensíveis somente será realizada mediante consentimento específico e em destaque de ao menos um dos pais ou do responsável legal, conforme o artigo 14 da LGPD.`,
  },
  {
    titulo: '3. Como usamos os seus dados',
    texto: `Utilizamos os dados coletados para as seguintes finalidades:`,
    itens: [
      'Nome, e-mail e senha do beneficiário: utilizados para criar, autenticar e gerenciar a conta no site.',
      'Data de nascimento: confirmar a identidade do beneficiário e, quando aplicável, identificar a necessidade de consentimento do responsável legal.',
      'Número do cartão do SUS: identificar o beneficiário e vincular seu cadastro ao atendimento prestado pelo Sistema Único de Saúde.',
      'Modelo do aparelho e lado de uso: prestar o serviço de forma adequada às necessidades auditivas do beneficiário, incluindo suporte técnico e acompanhamento.',
    ],
    textoApos: `Todos esses tratamentos estão de acordo com as normas da Lei Geral de Proteção de Dados (LGPD).

De forma geral, esses dados são utilizados para: prestar o serviço de forma eficiente e segura, autenticar o acesso do beneficiário à sua conta, vincular o atendimento ao cadastro do beneficiário no SUS, garantir a segurança e a integridade das informações armazenadas e cumprir obrigações legais e regulatórias aplicáveis ao setor de saúde.`,
  },
  {
    titulo: '4. Com quem compartilhamos seus dados',
    texto: `O compartilhamento é limitado ao necessário para a prestação do serviço:

    Equipe de Administração AjudaÁudio: Acessamos suas informações apenas para gestão técnica, auditoria e manutenção da plataforma.

    Fonoaudiólogos e Estagiários Voluntários: Profissionais aprovados recebem acesso aos dados do seu perfil (como modelo do aparelho e histórico da sessão) apenas durante o atendimento humano.

    Proteção Técnica de Credenciais: Sua senha é criptografada no banco, o que significa que ninguém — nem administradores, nem voluntários — tem acesso à sua senha original.

    Não Compartilhamento Externo: Não realizamos transferência ou difusão dos seus dados para terceiros, parceiros comerciais ou empresas de publicidade.`,
  },
  {
    titulo: '5. Seus direitos (LGPD)',
    texto: `Como Titular dos dados, a Lei Geral de Proteção de Dados (LGPD) garante a você pleno controle sobre suas informações. Você pode exercer os seguintes direitos a qualquer momento:

    Confirmação e Acesso: Solicitar a confirmação de que realizamos o Tratamento dos seus dados e acessar as informações do seu cadastro.

    Correção: Pedir a alteração imediata de dados incompletos, inexatos ou desatualizados (como e-mail, cartão SUS ou modelo do aparelho).

    Oposição ao Tratamento: Direito de se opor ao Tratamento de seus Dados Pessoais em situações específicas onde você não concorde com a forma como a informação é utilizada.

    Eliminação: Solicitar a exclusão definitiva do seu cadastro e das suas mensagens da base de dados da plataforma.

    Transparência e Informação: Solicitar esclarecimentos adicionais sobre as medidas de Segurança adotadas e a forma como seus dados são manuseados internamente.
`,
  },
  {
    titulo: '6. Segurança dos dados',
    texto: `Levamos a proteção dos seus dados a sério e adotamos medidas técnicas e organizacionais para reduzir os riscos de acesso não autorizado, perda ou uso indevido das suas informações. Entre as medidas que usamos:

• Senhas nunca são armazenadas em texto puro — usamos um algoritmo de hash criptográfico (bcrypt) que torna a senha original irrecuperável, mesmo por nós.
• O acesso à plataforma é protegido por autenticação (login com e-mail e senha) e cada conta só enxerga as informações que lhe dizem respeito, de acordo com seu perfil (paciente, voluntário ou administrador).
• Tentativas repetidas de login são automaticamente bloqueadas por um tempo, como proteção contra tentativas de invasão.
• O cadastro de voluntários (fonoaudiólogos e estagiários) passa por uma análise manual antes da liberação, e o histórico de aprovações/recusas é registrado para fins de auditoria interna.
• O acesso ao painel administrativo é restrito a um número reduzido de pessoas responsáveis pelo projeto.

Você tem controle sobre os seus próprios dados: a qualquer momento, na sua página de Perfil, é possível baixar uma cópia de tudo o que guardamos sobre você ou solicitar a exclusão da sua conta. Ao excluir a conta, seus dados de identificação (nome, e-mail) são removidos e substituídos por um registro anônimo — o histórico de atendimentos já realizados é mantido de forma despersonalizada, pois também pertence à outra pessoa envolvida na conversa (paciente ou voluntário), mas deixa de te identificar.

Nenhum sistema é 100% imune a falhas. Caso identifiquemos um incidente de segurança que possa gerar risco ou dano relevante aos seus dados, iremos comunicar às pessoas afetadas e à Autoridade Nacional de Proteção de Dados (ANPD), conforme exige a LGPD, informando o que aconteceu e quais medidas estão sendo tomadas.

Por ser um projeto desenvolvido por estudantes no contexto de uma competição escolar (STEM Racing – SESI SENAI), reforçamos: fazemos o nosso melhor dentro do conhecimento técnico que temos, mas não somos uma empresa com estrutura de segurança de nível corporativo. Evite compartilhar, pelo chat, informações mais sensíveis do que o necessário para o seu atendimento (como dados bancários, senhas de outros serviços, etc.).
`,
  },
  {
    titulo: '7. Termos de Uso da Plataforma',
    texto: `Ao criar uma conta no AjudaÁudio, você concorda com os termos abaixo.

O que é o AjudaÁudio
Somos um projeto social desenvolvido por estudantes da SESI SENAI Interlagos para a competição STEM Racing. A plataforma conecta pessoas que usam aparelho auditivo (incluindo modelos recebidos pelo SUS) a fonoaudiólogos e estagiários de fonoaudiologia voluntários, para tirar dúvidas sobre uso, manutenção e cuidados com o aparelho.

Isso NÃO é um serviço de telemedicina nem substitui uma consulta profissional presencial. As orientações recebidas pelo chat (seja da assistente virtual Zélia, seja de um voluntário humano) têm caráter informativo e não constituem diagnóstico, receita ou tratamento clínico. Em caso de emergência ou piora dos sintomas, procure uma unidade de saúde.

Cadastro e conta
Você deve fornecer informações verdadeiras no cadastro. Fonoaudiólogos e estagiários devem informar corretamente seu registro profissional (CRFa) ou comprovante de vínculo acadêmico — essas informações passam por uma checagem manual da administração antes da liberação da conta, mas o AjudaÁudio não substitui a verificação oficial feita pelos conselhos profissionais; a responsabilidade pela veracidade das informações prestadas é de quem se cadastra.

Você é responsável por manter sua senha em sigilo e por tudo o que acontecer na sua conta. Avise a administração se suspeitar de acesso indevido.

Regras de uso
Ao usar a plataforma, você concorda em não:
• fornecer informações falsas sobre si ou sobre sua formação profissional;
• usar o chat para fins diferentes de orientação sobre aparelhos auditivos (spam, assédio, conteúdo ofensivo, discriminatório ou ilegal);
• tentar acessar contas, dados ou áreas do sistema que não sejam seus;
• enviar, pelo recurso de anexos, arquivos que não sejam fotos/vídeos relacionados ao seu atendimento.

O uso indevido pode levar à suspensão ou exclusão da conta pela administração, a qualquer momento, sem aviso prévio em casos graves.

Conteúdo enviado
As mensagens, fotos e vídeos que você envia no chat continuam sendo seus, mas você autoriza que fiquem armazenados na plataforma como parte do histórico daquele atendimento, visível para a outra pessoa envolvida na conversa e para a administração (para fins de moderação e suporte).

Disponibilidade do serviço
Por ser um projeto escolar, mantido voluntariamente por estudantes, não garantimos disponibilidade contínua, ausência de erros, ou que o serviço continuará existindo indefinidamente. Podemos alterar, suspender ou encerrar funcionalidades a qualquer momento.

Limitação de responsabilidade
O AjudaÁudio é um espaço de conexão e orientação geral. Não nos responsabilizamos por decisões clínicas tomadas com base nas conversas do chat, nem pela conduta de voluntários fora do âmbito da orientação básica — o vínculo de responsabilidade profissional (ética, técnica) é sempre entre o voluntário e seus respectivos conselhos/instituições de ensino.

Alterações nestes termos
Podemos atualizar estes Termos de Uso e a Política de Privacidade conforme o projeto evolui. Alterações relevantes serão sinalizadas nesta página, com a data da última atualização.

Este projeto é regido pelas leis brasileiras, incluindo a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
`,
  },
  {
    titulo: '8. Isenção de responsabilidade médica',
    texto: `Apenas para Fins Informativos: Tudo o que você encontrar neste site, como textos, imagens e gráficos, serve apenas para educar e informar você.

Não Substitui Aconselhamento Médico: Nada do que está escrito aqui deve ser usado como um diagnóstico ou como um tratamento médico. Se você tiver qualquer dúvida sobre sua saúde ou tratamentos, procure sempre o seu médico ou um profissional de saúde qualificado.

Casos de Emergência: Se você sentir que está passando por uma emergência médica, ligue logo para o seu médico ou para o serviço de emergência local (como o SAMU pelo número 192).

Isenção de Garantias: Nunca deixe de seguir os conselhos do seu médico ou demore para procurar ajuda por causa de algo que você leu neste site. Você deve entender que usar as informações fornecidas por esta página é por sua conta e risco.
`,
  },
  {
    titulo: '9. Contato',
    texto: `Se você tiver qualquer dúvida ou questionamento sobre nosso Aviso de Privacidade ou sobre o tratamento dos seus Dados pela Ajuda Áudio, entre em contato conosco pelo email de contato disponibilizado abaixo.
    
    interlagos.escuderia@gmail.com`,
  },
];

export default function Privacidade() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans">
      <Header />

      <main className="flex-1 container mx-auto max-w-3xl px-4 py-12">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-8 h-8 text-[#0d9488]" />
          <h1 className="text-3xl font-extrabold text-slate-900">Política de Privacidade e Termos de Uso</h1>
        </div>
        <p className="text-sm text-slate-500 mb-10">Última atualização: 09/09/2026</p>

        <div className="space-y-8">
          {SECOES.map((secao) => (
            <section key={secao.titulo}>
              <h2 className="text-lg font-bold text-slate-800 mb-2">{secao.titulo}</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{secao.texto}</p>
              {secao.itens && (
                <ul className="mt-3 space-y-1.5 list-disc list-inside text-slate-600 leading-relaxed">
                  {secao.itens.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {secao.textoApos && (
                <p className="mt-3 text-slate-600 leading-relaxed whitespace-pre-line">{secao.textoApos}</p>
              )}
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
